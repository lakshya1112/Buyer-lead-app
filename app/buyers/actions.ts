// app/buyers/actions.ts
"use server";

import { z } from "zod";
import { leadSchema, editLeadSchema } from "@/lib/schemas";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { difference } from "lodash";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize the rate limiter
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "10 s"), // 5 requests from a user per 10 seconds
  analytics: true,
});

type LeadFormData = z.infer<typeof leadSchema>;
type EditLeadFormData = z.infer<typeof editLeadSchema>;

export async function createLead(formData: LeadFormData) {
  console.log("--- CREATE LEAD ACTION STARTED ---");
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session?.user?.email) {
    return { success: false, message: "Authentication failed. Please log in." };
  }
  const userId = session.user.id;
  const userEmail = session.user.email;

  // Rate limit check
  const { success } = await ratelimit.limit(userId);
  if (!success) {
    return { success: false, message: "Too many requests. Please try again later." };
  }

  const validatedFields = leadSchema.safeParse(formData);

  if (!validatedFields.success) {
    return { success: false, message: "Validation failed.", errors: validatedFields.error.flatten().fieldErrors };
  }
  
  const data = validatedFields.data;
  try {
    await prisma.$transaction(async (tx) => {
      const newBuyer = await tx.buyers.create({
        data: { ...data, email: data.email || null, ownerId: userId, tags: [] },
      });
      await tx.buyer_history.create({
        data: { buyerId: newBuyer.id, changedBy: userEmail, diff: { status: "Created", initialData: newBuyer } },
      });
    });
  } catch (error) {
    return { success: false, message: "Database Error: Failed to create lead." };
  }

  revalidatePath("/buyers");
  redirect("/buyers");
}

export async function updateLead(leadId: string, formData: EditLeadFormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session?.user?.email) {
    return { success: false, message: "Authentication failed." };
  }
  const userId = session.user.id;
  const userEmail = session.user.email;
  
  // Rate limit check
  const { success } = await ratelimit.limit(userId);
  if (!success) {
    return { success: false, message: "Too many requests. Please try again later." };
  }

  const validatedFields = editLeadSchema.safeParse(formData);
  if (!validatedFields.success) {
    return { success: false, message: "Validation failed.", errors: validatedFields.error.flatten().fieldErrors };
  }
  const { updatedAt, ...dataToUpdate } = validatedFields.data;

  try {
    const currentLead = await prisma.buyers.findUnique({ where: { id: leadId } });
    if (!currentLead) {
      return { success: false, message: "Lead not found." };
    }
    if (new Date(updatedAt).getTime() < new Date(currentLead.updatedAt).getTime() - 1000) {
      return { success: false, message: "This record has been updated by someone else. Please refresh and try again." };
    }

    const changes: Record<string, { old: any; new: any }> = {};
    Object.keys(dataToUpdate).forEach((key) => {
      const fieldKey = key as keyof typeof dataToUpdate;
      if (currentLead[fieldKey] !== dataToUpdate[fieldKey] && dataToUpdate[fieldKey] !== null) {
        changes[fieldKey] = { old: currentLead[fieldKey], new: dataToUpdate[fieldKey] };
      }
    });

    if (Object.keys(changes).length > 0) {
      await prisma.$transaction(async (tx) => {
        await tx.buyers.update({
          where: { id: leadId, ownerId: session.user.id },
          data: { ...dataToUpdate, email: dataToUpdate.email || null },
        });
        await tx.buyer_history.create({
          data: { buyerId: leadId, changedBy: userEmail, diff: changes },
        });
      });
    }

  } catch (error) {
    return { success: false, message: "Database Error: Failed to update lead. You may not have permission to edit this record." };
  }

  revalidatePath("/buyers");
  revalidatePath(`/buyers/${leadId}`);
  redirect("/buyers");
}

export async function importLeads(leads: LeadFormData[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session?.user?.email) {
    return { success: false, message: "Authentication failed. Please log in." };
  }
  const userId = session.user.id;

  const validatedLeads = [];
  for (const lead of leads) {
    const validationResult = leadSchema.safeParse(lead);
    if (validationResult.success) {
      validatedLeads.push(validationResult.data);
    }
  }

  if (validatedLeads.length === 0) {
    return { success: false, message: "No valid leads to import." };
  }

  try {
    const result = await prisma.$transaction(
      validatedLeads.map((lead) =>
        prisma.buyers.create({
          data: {
            ...lead,
            email: lead.email || null,
            ownerId: userId,
            tags: [],
          },
        })
      )
    );

    console.log(`Successfully imported ${result.length} leads.`);
  } catch (error) {
    console.error("Database Error during import:", error);
    return { success: false, message: "Database Error: Failed to import leads." };
  }

  revalidatePath("/buyers");
  redirect("/buyers");
}
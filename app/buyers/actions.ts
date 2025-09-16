// app/buyers/actions.ts
"use server";
import { difference } from 'lodash';
import { z } from "zod";
import { leadSchema } from "@/lib/schemas";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/app/api/auth/[...nextauth]/route"; // We need to get the user session

type LeadFormData = z.infer<typeof leadSchema>;

export async function createLead(formData: LeadFormData) {
  // 1. Get the current user session
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Authentication failed. Please log in." };
  }
  const userId = session.user.id;
  const userEmail = session.user.email ?? 'Unknown';

  // 2. Validate the form data
  const validatedFields = leadSchema.safeParse(formData);

  if (!validatedFields.success) {
    console.error("Validation Errors:", validatedFields.error.flatten().fieldErrors);
    return {
      success: false,
      message: "Validation failed. Please check the fields.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const data = validatedFields.data;

  try {
    // 3. Create the buyer and the initial history entry in a transaction
    await prisma.$transaction(async (tx) => {
      const newBuyer = await tx.buyers.create({
        data: {
          ...data,
          email: data.email || null, // Ensure empty string becomes null
          ownerId: userId,
          tags: [], // Initialize tags as an empty array
        },
      });

      await tx.buyer_history.create({
        data: {
          buyerId: newBuyer.id,
          changedBy: userEmail,
          diff: { status: "Created", initialData: newBuyer },
        },
      });
    });
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, message: "Database Error: Failed to create lead." };
  }

  // 4. Revalidate the cache for the buyers page and redirect
  revalidatePath("/buyers");
  redirect("/buyers");
}

export const editLeadSchema = leadSchema.extend({
  updatedAt: z.string(),
});

type EditLeadFormData = z.infer<typeof editLeadSchema>;

export async function updateLead(leadId: string, formData: EditLeadFormData) {
  // 1. Get user session
  const session = await auth();
  if (!session?.user?.id || !session?.user?.email) {
    return { success: false, message: "Authentication failed." };
  }
  const userEmail = session.user.email;
  
  // 2. Validate form data
  const validatedFields = editLeadSchema.safeParse(formData);
  if (!validatedFields.success) {
    return { success: false, message: "Validation failed.", errors: validatedFields.error.flatten().fieldErrors };
  }
  const { updatedAt, ...dataToUpdate } = validatedFields.data;

  try {
    // 3. Concurrency Check
    const currentLead = await prisma.buyers.findUnique({ where: { id: leadId } });
    if (!currentLead) {
      return { success: false, message: "Lead not found." };
    }
    // Compare timestamps. Use a small tolerance for minor discrepancies.
    if (new Date(updatedAt).getTime() < new Date(currentLead.updatedAt).getTime() - 1000) {
      return { success: false, message: "This record has been updated by someone else. Please refresh and try again." };
    }

    // 4. Calculate what changed for the history log
    const changes: Record<string, { old: any; new: any }> = {};
    Object.keys(dataToUpdate).forEach((key) => {
      const fieldKey = key as keyof typeof dataToUpdate;
      if (currentLead[fieldKey] !== dataToUpdate[fieldKey] && dataToUpdate[fieldKey] !== null) {
        changes[fieldKey] = { old: currentLead[fieldKey], new: dataToUpdate[fieldKey] };
      }
    });

    if (Object.keys(changes).length > 0) {
      // 5. Update buyer and create history entry in a transaction
      await prisma.$transaction(async (tx) => {
        await tx.buyers.update({
          where: { id: leadId, ownerId: session.user.id }, // Security: ensure user owns the lead
          data: { ...dataToUpdate, email: dataToUpdate.email || null },
        });

        await tx.buyer_history.create({
          data: {
            buyerId: leadId,
            changedBy: userEmail,
            diff: changes,
          },
        });
      });
    }

  } catch (error) {
    console.error("Database Error:", error);
    // This could be a Prisma P2025 error if the record doesn't exist or ownerId doesn't match
    return { success: false, message: "Database Error: Failed to update lead. You may not have permission to edit this record." };
  }

  // 6. Revalidate caches and redirect
  revalidatePath("/buyers");
  revalidatePath(`/buyers/${leadId}`);
  redirect("/buyers");
}
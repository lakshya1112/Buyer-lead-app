// app/buyers/actions.ts
"use server";

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
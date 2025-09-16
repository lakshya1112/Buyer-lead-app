// lib/schemas.ts
import { z } from 'zod';
// 👇 THIS IS THE FIX: We are changing the import path to our local generated client
import { PropertyType, Bhk, Purpose, Timeline, Source, City, Status } from '@/lib/generated/prisma';

// The base object with all the fields
const leadObject = {
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Invalid email address.").optional().or(z.literal('')),
  phone: z.string().min(10, "Phone number must be at least 10 digits.").max(15, "Phone number cannot exceed 15 digits."),
  city: z.nativeEnum(City),
  propertyType: z.nativeEnum(PropertyType),
  bhk: z.nativeEnum(Bhk).optional(),
  purpose: z.nativeEnum(Purpose),
  budgetMin: z.coerce.number().int().positive().optional(),
  budgetMax: z.coerce.number().int().positive().optional(),
  timeline: z.nativeEnum(Timeline),
  source: z.nativeEnum(Source),
  notes: z.string().max(1000, "Notes cannot exceed 1000 characters.").optional(),
};

// Refinement 1: Budget Check
const budgetRefinement = (data: z.infer<z.ZodObject<typeof leadObject>>) => {
  if (data.budgetMin && data.budgetMax) {
    return data.budgetMax >= data.budgetMin;
  }
  return true;
};

// Refinement 2: BHK Check
const bhkRefinement = (data: z.infer<z.ZodObject<typeof leadObject>>) => {
  if ((data.propertyType === 'Apartment' || data.propertyType === 'Villa') && !data.bhk) {
    return false;
  }
  return true;
};

// The schema for creating a lead
export const leadSchema = z.object(leadObject)
  .refine(budgetRefinement, {
    message: "Max budget cannot be less than Min budget.",
    path: ["budgetMax"],
  })
  .refine(bhkRefinement, {
    message: "BHK is required for this property type.",
    path: ["bhk"],
  });

// The schema for editing a lead
export const editLeadSchema = z.object(leadObject)
  .extend({
    updatedAt: z.string(),
  })
  .refine(budgetRefinement, {
    message: "Max budget cannot be less than Min budget.",
    path: ["budgetMax"],
  })
  .refine(bhkRefinement, {
    message: "BHK is required for this property type.",
    path: ["bhk"],
  });

export type LeadFormState = {
  message: string;
  errors?: {
    [key in keyof z.infer<typeof leadSchema>]?: string[];
  };
};
// lib/schemas.ts
import { z } from 'zod';
import { PropertyType, Bhk, Purpose, Timeline, Source, City, Status } from '@prisma/client';

export const leadSchema = z.object({
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
  // tags and status are not in the form, they are handled programmatically
})
.refine(data => {
  // budgetMax must be greater than or equal to budgetMin if both are present
  if (data.budgetMin && data.budgetMax) {
    return data.budgetMax >= data.budgetMin;
  }
  return true;
}, {
  message: "Max budget cannot be less than Min budget.",
  path: ["budgetMax"], // Specify which field the error belongs to
})
.refine(data => {
  // BHK is required for Apartments and Villas
  if ((data.propertyType === 'Apartment' || data.propertyType === 'Villa') && !data.bhk) {
    return false;
  }
  return true;
}, {
  message: "BHK is required for this property type.",
  path: ["bhk"],
});

export type LeadFormState = {
  message: string;
  errors?: {
    [key in keyof z.infer<typeof leadSchema>]?: string[];
  };
};
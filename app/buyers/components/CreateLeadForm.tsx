// app/buyers/components/CreateLeadForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { leadSchema } from "@/lib/schemas";
import { createLead } from "../actions";
import { useRouter } from "next/navigation";
import { Bhk, City, PropertyType, Purpose, Source, Timeline } from "@/lib/generated/prisma";

type FormData = z.infer<typeof leadSchema>;

// Reusable component for form fields to reduce repetition
const FormField = ({ label, name, error, children }: { label: string, name: string, error?: string, children: React.ReactNode }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="mt-1">{children}</div>
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

export function CreateLeadForm() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm<FormData>({ resolver: zodResolver(leadSchema) });
  const watchedPropertyType = watch("propertyType");
  const onSubmit = async (data: FormData) => { await createLead(data); };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField label="Full Name *" name="fullName" error={errors.fullName?.message}>
          <input {...register("fullName")} />
        </FormField>
        <FormField label="Phone *" name="phone" error={errors.phone?.message}>
          <input {...register("phone")} />
        </FormField>
        <FormField label="Email" name="email" error={errors.email?.message}>
          <input {...register("email")} type="email" />
        </FormField>
        <FormField label="City *" name="city" error={errors.city?.message}>
          <select {...register("city")}>
            {Object.values(City).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </FormField>
        <FormField label="Property Type *" name="propertyType" error={errors.propertyType?.message}>
          <select {...register("propertyType")}>
            {Object.values(PropertyType).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </FormField>
        {(watchedPropertyType === 'Apartment' || watchedPropertyType === 'Villa') && (
          <FormField label="BHK *" name="bhk" error={errors.bhk?.message}>
            <select {...register("bhk")}>
              <option value="">Select BHK</option>
              {Object.values(Bhk).map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </FormField>
        )}
        <div className="grid grid-cols-2 col-span-1 gap-4 md:col-span-2">
            <FormField label="Min Budget" name="budgetMin" error={errors.budgetMin?.message}>
                <input {...register("budgetMin")} type="number" placeholder="e.g., 500000" />
            </FormField>
            <FormField label="Max Budget" name="budgetMax" error={errors.budgetMax?.message}>
                <input {...register("budgetMax")} type="number" placeholder="e.g., 750000" />
            </FormField>
        </div>
        <FormField label="Purpose *" name="purpose" error={errors.purpose?.message}>
          <select {...register("purpose")}>{Object.values(Purpose).map(p => <option key={p} value={p}>{p}</option>)}</select>
        </FormField>
        <FormField label="Timeline *" name="timeline" error={errors.timeline?.message}>
          <select {...register("timeline")}>{Object.values(Timeline).map(t => <option key={t} value={t}>{t}</option>)}</select>
        </FormField>
        <FormField label="Source *" name="source" error={errors.source?.message}>
          <select {...register("source")}>{Object.values(Source).map(s => <option key={s} value={s}>{s}</option>)}</select>
        </FormField>
      </div>
      <FormField label="Notes" name="notes" error={errors.notes?.message}>
        <textarea {...register("notes")} rows={4}></textarea>
      </FormField>
      <div className="flex justify-end pt-4 space-x-3 border-t">
        <button type="button" onClick={() => router.push('/buyers')} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 disabled:bg-gray-400">{isSubmitting ? "Saving..." : "Create Lead"}</button>
      </div>
    </form>
  );
}
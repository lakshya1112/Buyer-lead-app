// app/buyers/components/CreateLeadForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { leadSchema } from "@/lib/schemas";
import { createLead } from "../action";
import { useRouter } from "next/navigation";
import { Bhk, City, PropertyType, Purpose, Source, Timeline } from "@prisma/client";

type FormData = z.infer<typeof leadSchema>;

export function CreateLeadForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(leadSchema),
  });

  const watchedPropertyType = watch("propertyType");

  const onSubmit = async (data: FormData) => {
    const result = await createLead(data);
    if (result?.success === false) {
      // Handle server-side errors if needed
      alert(result.message);
    }
    // Redirect is handled by the server action on success
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Full Name */}
        <div>
          <label className="block font-medium">Full Name *</label>
          <input {...register("fullName")} className="w-full p-2 border rounded" />
          {errors.fullName && <p className="text-sm text-red-500">{errors.fullName.message}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="block font-medium">Phone *</label>
          <input {...register("phone")} className="w-full p-2 border rounded" />
          {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block font-medium">Email</label>
          <input {...register("email")} type="email" className="w-full p-2 border rounded" />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>

        {/* City */}
        <div>
          <label className="block font-medium">City *</label>
          <select {...register("city")} className="w-full p-2 border rounded">
            {Object.values(City).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Property Type */}
        <div>
          <label className="block font-medium">Property Type *</label>
          <select {...register("propertyType")} className="w-full p-2 border rounded">
            {Object.values(PropertyType).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* BHK (Conditional) */}
        {(watchedPropertyType === 'Apartment' || watchedPropertyType === 'Villa') && (
          <div>
            <label className="block font-medium">BHK *</label>
            <select {...register("bhk")} className="w-full p-2 border rounded">
              <option value="">Select BHK</option>
              {Object.values(Bhk).map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            {errors.bhk && <p className="text-sm text-red-500">{errors.bhk.message}</p>}
          </div>
        )}

        {/* Budgets */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Min Budget</label>
            <input {...register("budgetMin")} type="number" className="w-full p-2 border rounded" placeholder="e.g., 500000" />
            {errors.budgetMin && <p className="text-sm text-red-500">{errors.budgetMin.message}</p>}
          </div>
          <div>
            <label className="block font-medium">Max Budget</label>
            <input {...register("budgetMax")} type="number" className="w-full p-2 border rounded" placeholder="e.g., 750000" />
            {errors.budgetMax && <p className="text-sm text-red-500">{errors.budgetMax.message}</p>}
          </div>
        </div>

        {/* Purpose */}
        <div>
          <label className="block font-medium">Purpose *</label>
          <select {...register("purpose")} className="w-full p-2 border rounded">
            {Object.values(Purpose).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Timeline */}
        <div>
          <label className="block font-medium">Timeline *</label>
          <select {...register("timeline")} className="w-full p-2 border rounded">
            {Object.values(Timeline).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Source */}
        <div>
          <label className="block font-medium">Source *</label>
          <select {...register("source")} className="w-full p-2 border rounded">
            {Object.values(Source).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block font-medium">Notes</label>
        <textarea {...register("notes")} rows={4} className="w-full p-2 border rounded"></textarea>
        {errors.notes && <p className="text-sm text-red-500">{errors.notes.message}</p>}
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.push('/buyers')}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-white bg-blue-600 rounded disabled:bg-gray-400 hover:bg-blue-700"
        >
          {isSubmitting ? "Saving..." : "Create Lead"}
        </button>
      </div>
    </form>
  );
}
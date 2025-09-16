// app/buyers/components/FilterSelect.tsx
"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function FilterSelect({
  paramName,
  placeholder,
  options,
}: {
  paramName: string;
  placeholder: string;
  options: string[];
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleFilterChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1"); // Reset to page 1 on filter change
    if (value) {
      params.set(paramName, value);
    } else {
      params.delete(paramName);
    }
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <select
      onChange={(e) => handleFilterChange(e.target.value)}
      defaultValue={searchParams.get(paramName)?.toString() ?? ""}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
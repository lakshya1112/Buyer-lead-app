// app/buyers/import/page.tsx
import { ImportWizard } from "../components/ImportWizard";

export default function ImportPage() {
  return (
    <div className="min-h-screen">
       <header className="bg-white shadow-sm">
        <div className="p-4 mx-auto max-w-7xl">
          <h1 className="text-2xl font-bold text-gray-900">
            Import Leads from CSV
          </h1>
        </div>
      </header>

      <main className="p-4 mx-auto md:p-8 max-w-7xl">
        <ImportWizard />
      </main>
    </div>
  );
}
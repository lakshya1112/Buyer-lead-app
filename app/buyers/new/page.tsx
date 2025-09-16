// app/buyers/new/page.tsx
import { CreateLeadForm } from "../components/CreateLeadForm";

export default function NewBuyerPage() {
  return (
    <div className="p-8 mx-auto max-w-4xl">
      <h1 className="mb-6 text-3xl font-bold">Create New Lead</h1>
      <div className="p-6 bg-white rounded-lg shadow-md">
        <CreateLeadForm />
      </div>
    </div>
  );
}
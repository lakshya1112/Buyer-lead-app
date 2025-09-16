// app/buyers/components/ImportWizard.tsx
"use client";

import { useState } from 'react';
import Papa from 'papaparse';
import { leadSchema } from '@/lib/schemas';
import type { z } from 'zod';
import { importLeads } from '../actions';
import { useRouter } from 'next/navigation';

type LeadData = z.infer<typeof leadSchema>;

interface ValidatedRow {
  rowNumber: number;
  data: LeadData;
  isValid: boolean;
  errors?: string[];
}

const REQUIRED_HEADERS = [
  'fullName', 'email', 'phone', 'city', 'propertyType', 'bhk', 
  'purpose', 'budgetMin', 'budgetMax', 'timeline', 'source', 'notes',
];

export function ImportWizard() {
  const router = useRouter();
  const [step, setStep] = useState<'upload' | 'preview' | 'importing'>('upload');
  const [validatedRows, setValidatedRows] = useState<ValidatedRow[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);

  const validRows = validatedRows.filter(row => row.isValid);
  const invalidRows = validatedRows.filter(row => !row.isValid);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileError(null);
    setValidatedRows([]);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const fileHeaders = results.meta.fields || [];
        const missingHeaders = REQUIRED_HEADERS.filter(h => !fileHeaders.includes(h));
        if (missingHeaders.length > 0) {
          setFileError(`CSV is missing required headers: ${missingHeaders.join(', ')}`);
          return;
        }

        if (results.data.length > 200) {
          setFileError(`File exceeds the maximum of 200 data rows. Found ${results.data.length}.`);
          return;
        }

        const processedRows = results.data.map((row: any, index) => {
          if (row.budgetMin === '') row.budgetMin = undefined;
          if (row.budgetMax === '') row.budgetMax = undefined;
          
          const validation = leadSchema.safeParse(row);
          if (validation.success) {
            return { rowNumber: index + 2, data: validation.data, isValid: true };
          } else {
            // 👇 THIS IS THE FIX: Using .flatten() for safer error access
            const fieldErrors = validation.error.flatten().fieldErrors;
            const errorMessages = Object.entries(fieldErrors).map(([field, messages]) => 
              `${field}: ${messages.join(', ')}`
            );
            return { rowNumber: index + 2, data: row, isValid: false, errors: errorMessages };
          }
        });

        setValidatedRows(processedRows);
        setStep('preview');
      }
    });
  };

  const handleImport = async () => {
    setStep('importing');
    const leadsToImport = validRows.map(row => row.data);
    const result = await importLeads(leadsToImport);
    if (result?.success === false) {
      alert(`Import failed: ${result.message}`);
      setStep('preview');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {step === 'upload' && (
        <div>
          <h2 className="text-xl font-bold mb-4">Step 1: Upload CSV File</h2>
          <p className="mb-4 text-gray-600">Select a CSV file to import. The file must contain the required headers and have no more than 200 rows of data.</p>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {fileError && <p className="mt-4 text-red-600">{fileError}</p>}
        </div>
      )}

      {step === 'preview' && (
        <div>
          <h2 className="text-xl font-bold mb-4">Step 2: Preview and Confirm</h2>
          <div className="p-4 mb-6 bg-gray-50 rounded-md">
            <p className="font-semibold text-green-600">{validRows.length} rows are valid and ready for import.</p>
            <p className="font-semibold text-red-600">{invalidRows.length} rows have errors and will be skipped.</p>
          </div>
          
          {invalidRows.length > 0 && (
            <div className='mb-6'>
              <h3 className="font-bold mb-2">Rows with Errors</h3>
              <div className="overflow-x-auto h-64 border rounded-md">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-4 py-2">Row #</th>
                      <th className="px-4 py-2">Errors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invalidRows.map(({ rowNumber, errors }) => (
                      <tr key={rowNumber} className="border-b">
                        <td className="px-4 py-2 font-medium">{rowNumber}</td>
                        <td className="px-4 py-2 text-red-700">
                          {errors?.map((e, i) => <div key={i}>{e}</div>)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button onClick={() => setStep('upload')} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
              Start Over
            </button>
            <button
              onClick={handleImport}
              disabled={validRows.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Import {validRows.length} Valid Leads
            </button>
          </div>
        </div>
      )}

      {step === 'importing' && (
        <div>
          <h2 className="text-xl font-bold mb-4 text-center">Importing...</h2>
          <p className="text-center text-gray-600">Please wait while we import your leads. You will be redirected upon completion.</p>
        </div>
      )}
    </div>
  );
}
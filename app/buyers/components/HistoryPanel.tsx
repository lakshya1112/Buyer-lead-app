// app/buyers/components/HistoryPanel.tsx
import { buyer_history } from "@prisma/client";

// A helper to format the "diff" object into readable strings
function formatChanges(diff: any) {
  return Object.entries(diff).map(([key, value]: [string, any]) => {
    const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    return `${formattedKey} changed from "${value.old || 'empty'}" to "${value.new || 'empty'}"`;
  });
}

export function HistoryPanel({ history }: { history: buyer_history[] }) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Change History</h2>
      {history.length === 0 ? (
        <p className="text-sm text-gray-500">No changes have been recorded yet.</p>
      ) : (
        <ul className="space-y-4">
          {history.map((entry) => (
            <li key={entry.id} className="text-sm border-l-2 border-gray-200 pl-4">
              <p className="font-semibold text-gray-800">
                {new Date(entry.changedAt).toLocaleString()} by {entry.changedBy}
              </p>
              <div className="text-gray-600 mt-1">
                {formatChanges(entry.diff).map((change, index) => (
                  <p key={index}>- {change}</p>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
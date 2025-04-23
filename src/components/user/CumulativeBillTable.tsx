
import React from "react";

interface BillRow {
  id: string;
  timestamp: string;
  amount: number;
  cumulativeEnergy: number;
  bill: number;
}

interface CumulativeBillTableProps {
  cumulative: BillRow[];
  currentBill: number;
  onDownloadPDF?: () => void;
}

const CumulativeBillTable: React.FC<CumulativeBillTableProps> = ({
  cumulative,
  currentBill,
  onDownloadPDF,
}) => (
  <div className="mb-4 overflow-x-auto">
    <h3 className="font-semibold mb-2">Energy Consumption & Cumulative Bill</h3>
    {cumulative.length === 0 ? (
      <div className="text-sm text-muted-foreground">No energy usage logs for this month.</div>
    ) : (
      <table className="min-w-full text-xs border bg-white rounded shadow">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-2 py-1 text-left">Timestamp</th>
            <th className="px-2 py-1 text-right">Usage (kWh)</th>
            <th className="px-2 py-1 text-right">Cumulative (kWh)</th>
            <th className="px-2 py-1 text-right">Bill (₹)</th>
          </tr>
        </thead>
        <tbody>
          {cumulative.map((row) => (
            <tr key={row.id} className="border-t">
              <td className="px-2 py-1">{row.timestamp.slice(0, 19).replace("T", " ")}</td>
              <td className="px-2 py-1 text-right">{row.amount.toFixed(2)}</td>
              <td className="px-2 py-1 text-right">{row.cumulativeEnergy.toFixed(2)}</td>
              <td className="px-2 py-1 text-right">₹{row.bill.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
    <div className="mt-2 flex flex-col gap-2">
      <div className="text-sm font-bold">
        Total Bill for this Month: <span className="text-emerald-600">₹{currentBill.toFixed(2)}</span>
      </div>
      {onDownloadPDF && cumulative.length > 0 && (
        <button
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition w-fit"
          onClick={onDownloadPDF}
        >
          Download PDF Bill
        </button>
      )}
    </div>
  </div>
);

export default CumulativeBillTable;

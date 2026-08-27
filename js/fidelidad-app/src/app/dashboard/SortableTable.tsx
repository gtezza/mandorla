"use client";

import { useState } from "react";
import { ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";

type SortKey = "full_name" | "email" | "amount" | "created_at";
type SortOrder = "asc" | "desc" | "none";

interface LedgerRow {
  id: string;
  full_name: string;
  email: string;
  amount: number;
  created_at: string;
}

interface SortableTableProps {
  initialData: LedgerRow[];
}

export default function SortableTable({ initialData }: SortableTableProps) {
  const [data, setData] = useState<LedgerRow[]>(initialData);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("none");

  const handleSort = (key: SortKey) => {
    let newOrder: SortOrder = "asc";
    if (sortKey === key) {
      if (sortOrder === "asc") newOrder = "desc";
      else if (sortOrder === "desc") newOrder = "none";
    }

    setSortKey(key);
    setSortOrder(newOrder);

    if (newOrder === "none") {
      setData(initialData);
      return;
    }

    const sorted = [...initialData].sort((a, b) => {
      let aVal = a[key];
      let bVal = b[key];

      if (key === "created_at") {
        aVal = new Date(a[key]).getTime() as any;
        bVal = new Date(b[key]).getTime() as any;
      }

      if (aVal < bVal) return newOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return newOrder === "asc" ? 1 : -1;
      return 0;
    });

    setData(sorted);
  };

  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key || sortOrder === "none") {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    if (sortOrder === "asc") {
      return <ChevronUp className="w-4 h-4 text-blue-600" />;
    }
    return <ChevronDown className="w-4 h-4 text-blue-600" />;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-700 font-semibold">
            <tr>
              <th 
                className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort("full_name")}
              >
                <div className="flex items-center gap-2">Usuario {getSortIcon("full_name")}</div>
              </th>
              <th 
                className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort("email")}
              >
                <div className="flex items-center gap-2">Correo {getSortIcon("email")}</div>
              </th>
              <th 
                className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort("amount")}
              >
                <div className="flex items-center gap-2">Puntos {getSortIcon("amount")}</div>
              </th>
              <th 
                className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort("created_at")}
              >
                <div className="flex items-center gap-2">Fecha y Hora {getSortIcon("created_at")}</div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                  No hay movimientos registrados.
                </td>
              </tr>
            ) : (
              data.map((row) => {
                const dateObj = new Date(row.created_at);
                return (
                  <tr key={row.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{row.full_name}</td>
                    <td className="px-6 py-4">{row.email}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        +{row.amount}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span>{dateObj.toLocaleDateString("es-AR")}</span>
                        <span className="text-xs text-gray-400">{dateObj.toLocaleTimeString("es-AR")}</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

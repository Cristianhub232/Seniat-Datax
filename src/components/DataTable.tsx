"use client";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
// import CsvProcessedButton from "./CsvProcessedButton";
import Button from "./Button";
import { CsvRow } from "@/types/index";
import { IconListNumbers } from "@tabler/icons-react";


interface DataTableProps {
  data: CsvRow[];
  title: string;
  onProcess: () => void;
  onClear: () => void;
}

export function DataTable({ data, title, onProcess, onClear }: DataTableProps) {
  const [filtro, setFiltro] = useState("");

  // Columnas generadas dinámicamente desde los headers del archivo
  const columns = useMemo<ColumnDef<CsvRow>[]>(() => {
    if (!data.length) return [];
    return Object.keys(data[0]).map((key) => ({
      accessorKey: key,
      header: key.toUpperCase(),
    }));
  }, [data]);

  // Filtrado en tiempo real
  const dataFiltrada = useMemo(() => {
    if (!filtro) return data;
    return data.filter((row) =>
      String(row["Rif"] || "")
        .toLowerCase()
        .includes(filtro.toLowerCase())
    );
  }, [data, filtro]);

  const table = useReactTable({
    data: dataFiltrada,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (!data.length) return null;

  return (
    <div className="w-full space-y-4">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex justify-end gap-4">
          <input
            type="text"
            placeholder="Buscar por RIF"
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4 flex-wrap justify-end ">
          <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 px-3 py-2 rounded-md text-shadow-stone-100 border border-red-50">
            <IconListNumbers stroke={1} color="#9f0712" />
            <span className="">
              <strong>{dataFiltrada.length}</strong>
            </span>
          </div>

          <Button
            onClick={onClear}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md cursor-pointer transition-colors"
          >
            Limpiar Datos
          </Button>

          {/* <CsvProcessedButton onProcess={onProcess} /> */}
        </div>
      </div>

      <div className="max-h-[70vh] overflow-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10 shadow">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={`px-6 py-4 whitespace-nowrap text-sm ${String(cell.getValue()).toLowerCase() === "sin asignar" ||
                        String(cell.getValue()).toLowerCase() === "por asignar"
                        ? "bg-red-100 text-red-500 font-medium"
                        : "text-gray-900"
                      }`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

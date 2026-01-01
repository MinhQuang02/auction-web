import { useState } from "react";

const TablePanel = ({
  headers,
  rows,
  onRowClick,
  onRowDoubleClick,
  renderActions,
}) => {
  const [selectedRowId, setSelectedRowId] = useState(null);

  const getRowId = (row) => row.id ?? row.timestamp;

  return (
    <table className="w-full bg-[#f2f2f2] rounded-md shadow-md">
      <thead>
        <tr className="font-semibold text-left border-b">
          {headers.map((header) => (
            <th key={header} className="p-4">
              {header}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {rows.map((row) => {
          const rowId = getRowId(row);
          const isSelected = rowId === selectedRowId;

          return (
            <tr
              key={rowId}
              className={`border-b cursor-pointer transition-colors ${
                isSelected ? "bg-primary/60" : "hover:bg-primary/30"
              }`}
              onClick={() => {
                setSelectedRowId(rowId);
                onRowClick?.(row);
              }}
              onDoubleClick={() => onRowDoubleClick?.(row)}
            >
              {headers.map((header) => {
                if (header === "Actions") {
                  return (
                    <td key="actions" className="p-4 text-right">
                      {renderActions?.(row)}
                    </td>
                  );
                }

                const key = header.toLowerCase().replace(/\s+/g, "_");

                return (
                  <td key={key} className="p-4">
                    {row[key] ?? "-"}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default TablePanel;

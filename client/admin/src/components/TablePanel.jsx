import { useState } from "react";

const TablePanel = ({ headers, rows, onRowClick }) => {
  const [selectedRowId, setSelectedRowId] = useState(null);

  const handleRowClick = (row) => {
    const rowId = row.id || row.timestamp;
    setSelectedRowId(rowId);
    onRowClick && onRowClick(row);
  };

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
          const rowId = row.id || row.timestamp;
          const isSelected = rowId === selectedRowId;

          return (
            <tr
              key={rowId}
              className={`text-left border-b cursor-pointer transition-colors ${
                isSelected ? "bg-primary/60" : "hover:bg-primary/30"
              }`}
              onClick={() => handleRowClick(row)}
            >
              {headers.map((header) => {
                const key = header.toLowerCase().replace(/\s+/g, "_");
                return (
                  <td key={key} className="p-4">
                    {row[key]}
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

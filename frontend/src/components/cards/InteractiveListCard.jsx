import React, { useState } from "react";
import { useStagger } from "../../animations/useStagger";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

const InteractiveListCard = ({
  title,
  subtitle,
  headers = [],
  rows = [], // [{ id, cells: [value, value], details: ReactElement/string }]
  actions
}) => {
  const listRef = useStagger(".stagger-row", { y: 15, stagger: 0.08 });
  const [expandedRow, setExpandedRow] = useState(null);

  const toggleRow = (rowId) => {
    setExpandedRow(prev => (prev === rowId ? null : rowId));
  };

  return (
    <div className="bg-white rounded-3xl shadow-outcrowd border border-slate-100 p-6 md:p-8 flex flex-col gap-6 transition-shadow hover:shadow-outcrowd-hover duration-300">
      
      {/* Header Block */}
      <div className="flex justify-between items-center border-b border-slate-100/60 pb-4">
        <div className="space-y-1">
          <h3 className="text-lg font-bold tracking-tight text-slate-800 font-heading">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 tracking-wide font-medium">
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>

      {/* List Container */}
      <div ref={listRef} className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100/60">
              {headers.map((h, i) => (
                <th key={i} className="pb-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-sans">
                  {h}
                </th>
              ))}
              {rows.some(r => r.details) && <th className="pb-3 w-10" />}
            </tr>
          </thead>
          
          <tbody className="divide-y divide-slate-100/60">
            {rows.map((row) => {
              const isExpanded = expandedRow === row.id;
              return (
                <React.Fragment key={row.id}>
                  {/* Base Row */}
                  <tr
                    className="stagger-row hover:bg-slate-50/50 transition-colors duration-200 cursor-pointer"
                    onClick={() => row.details && toggleRow(row.id)}
                  >
                    {row.cells.map((cell, idx) => (
                      <td key={idx} className="py-4 text-[13px] font-medium font-sans text-slate-700">
                        {cell}
                      </td>
                    ))}
                    {row.details && (
                      <td className="py-4 text-right pr-2 text-slate-500">
                        {isExpanded ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
                      </td>
                    )}
                  </tr>

                  {/* Expansion detail panel (Progressive Disclosure) */}
                  {row.details && isExpanded && (
                    <tr>
                      <td colSpan={headers.length + (row.details ? 1 : 0)} className="py-4 px-4 bg-slate-50 border-b border-slate-100/60 rounded-b-xl">
                        <div className="text-[12px] text-slate-600 font-sans font-medium leading-relaxed transition-all">
                          {row.details}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            
            {rows.length === 0 && (
              <tr>
                <td colSpan={headers.length + 1} className="py-8 text-center text-sm text-slate-500 font-medium">
                  No records to display.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default InteractiveListCard;

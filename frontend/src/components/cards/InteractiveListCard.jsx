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
    <div className="bg-[#FFFFFF] border border-black/10 p-6 md:p-8 flex flex-col gap-6">
      
      {/* Header Block */}
      <div className="flex justify-between items-center border-b border-black/10 pb-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold tracking-widest text-[#000000] uppercase font-sans">
            {title}
          </h3>
          {subtitle && (
            <p className="text-[11px] text-[#000000] tracking-wide">
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
            <tr className="border-b border-black/10">
              {headers.map((h, i) => (
                <th key={i} className="pb-3 text-[10px] font-bold text-[#000000] uppercase tracking-widest font-sans">
                  {h}
                </th>
              ))}
              {rows.some(r => r.details) && <th className="pb-3 w-10" />}
            </tr>
          </thead>
          
          <tbody className="divide-y divide-black/10">
            {rows.map((row) => {
              const isExpanded = expandedRow === row.id;
              return (
                <React.Fragment key={row.id}>
                  {/* Base Row */}
                  <tr
                    className="stagger-row hover:bg-black/5 transition-all duration-200 cursor-pointer"
                    onClick={() => row.details && toggleRow(row.id)}
                  >
                    {row.cells.map((cell, idx) => (
                      <td key={idx} className="py-4 text-xs font-sans text-[#000000]">
                        {cell}
                      </td>
                    ))}
                    {row.details && (
                      <td className="py-4 text-right pr-2 text-[#555555]">
                        {isExpanded ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
                      </td>
                    )}
                  </tr>

                  {/* Expansion detail panel (Progressive Disclosure) */}
                  {row.details && isExpanded && (
                    <tr>
                      <td colSpan={headers.length + (row.details ? 1 : 0)} className="py-4 px-4 bg-black/5 border-y border-black/10">
                        <div className="text-[11px] text-[#000000] font-sans font-medium leading-relaxed transition-all">
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
                <td colSpan={headers.length + 1} className="py-8 text-center text-xs text-slate-400 font-mono">
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

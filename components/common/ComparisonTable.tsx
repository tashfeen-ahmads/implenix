import { Check, X, Minus } from 'lucide-react';

type Cell = boolean | 'partial' | string;

type Row = {
  label: string;
  cells: Cell[];
};

type Props = {
  columns: string[];
  rows: Row[];
  highlightColumn?: number;
};

// Comparison table. The highlighted column gets a colored header and a
// left/right border. On phones the label column stays pinned while the
// rest scrolls sideways, with a hint that there is more to the right.
export function ComparisonTable({ columns, rows, highlightColumn = 0 }: Props) {
  return (
    <div>
    <div className="relative overflow-x-auto overscroll-x-contain border border-brand-purple/20 -mx-1 sm:mx-0">
      <table className="w-full font-body text-xs sm:text-sm min-w-[560px] sm:min-w-[640px]">
        <thead>
          <tr>
            <th scope="col" className="sticky left-0 z-[1] text-left p-3 sm:p-4 border-b border-brand-purple/20 bg-black font-mono text-[10px] sm:text-xs uppercase tracking-widest text-white/55">
              Capability
            </th>
            {columns.map((col, i) => (
              <th
                key={col}
                scope="col"
                className={`text-left p-3 sm:p-4 border-b border-brand-purple/20 bg-black font-heading text-sm sm:text-base ${
                  i === highlightColumn
                    ? 'text-brand-cyan border-x border-x-brand-cyan/40'
                    : 'text-white/85'
                }`}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.label} className="border-b border-brand-purple/15 last:border-b-0">
              <th
                scope="row"
                className="sticky left-0 z-[1] bg-black text-left p-3 sm:p-4 text-white font-medium w-[8.5rem] sm:w-auto shadow-[6px_0_8px_-6px_rgba(0,0,0,0.9)] sm:shadow-none"
              >
                {row.label}
              </th>
              {row.cells.map((cell, i) => (
                <td
                  key={i}
                  className={`p-3 sm:p-4 align-top ${
                    i === highlightColumn ? 'border-x border-x-brand-cyan/40' : ''
                  } ${idx === rows.length - 1 && i === highlightColumn ? 'border-b border-b-brand-cyan/40' : ''}`}
                >
                  {renderCell(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <p className="sm:hidden mt-2 text-right font-mono text-[10px] uppercase tracking-widest text-white/45">
      Swipe to compare →
    </p>
    </div>
  );
}

function renderCell(cell: Cell) {
  if (cell === true) {
    return (
      <>
        <Check size={18} className="text-brand-cyan" aria-hidden />
        <span className="sr-only">Yes</span>
      </>
    );
  }
  if (cell === false) {
    return (
      <>
        <X size={18} className="text-white/30" aria-hidden />
        <span className="sr-only">No</span>
      </>
    );
  }
  if (cell === 'partial') {
    return (
      <>
        <Minus size={18} className="text-brand-purple" aria-hidden />
        <span className="sr-only">Partly</span>
      </>
    );
  }
  return <span className="text-white/85">{cell}</span>;
}

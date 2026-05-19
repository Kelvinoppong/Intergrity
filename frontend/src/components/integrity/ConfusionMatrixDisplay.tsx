"use client";

interface Props {
  matrix: number[][];
  modelName: string;
}

export function ConfusionMatrixDisplay({ matrix }: Props) {
  if (!matrix || matrix.length !== 2) return null;

  const labels = ["Clean", "Flagged"];
  const total = matrix.flat().reduce((a, b) => a + b, 0);

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/50">Confusion Matrix</p>
      <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.02]">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="border-b border-white/5 bg-white/[0.03] p-2 text-left"></th>
              <th className="border-b border-white/5 bg-white/[0.03] p-2 text-center text-xs font-semibold uppercase tracking-wider text-white/60" colSpan={2}>
                Predicted
              </th>
            </tr>
            <tr>
              <th className="border-b border-white/5 bg-white/[0.03] p-2 text-left text-xs font-semibold uppercase tracking-wider text-white/60">Actual</th>
              {labels.map((l) => (
                <th key={l} className="border-b border-white/5 bg-white/[0.03] p-2 text-center text-xs font-semibold text-white/60">
                  {l}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => (
              <tr key={i}>
                <td className="border-r border-white/5 bg-white/[0.03] p-3 text-sm font-medium text-white/70">{labels[i]}</td>
                {row.map((val, j) => {
                  const isCorrect = i === j;
                  const pct = total > 0 ? ((val / total) * 100).toFixed(0) : "0";
                  return (
                    <td
                      key={j}
                      className={`p-3 text-center font-bold ${
                        isCorrect
                          ? "bg-emerald-500/10 text-emerald-300"
                          : "bg-rose-500/10 text-rose-300"
                      }`}
                    >
                      <span className="text-lg">{val}</span>
                      <span className="block text-[10px] font-medium text-white/40">({pct}%)</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

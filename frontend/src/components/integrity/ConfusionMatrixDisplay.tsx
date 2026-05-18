"use client";

import { cn } from "@/lib/utils";

interface Props {
  matrix: number[][];
  modelName: string;
}

export function ConfusionMatrixDisplay({ matrix, modelName }: Props) {
  if (!matrix || matrix.length !== 2) return null;

  const labels = ["Clean", "Flagged"];
  const total = matrix.flat().reduce((a, b) => a + b, 0);

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-muted-foreground">Confusion Matrix</p>
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="border-b bg-muted p-2 text-left"></th>
              <th className="border-b bg-muted p-2 text-center" colSpan={2}>Predicted</th>
            </tr>
            <tr>
              <th className="border-b bg-muted p-2 text-left">Actual</th>
              {labels.map((l) => (
                <th key={l} className="border-b bg-muted p-2 text-center">{l}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => (
              <tr key={i}>
                <td className="border-r bg-muted p-2 font-medium">{labels[i]}</td>
                {row.map((val, j) => {
                  const isCorrect = i === j;
                  const pct = total > 0 ? ((val / total) * 100).toFixed(0) : "0";
                  return (
                    <td
                      key={j}
                      className={cn(
                        "p-3 text-center font-semibold",
                        isCorrect ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700",
                      )}
                    >
                      {val}
                      <span className="block text-xs font-normal text-muted-foreground">({pct}%)</span>
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

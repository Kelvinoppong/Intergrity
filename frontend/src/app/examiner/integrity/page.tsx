"use client";

import { useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ModelComparisonChart } from "@/components/integrity/ModelComparisonChart";
import { ConfusionMatrixDisplay } from "@/components/integrity/ConfusionMatrixDisplay";
import type { BenchmarkResult, ModelMetrics } from "@/types";

export default function IntegrityDashboard() {
  const [benchmark, setBenchmark] = useState<BenchmarkResult | null>(null);
  const [activeModel, setActiveModel] = useState<string>("");
  const [models, setModels] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [venueSize, setVenueSize] = useState(80);
  const [cheatRatio, setCheatRatio] = useState(0.2);

  async function fetchModels() {
    try {
      const { data } = await api.get("/integrity/models");
      setModels(data.data.models);
      setActiveModel(data.data.active);
    } catch {}
  }

  async function runBenchmark() {
    setIsRunning(true);
    try {
      const { data } = await api.get("/integrity/evaluate/all", {
        params: { num_students: venueSize, cheat_ratio: cheatRatio },
      });
      setBenchmark(data.data);
      await fetchModels();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || "Benchmark failed");
    } finally {
      setIsRunning(false);
    }
  }

  async function switchModel(model: string) {
    try {
      await api.post("/integrity/models/switch", { model });
      setActiveModel(model);
    } catch {}
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">AI Integrity Dashboard</h1>
        <p className="text-muted-foreground">Compare GNN model performance and select the best model for production</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Benchmark Configuration</CardTitle>
          <CardDescription>Configure mock venue parameters and run a benchmark across all 4 models</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Venue Size (students)</label>
              <input
                type="number"
                className="flex h-10 w-32 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={venueSize}
                onChange={(e) => setVenueSize(parseInt(e.target.value) || 80)}
                min={10}
                max={500}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Cheat Ratio</label>
              <input
                type="number"
                className="flex h-10 w-32 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={cheatRatio}
                onChange={(e) => setCheatRatio(parseFloat(e.target.value) || 0.2)}
                min={0.05}
                max={0.5}
                step={0.05}
              />
            </div>
            <Button onClick={runBenchmark} disabled={isRunning} size="lg">
              {isRunning ? "Running Benchmark..." : "Run Benchmark (All 4 Models)"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {benchmark && (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Dataset Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-8 text-sm">
                <span>Students: <strong>{benchmark.dataset_info.num_nodes}</strong></span>
                <span>Edges: <strong>{benchmark.dataset_info.num_edges}</strong></span>
                <span>Clean: <strong>{benchmark.dataset_info.num_clean}</strong></span>
                <span>Cheaters: <strong>{benchmark.dataset_info.num_cheaters}</strong></span>
              </div>
            </CardContent>
          </Card>

          <ModelComparisonChart results={benchmark.results} />

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {benchmark.results.map((r) => (
              <Card key={r.model}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{r.model.replace(/_/g, " ").toUpperCase()}</CardTitle>
                    <CardDescription>Training Accuracy: {(r.train_acc * 100).toFixed(1)}%</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {activeModel === r.model && <Badge variant="success">Active</Badge>}
                    <Button
                      size="sm"
                      variant={activeModel === r.model ? "secondary" : "default"}
                      onClick={() => switchModel(r.model)}
                      disabled={activeModel === r.model}
                    >
                      {activeModel === r.model ? "Selected" : "Use This Model"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{(r.precision_macro * 100).toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">Precision</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{(r.recall_macro * 100).toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">Recall</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-600">{(r.f1_macro * 100).toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">F1 Score</p>
                    </div>
                  </div>
                  <ConfusionMatrixDisplay matrix={r.confusion_matrix} modelName={r.model} />
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {!benchmark && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-lg text-muted-foreground">Run a benchmark to compare all 4 GNN models</p>
            <p className="text-sm text-muted-foreground mt-2">
              Models: Vanilla GCN, H2GCN, FAGCN, GraphSAGE
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

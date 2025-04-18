"use client";

import { useState } from "react";
import BrainGraph from "./components/BrainGraph";

export default function Home() {
  const [regionInput, setRegionInput] = useState(0);
  const [region, setRegion] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clamped = Math.max(0, Math.min(3445, regionInput)); // safety
    setRegion(clamped);
  };

  return (
    <main className="min-h-screen bg-gradient-to-tr from-slate-900 to-indigo-950 text-white px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center tracking-tight drop-shadow-md">
          Transcriptomic Brain Explorer
        </h1>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-2xl border border-white/20">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <label
              htmlFor="regionInput"
              className="text-lg font-medium text-white"
            >
              Select Brain Region (0–3445):
            </label>
            <input
              id="regionInput"
              type="number"
              value={regionInput}
              min={0}
              max={3445}
              onChange={(e) => setRegionInput(Number(e.target.value))}
              className="px-4 py-2 w-32 rounded-md text-white
               text-lg shadow-inner border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 transition-all rounded-lg text-white text-lg font-semibold shadow-md"
            >
              View Connections
            </button>
          </form>

          <div className="mt-6 overflow-hidden rounded-lg border border-white/20 shadow-lg">
            <div className="mt-6 overflow-hidden rounded-lg border border-white/20 shadow-lg">
              <BrainGraph region={region} />
            </div>
            <div className="mt-6 flex flex-col items-center pb-10">
              <label className="text-white/80 text-sm mb-1">
                Edge Strength (Transcriptomic Similarity)
              </label>
              <div className="relative w-full max-w-xs h-4 rounded overflow-hidden shadow-inner">
                <div
                  className="w-full h-full"
                  style={{
                    background:
                      "linear-gradient(to right, #0d0887, #6a00a8, #b12a90, #e16462, #fca636, #f0f921)",
                  }}
                />
                <div className="flex justify-between text-xs text-white/60 mt-1 px-1">
                  <span>Weak</span>
                  <span>Strong</span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/20 mt-10 text-sm text-white/80 leading-relaxed max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold text-white mb-3">
              Methodology Overview
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>1. Standardization:</strong> Raw gene expression data
                (15,636 genes × 3,446 brain regions) was standardized using{" "}
                <code>StandardScaler()</code> to zero-mean and unit-variance
                across regions.
              </li>

              <li>
                <strong>2. Dimensionality Reduction:</strong> PCA was applied to
                reduce the input dimensionality while preserving ~86% of the
                variance. The result: 128 principal components per region.
              </li>

              <li>
                <strong>3. Graph Autoencoder:</strong> A neural network was
                trained to compress each region’s PCA vector into a
                64-dimensional latent space <code>h</code>, and then reconstruct
                the input from it.
              </li>

              <li>
                <strong>4. Adjacency Matrix:</strong> A soft connectivity matrix{" "}
                <code>A_pred</code> was created using
                <code>torch.sigmoid(h @ h.T)</code>, where each entry reflects
                the similarity between two region embeddings.
              </li>

              <li>
                <strong>5. Clustering:</strong> Spectral Clustering was
                performed on <code>A_pred</code> to group 8 regions into
                functionally similar transcriptomic modules.
              </li>

              <li>
                <strong>6. Visualization:</strong> Each region was embedded in
                3D space using its MNI coordinates. Edges are drawn between
                strongly connected regions, with color representing edge
                strength using the Plasma gradient.
              </li>

              <li>
                <strong>7. Interactive Explorer:</strong> For each brain region,
                a pre-rendered 3D Plotly graph was generated showing only its
                most meaningful transcriptomic connections. You can view them
                interactively by selecting a region.
              </li>
            </ul>
          </div>
        </div>

        <footer className="mt-12 text-center text-white/60 text-sm">
          Created by Jose Coyt • Interactive transcriptomic graph viewer
        </footer>
      </div>
    </main>
  );
}

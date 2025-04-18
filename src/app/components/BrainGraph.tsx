'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import pako from 'pako';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

type BrainRegion = {
  coords: number[];
  connections: { target: number; strength: number }[];
  label: number | null;
};

// Custom Plasma colormap approximation (6-step)
const plasmaColors = [
  '#0d0887', '#6a00a8', '#b12a90', '#e16462', '#fca636', '#f0f921'
];

function getPlasmaColor(value: number): string {
  const index = Math.floor(value * (plasmaColors.length - 1));
  return plasmaColors[Math.min(index, plasmaColors.length - 1)];
}

export default function BrainGraph({ region }: { region: number }) {
  const [data, setData] = useState<Record<number, BrainRegion> | null>(null);

  useEffect(() => {
    const fetchAndUnzip = async () => {
      const res = await fetch("https://kxufiygkshxnq834.public.blob.vercel-storage.com/brain_graph.json.gz");
      const buffer = await res.arrayBuffer();

      const decompressed = pako.ungzip(new Uint8Array(buffer), { to: "string" });
      const json = JSON.parse(decompressed);

      setData(json);
    };

    fetchAndUnzip();
  }, []);

  if (!data) return <p className="text-white/60">Loading data...</p>;
  if (!data[region]) return <p className="text-red-500">Region not found.</p>;

  const regionData = data[region];
  const totalNodes = Object.keys(data).length;
  const allCoords = Object.values(data).map((r) => r.coords);
  const labels = Object.values(data).map((r) => r.label);

  // Color nodes by cluster, highlight selected as red
  const colorPalette = [
    '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
    '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
  ];

  const nodeColors = labels.map((label, i) =>
    i === region ? 'red' :
    label !== null ? colorPalette[label % colorPalette.length] : 'lightblue'
  );

  const edgeTraces = regionData.connections.map((conn) => {
    const from = regionData.coords;
    const to = data[conn.target].coords;
    const color = getPlasmaColor(conn.strength);

    return {
      type: 'scatter3d',
      mode: 'lines',
      x: [from[0], to[0]],
      y: [from[1], to[1]],
      z: [from[2], to[2]],
      line: { width: 2, color },
      hoverinfo: 'none',
      showlegend: false,
    } as Partial<Plotly.Data>;
  });

  const nodeTrace = {
    type: 'scatter3d',
    mode: 'markers',
    x: allCoords.map((c) => c[0]),
    y: allCoords.map((c) => c[1]),
    z: allCoords.map((c) => c[2]),
    marker: {
      size: 4,
      color: nodeColors,
      opacity: 0.9,
    },
    text: Object.keys(data).map((key) =>
      `Region ${key}<br>Cluster: ${data[Number(key)].label}`
    ),
    hoverinfo: 'text',
  } as Partial<Plotly.Data>;

  return (
    <div className="not-prose bg-white text-black p-0 m-0 w-full h-[720px] overflow-hidden rounded-lg">
      <Plot
        data={[...edgeTraces, nodeTrace]}
        layout={{
          title: `Connections from Region ${region}`,
          showlegend: false,
          margin: { t: 40, b: 0, l: 0, r: 0 },
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(0,0,0,0)',
          scene: {
            xaxis: { title: 'X (MNI)' },
            yaxis: { title: 'Y (MNI)' },
            zaxis: { title: 'Z (MNI)' },
            bgcolor: 'rgba(0,0,0,0)',
          },
        }}
        config={{
          displayModeBar: false,
          responsive: true,
        }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}

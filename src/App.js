import React, { useState, useRef } from "react";
import Papa from "papaparse";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function App() {
  const [rows, setRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [xCol, setXCol] = useState("");
  const [yCol, setYCol] = useState("");
  const [chart, setChart] = useState("bar");
  const chartDiv = useRef(null);

  const loadFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const data = res.data;
        const keys = Object.keys(data[0] || {});
        setHeaders(keys);
        setRows(data);
        setXCol("");
        setYCol("");
      },
    });
  };

  const data = rows
    .map((r) => ({
      name: r[xCol],
      value: Number(r[yCol]) || 0,
    }))
    .filter((d) => d.name);

  const savePNG = () => {
    if (!chartDiv.current) return;
    const svg = chartDiv.current.querySelector("svg");
    if (!svg) return;

    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = svg.clientWidth || 700;
      canvas.height = svg.clientHeight || 400;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      URL.revokeObjectURL(url);

      canvas.toBlob((blob) => {
        const link = document.createElement("a");
        link.download = "chart.png";
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
      });
    };
    img.src = url;
  };

  return (
    <div style={{ maxWidth: 700, margin: "auto", padding: 20 }}>
      <h2>CSV Chart</h2>
      <input type="file" accept=".csv" onChange={loadFile} />

      {headers.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <label>
            X-axis:
            <select value={xCol} onChange={(e) => setXCol(e.target.value)} style={{ marginLeft: 10 }}>
              <option value="">--select--</option>
              {headers.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </label>

          <label style={{ marginLeft: 20 }}>
            Y-axis:
            <select value={yCol} onChange={(e) => setYCol(e.target.value)} style={{ marginLeft: 10 }}>
              <option value="">--select--</option>
              {headers.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </label>

          <label style={{ marginLeft: 20 }}>
            Chart:
            <select value={chart} onChange={(e) => setChart(e.target.value)} style={{ marginLeft: 10 }}>
              <option value="bar">Bar</option>
              <option value="line">Line</option>
            </select>
          </label>

          <button onClick={savePNG} style={{ marginLeft: 20 }}>
            Download PNG
          </button>
        </div>
      )}

      {xCol && yCol && data.length > 0 && (
        <div ref={chartDiv} style={{ height: 400, marginTop: 40 }}>
          <ResponsiveContainer width="100%" height="100%">
            {chart === "bar" ? (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            ) : (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#82ca9d" />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

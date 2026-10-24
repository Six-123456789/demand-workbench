"use client";

import { useState } from "react";

export default function Home() {
  const [demand, setDemand] = useState("");
  const [history, setHistory] = useState<{ text: string; time: string }[]>([]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
      <h1 className="text-4xl font-bold text-gray-900">需求拆解工作台</h1>
      <p className="mt-3 text-lg text-gray-500">把一句模糊需求，变成能直接开工的方案</p>
      <textarea
        className="mt-8 w-full max-w-2xl h-32 p-4 border border-gray-300 rounded-lg text-base outline-none focus:border-gray-900"
        placeholder="例如：帮我做个好看的海报"
        value={demand}
        onChange={(e) => setDemand(e.target.value)}
      />
      <button
        className="mt-4 w-full max-w-2xl bg-gray-900 text-white py-3 rounded-lg text-base"
        onClick={() => {
          if (!demand) {
            setHistory([...history, { text: "（空输入）请先输入你的需求", time: new Date().toLocaleTimeString() }]);
          } else {
            setHistory([...history, { text: demand, time: new Date().toLocaleTimeString() }]);
            setDemand("");
          }
        }}
      >
        开始拆解
      </button>
      <button
        className="mt-4 w-full max-w-2xl border border-gray-300 py-3 rounded-lg text-base text-gray-500"
        onClick={() => setHistory([])}
      >
        清空
      </button>
      {history.map((item, index) => (
        <div key={index} className="mt-2 w-full max-w-2xl p-3 border border-gray-200 rounded-lg text-gray-700">
          {item.text}
          <span className="text-sm text-gray-500">（{item.time}）</span>
        </div>
      ))}
    </main>
  );
}

"use client";

import { useState, useEffect } from "react";

type Detail = {
  name: string;
  type: string;
  difficulty: string;
  hours: string;
  questions: string[];
  tags: string[];
};

type HistoryItem = {
  text: string;
  time: string;
  detail?: Detail | null;
};

export default function Home() {
  const [demand, setDemand] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiedTime, setCopiedTime] = useState("");


  useEffect(() => {
    const saved = localStorage.getItem("history");
    if (saved) {
      setHistory(JSON.parse(saved));
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem("history", JSON.stringify(history));
    }
  }, [history, loaded]);
  
  const copyResult = async (item: HistoryItem) => {
  if (!item.detail) return;
  const d = item.detail;
  const text = `【需求拆解】${d.name}
类型：${d.type}
难度：${d.difficulty}
工时估计：${d.hours}
必问问题：
1. ${d.questions[0] ?? ""}
2. ${d.questions[1] ?? ""}
3. ${d.questions[2] ?? ""}
执行方：${d.tags.join("、")}`;
      await navigator.clipboard.writeText(text);
    setCopiedTime(item.time);
    setTimeout(() => setCopiedTime(""), 1500);

};


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
        className="mt-4 w-full max-w-2xl bg-gray-900 text-white py-3 rounded-lg text-base disabled:opacity-50"
        onClick={async () => {
          if (!demand) {
            setHistory([...history, { text: "（空输入）请先输入你的需求", time: new Date().toLocaleTimeString() }]);
          } else {
            setLoading(true);
            try {
              const res = await fetch("/api/ask", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: demand }),
              });
              const data = await res.json();
              setHistory([...history, { text: data.answer, time: new Date().toLocaleTimeString(), detail: data.detail ?? null }]);
            } catch {
              setHistory([...history, { text: "（拆解失败，请检查网络后重试）", time: new Date().toLocaleTimeString() }]);
            }
            setDemand("");
            setLoading(false);
          }
        }}
        disabled={loading}
      >
        {loading ? "拆解中..." : "开始拆解"}
      </button>
      <button
        className="mt-4 w-full max-w-2xl border border-gray-300 py-3 rounded-lg text-base text-gray-500"
        onClick={() => setHistory([])}
      >
        清空
      </button>
      {history.map((item, index) => (
        <div key={index} className="mt-2 w-full max-w-2xl p-3 border border-gray-200 rounded-lg text-gray-700">
          {item.detail ? (
            <div className="flex justify-between items-center">
  <span className="text-sm text-gray-500">
    {item.detail.name}（{item.time}）
  </span>
  <div className="flex gap-3">
    <button
      className="text-sm text-gray-400 hover:text-gray-700"
      onClick={() => copyResult(item)}
    >
     {copiedTime === item.time ? "已复制" : "复制"}

    </button>
    <button
      className="text-sm text-gray-400 hover:text-red-500"
      onClick={() => setHistory(history.filter((_, i) => i !== index))}
    >
      删除
    </button>
  </div>
</div>

          ) : (
            <div className="flex justify-between items-center">
              <span className="whitespace-pre-wrap">
                {item.text}
                <span className="text-sm text-gray-500">（{item.time}）</span>
              </span>
              <button
                className="text-sm text-gray-400 hover:text-red-500"
                onClick={() => setHistory(history.filter((_, i) => i !== index))}
              >
                删除
              </button>
            </div>
          )}
          {item.detail && (
            <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
              <p>
                <span className="text-gray-500">需求名称：</span>
                <span className="font-medium">{item.detail.name}</span>
                <span className="ml-3 text-gray-500">类型：</span>{item.detail.type}
                <span className="ml-3 text-gray-500">难度：</span>{item.detail.difficulty}
                <span className="ml-3 text-gray-500">工时：</span>{item.detail.hours}
              </p>
              <p className="text-gray-500">必问问题：</p>
              <ul className="list-disc pl-5">
                {item.detail.questions.map((q, qi) => (
                  <li key={qi}>{q}</li>
                ))}
              </ul>
              <p>
                <span className="text-gray-500">执行方：</span>
                {item.detail.tags.join("、")}
              </p>
            </div>
          )}
        </div>
      ))}
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";

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
  detail?: Detail;
};

export default function Home() {
  const [demand, setDemand] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  // 先取：从 localStorage 读历史记录
  useEffect(() => {
    const stored = localStorage.getItem("demand_history");
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch {
        setHistory([]);
      }
    }
    setLoaded(true);
  }, []);

  // 后存：history 变了就存回去
  useEffect(() => {
    if (loaded) {
      localStorage.setItem("demand_history", JSON.stringify(history));
    }
  }, [history, loaded]);

  const handleAsk = async () => {
    if (!demand.trim()) {
      alert("请输入需求");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: demand }),
      });
      const data = await res.json();
      const item: HistoryItem = {
        text: data.answer,
        time: new Date().toLocaleTimeString("zh-CN"),
        detail: data.detail ?? undefined,
      };
      setHistory([item, ...history]);
      setDemand("");
    } catch {
      const item: HistoryItem = {
        text: "（连接失败，请重试）",
        time: new Date().toLocaleTimeString("zh-CN"),
      };
      setHistory([item, ...history]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (time: string) => {
    setHistory(history.filter((item) => item.time !== time));
  };

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mt-8">需求拆解工作台</h1>
      <p className="text-gray-500 text-center mt-2 mb-8">
        把一句模糊需求，变成能直接开工的方案
      </p>

      <textarea
        value={demand}
        onChange={(e) => setDemand(e.target.value)}
        placeholder="例如：电商后台加一个手机号+验证码登录页，登录后跳转订单列表"
        className="w-full h-28 p-4 border rounded-lg text-sm"
        disabled={loading}
      />

      <button
        onClick={handleAsk}
        disabled={loading}
        className="w-full bg-gray-900 text-white py-3 rounded-lg mt-4 disabled:opacity-50"
      >
        {loading ? "拆解中..." : "开始拆解"}
      </button>

      <button
        onClick={() => setHistory([])}
        className="w-full border py-3 rounded-lg mt-3"
      >
        清空
      </button>

      <div className="mt-8 space-y-4">
        {history.map((item) => (
          <div key={item.time} className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-400">{item.time}</span>
              <button
                onClick={() => handleDelete(item.time)}
                className="text-xs text-gray-400 hover:text-red-500"
              >
                删除
              </button>
            </div>

            {item.detail ? (
              <div>
                <div className="font-bold">{item.detail.name}</div>
                <div className="text-sm text-gray-600 mt-1">
                  类型：{item.detail.type} ｜ 难度：{item.detail.difficulty} ｜ 工时：{item.detail.hours}
                </div>
                <div className="mt-2">
                  <div className="text-sm font-semibold">需要确认的问题：</div>
                  {item.detail.questions.map((q, i) => (
                    <div key={i} className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                      {i + 1}. {q}
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex gap-2 flex-wrap">
                  {item.detail.tags.map((t, i) => (
                  <span key={i} className="text-xs bg-gray-700 text-white px-2 py-1 rounded">


                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-sm whitespace-pre-wrap">{item.text}</div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}

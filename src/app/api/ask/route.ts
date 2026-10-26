import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      signal: AbortSignal.timeout(15000),
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content:
              "你是需求拆解专家。用户会给一句模糊需求，你按以下格式输出：1) 需求名称 2) 类型 3) 难度（低/中/高）4) 工时估计 5) 必须追问的3个问题 6) 执行方标签。只输出内容，不要解释。",
          },
          { role: "user", content: question },
        ],
      }),
    });

    const data = await res.json();
    const answer = data.choices?.[0]?.message?.content ?? "（没拿到回答，检查 key 或网络）";
    return NextResponse.json({ answer });
  } catch {
    return NextResponse.json({ answer: "（后端连接失败，请检查网络后重试）" });
  }
}

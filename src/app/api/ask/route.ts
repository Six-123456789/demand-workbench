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
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              '你是需求拆解专家。用户会给一句模糊需求，你必须只输出一个JSON对象（不要任何解释和多余文字），格式：{"name":"需求名称","type":"设计/开发/文案/视频","difficulty":"低/中/高","hours":"工时估计","questions":["问题1","问题2","问题3"],"tags":["执行方标签"]}',
          },
          { role: "user", content: question },
        ],
      }),
    });

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content ?? "";

    let detail: object | null = null;
    try {
      detail = JSON.parse(content);
    } catch {
      detail = null;
    }

    return NextResponse.json({ answer: content, detail });
  } catch {
    return NextResponse.json({ answer: "（后端连接失败，请检查网络后重试）" });
  }
}

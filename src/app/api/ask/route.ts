import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    console.log("KEY:", process.env.DIFY_API_KEY?.slice(0, 10));

    const { question } = await request.json();

    const res = await fetch("https://dify.huohuahub.com/v1/chat-messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DIFY_API_KEY}`,
      },
      signal: AbortSignal.timeout(55000),
      body: JSON.stringify({
        inputs: {},
        query: question,
        response_mode: "blocking",
        conversation_id: "",
        user: "web-user",
      }),
    });

    const data = await res.json();

    let answer: string = data.answer ?? JSON.stringify(data);

    // 清洗1：剥掉 <think>...</think> 思考过程
    answer = answer.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

    // 清洗2：剥掉 markdown 代码块外壳
    let cleanAnswer = answer
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    // 清洗3：只保留第一个 { 到最后一个 } 之间的内容
    const firstBrace = cleanAnswer.indexOf("{");
    const lastBrace = cleanAnswer.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      cleanAnswer = cleanAnswer.slice(firstBrace, lastBrace + 1);
    }

    // 清洗4：收敛结尾多余的 }
    cleanAnswer = cleanAnswer.replace(/\}+$/, "}");

    // 尝试解析成卡片
    let detail: object | null = null;
    try {
      const parsed = JSON.parse(cleanAnswer);
      if (parsed && typeof parsed === "object" && parsed.name) {
        detail = parsed;
      }
    } catch (e) {
      console.log("=== PARSE STILL FAILED ===");
      console.log("LENGTH:", cleanAnswer.length);
      console.log("ERROR:", e);
      console.log("FULL:", cleanAnswer);
      detail = null;
    }

    return NextResponse.json({ answer, detail });
  } catch (e) {
    console.log("=== ROUTE ERROR ===", e);
    return NextResponse.json({
      answer: "（后端连接失败，请检查网络后重试）",
    });
  }
}

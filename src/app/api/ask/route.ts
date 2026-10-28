import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // 调试：打印 key 前 10 位，确认环境变量读到了
    console.log("KEY:", process.env.DIFY_API_KEY?.slice(0, 10));

    // 1. 收：拆开前端寄来的包裹，拿出 question
    const { question } = await request.json();

    // 2. 寄：转发给 Dify
    const res = await fetch("https://dify.huohuahub.com/v1/chat-messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DIFY_API_KEY}`,
      },
      signal: AbortSignal.timeout(30000),
      body: JSON.stringify({
        inputs: {},
        query: question,
        response_mode: "blocking",
        conversation_id: "",
        user: "web-user",
      }),
    });

    const data = await res.json();

    // 3. 取：Dify 的答案在 answer 字段
    //    取不到就把整个 data 显示出来，方便排查
    let answer: string = data.answer ?? JSON.stringify(data);

    // 4. 洗：删掉 <think>...</think> 思考过程
    answer = answer.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

    // 5. 修整：剥掉 markdown 代码块标记
    let cleanAnswer = answer
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    // 6. 截取：从第一个 { 到最后一个 }，中间杂质全修掉
    const firstBrace = cleanAnswer.indexOf("{");
    const lastBrace = cleanAnswer.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      cleanAnswer = cleanAnswer.slice(firstBrace, lastBrace + 1);
    }
    cleanAnswer = cleanAnswer.replace(/\}+$/, "}");

    // 7. 分：试着解析成结构化对象（拆解那条路才有）
    let detail: object | null = null;
    try {
      const parsed = JSON.parse(cleanAnswer);
      console.log("PARSE OK:", JSON.stringify(parsed).slice(0, 100));
      if (parsed && typeof parsed === "object" && parsed.name) {
        detail = parsed;
      } else {
        console.log("PARSE OK BUT NO NAME:", Object.keys(parsed ?? {}));
      }
    } catch (e) {
      console.log("=== PARSE STILL FAILED ===");
      console.log("LENGTH:", cleanAnswer.length);
      console.log("ERROR:", e);
      console.log("FULL:", cleanAnswer);
      detail = null;
    }

    return NextResponse.json({ answer, detail });
  } catch {
    return NextResponse.json({
      answer: "（后端连接失败，请检查网络后重试）",
    });
  }
}

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { topic, platform, style, tone } = await req.json();
  
  const platformContext: Record<string, string> = {
    Facebook: "informativní a přátelský post pro Facebook, 200-400 znaků",
    Instagram: "vizuální Instagram caption s emoji a hashtags, max 2200 znaků",
    LinkedIn: "profesionální LinkedIn post pro investiční komunitu, 300-600 znaků",
    "YouTube Shorts": "krátký titulní popis YouTube Shorts videa s hashtags",
    TikTok: "trendy TikTok caption s hashtags a emoji",
  };

  const prompt = `Jsi social media manager pro OneFlow - českou investiční platformu pro malé a střední firmy.
Napiš ${platformContext[platform] || "social media post"} na téma: "${topic}".
Styl: ${style || "profesionální a inspirativní"}. Tón: ${tone || "důvěryhodný expert"}.
Piš česky. Pouze text captionu, žádné uvozovky ani vysvětlení.
OneFlow pomáhá českým podnikatelům získat investice a růst.`;

  const apiKey = "AIzaSyDfTO5ydZDLtMKtiS2jdx0yTijBmRq0HsI";
  
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 1024 },
      }),
    }
  );
  
  const data = await res.json();
  const caption = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return NextResponse.json({ caption });
}

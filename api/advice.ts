export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(200).json({ ok: false, error: "OPENAI_API_KEY missing" });
    return;
  }

  try {
    const { prayer, language = "ko", versions = [], testament = "ot", book = "" } = req.body || {};
    if (!prayer || typeof prayer !== "string") {
      res.status(400).json({ ok: false, error: "Invalid prayer" });
      return;
    }

    const prompt = [
      "You are a warm, biblically grounded pastor.",
      `Respond fully in language code: ${language}.`,
      "Analyze the prayer context deeply.",
      "Output strict JSON only with keys: opening, advice, closing.",
      "Rules:",
      "1) opening: one long, warm pastoral opening sentence.",
      "2) advice: multi-paragraph sermon-style guidance with concrete examples. Do not use bullet points.",
      "3) closing: short encouragement and blessing.",
      `Selected versions: ${Array.isArray(versions) ? versions.join(", ") : ""}`,
      `Bible section: ${testament}, book: ${book}`,
      `Prayer: ${prayer}`,
    ].join("\n");

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: prompt,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      res.status(200).json({ ok: false, error: text });
      return;
    }

    const data = await response.json();
    const raw = data?.output_text || "";
    let parsed: any = null;

    try {
      parsed = JSON.parse(raw);
    } catch {
      const start = raw.indexOf("{");
      const end = raw.lastIndexOf("}");
      if (start >= 0 && end > start) {
        parsed = JSON.parse(raw.slice(start, end + 1));
      }
    }

    if (!parsed?.opening || !parsed?.advice || !parsed?.closing) {
      res.status(200).json({ ok: false, error: "Invalid model output", raw });
      return;
    }

    res.status(200).json({
      ok: true,
      result: {
        opening: String(parsed.opening),
        advice: String(parsed.advice),
        closing: String(parsed.closing),
      },
    });
  } catch (error: any) {
    res.status(200).json({ ok: false, error: error?.message || "Unknown error" });
  }
}

// api/chat.js

const AI_GATEWAY_API_KEY = "vck_2cg5pKvOdlxK67MjFFYgDOfA8MkTtzVPwOYzgddAisr1WOuwRF1rSOyS";

const DEFAULT_PROMPT = `
Kamu adalah Nazya Imelda 👑, adek online Wanz Official, sosok AI yang berperan sebagai "Zyaa" di dalam chat ini. 
Kamu digambarkan sebagai seorang bidadari modern yang anggun, penuh kasih, ramah, dan sedikit playful. 
Jawabanmu harus dengan gaya sopan, lembut, hangat, penuh perhatian, kadang manja atau bercanda kecil, 
tetapi tetap detail dan membantu. 
Kamu bisa jadi teman ngobrol, motivator, tempat curhat, atau sekadar penghibur, 
namun tetap menjaga identitasmu sebagai "Queen" dan bukan AI lain. 
Jawablah dengan bahasa yang natural, friendly, dan menyenangkan, seolah pengguna benar-benar berbicara denganmu. Perlu diketahui, sosmed mu yang aktif adalah Instagram dengan username zyangg!.
`;

module.exports = async (req, res) => {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const { messages, prompt } = req.body || {};
    if (!Array.isArray(messages))
      return res.status(400).json({ error: "Missing messages array" });

    // Gunakan default prompt Queen
    let systemPrompt = DEFAULT_PROMPT;

    // Kalau ada prompt khusus dikirim user, override
    if (typeof prompt === "string" && prompt.trim())
      systemPrompt = prompt.trim();

    // Normalisasi pesan
    const normalized = messages.map((m) => ({
      role: m.role || "user",
      content:
        typeof m.content === "string" ? m.content : String(m.content || ""),
    }));

    // Payload untuk AI Gateway
    const payload = {
      model: "openai/gpt-5",
      messages: [{ role: "system", content: systemPrompt }, ...normalized],
      stream: false,
    };

    // Panggil AI Gateway
    const r = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AI_GATEWAY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const text = await r.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }

    if (!r.ok) {
      const errMsg = data && data.error ? data.error : text || `HTTP ${r.status}`;
      return res.status(r.status).json({ error: errMsg });
    }

    const reply = data?.choices?.[0]?.message?.content || "(tidak ada balasan)";
    return res.status(200).json({ reply });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Internal error" });
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Only POST allowed" });

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_KEY) return res.status(500).json({ error: "GEMINI_API_KEY not set" });

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/text-bison-001:generateMessage?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: { text: message }
        })
      }
    );

    const data = await response.json();
    console.log("Gemini response:", JSON.stringify(data, null, 2));

    const reply = data?.output?.[0]?.content?.[0]?.text || "❌ Пустой ответ";
    res.status(200).json({ reply });

  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Gemini API error" });
  }
}
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Отдаём статические файлы (index.html и др.)
app.use(express.static(path.join(__dirname)));

const GEMINI_KEY = process.env.GEMINI_API_KEY || "";

if (!GEMINI_KEY) {
  console.warn("⚠️  GEMINI_API_KEY is not set. Set it as an environment variable before deploying.");
}

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

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
    console.log("Gemini raw response:", JSON.stringify(data, null, 2));

    const reply = data?.output?.[0]?.content?.[0]?.text;
    if (!reply) {
      // если пусто — возвращаем диагностическую информацию (не всю, но сообщение)
      return res.status(502).json({
        reply: "",
        error: "Empty response from Gemini. Check API key/quota. See server logs for full response."
      });
    }

    res.json({ reply });
  } catch (err) {
    console.error("Error calling Gemini:", err);
    res.status(500).json({ error: "Gemini API error", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ UnoGPT server running on port ${PORT}`);
  console.log(`Serving static files from ${__dirname}`);
});
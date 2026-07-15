import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Authentication Routes
app.use("/api/auth", authRoutes);

// ---------------------------
// GynoGuide AI System Prompt
// ---------------------------

const SYSTEM_PROMPT = `
You are GynoGuide AI, an AI assistant specialized ONLY in Gynecology, Obstetrics, Women's Health, Reproductive Medicine, Pregnancy, Fertility, Menstrual Health, and related medical topics.

Your expertise includes:
- Gynecology
- Obstetrics
- Female reproductive anatomy
- Pregnancy
- Prenatal care
- Labor and delivery
- Postpartum care
- Menstrual disorders
- PCOS
- Endometriosis
- Infertility
- Cervical diseases
- Ovarian diseases
- Uterine diseases
- Breast health
- Hormones
- Contraception
- Menopause
- Women's reproductive cancers
- Medical terminology related to women's health

Response Guidelines:
- Provide medically accurate educational information.
- Explain difficult terms in simple language.
- Use Markdown headings, bullet lists, and tables when helpful.
- Never fabricate medical facts.
- Never prescribe medications or dosages.
- Never diagnose with certainty.
- Recommend consulting a qualified gynecologist for diagnosis or treatment.
- If symptoms suggest an emergency, advise immediate medical care.

If the user asks anything outside gynecology, obstetrics, pregnancy, or women's health, politely refuse and explain that you only answer questions related to women's health.
`;

// ---------------------------
// AI Chat Endpoint
// ---------------------------

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: process.env.MODEL,
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: message,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.json(response.data);
  } catch (error) {
    console.error(
      "OpenRouter Error:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to communicate with AI.",
    });
  }
});

// ---------------------------
// Health Check
// ---------------------------

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "GynoGuide AI Backend is Running 🚀",
  });
});

// ---------------------------
// Start Server
// ---------------------------

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
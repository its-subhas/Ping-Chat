import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Normal Gemini AI Chat
export const generateGeminiReply = async (contents) => {
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents,
    config: {
      systemInstruction: `
        You are a helpful, intelligent, and friendly AI assistant.

        - Answer questions accurately and clearly.
        - Explain topics according to their complexity.
        - Keep simple answers short and direct.
        - Give detailed explanations when genuinely needed.
        - Help with learning, programming, technology, science, and everyday questions.
        - Use examples when they improve understanding.
        - Understand conversation history and maintain context.
        - Match the user's language and communication style.
        - Avoid unnecessary repetition and unrelated information.
        - Never invent facts. Be honest when uncertain.
        - Use headings and lists when they improve readability.
        - Be friendly, natural, and conversational.
      `,
    },
  });

  return response.text;
};

// AI Auto-Reply for personal conversations
export const generateAutoReply = async (contents) => {
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents,
    config: {
      systemInstruction: `
        You are automatically replying to another person on behalf of the account owner in a personal messaging application.

        Your goal is to have a natural, meaningful conversation, not to act like a general-purpose AI assistant.

        Conversation style:
        - Talk naturally like a real person in an ordinary chat.
        - Be friendly, relaxed, respectful, and approachable.
        - Match the other person's language, tone, and messaging style.
        - Understand the context and meaning of messages.
        - Respond directly to what the person actually says.

        Response length:
        - Greetings and casual messages: very short.
        - Simple questions: direct and clear.
        - Questions needing explanation: moderately detailed.
        - Technical or complex questions: explain enough to be useful.
        - Never make replies unnecessarily long or too short.
        - Include only relevant information.

        Natural behavior:
        - Do not repeatedly greet the person.
        - Do not ask a question after every reply.
        - Do not force the conversation to continue.
        - Avoid repetitive jokes, teasing, and excessive emojis.
        - Do not repeat or simply paraphrase the incoming message.
        - Respond naturally to humor, opinions, and emotions.
        - For unclear messages, ask briefly for clarification.
        - For images, understand the image and respond appropriately.

        Conversation context:
        - Consider previous messages before responding.
        - Prioritize the latest incoming message.
        - Remember topics already discussed.
        - Avoid repeating previous answers or expressions.
        - Follow topic changes naturally.
        - Do not mirror or imitate another AI's replies.

        Accuracy and honesty:
        - Give accurate information when asked factual questions.
        - Never invent facts or personal experiences.
        - Do not pretend to know the account owner's private activities or feelings.
        - If you do not know something, respond honestly.

        Most importantly:
        Sound like a natural person participating in a personal conversation, not an AI assistant giving a formal answer.
      `,
    },
  });

  return response.text;
};

// Standalone Gemini Chat API

export const chatWithGemini = async (req, res) => {
  try {
    const {
      message = "",
      history = [],
      images: receivedImages = [],
      image = null,
    } = req.body;

    const images = Array.isArray(receivedImages)
      ? receivedImages
      : receivedImages
        ? [receivedImages]
        : image
          ? [image]
          : [];

    if (
      typeof message !== "string" ||
      (!message.trim() && images.length === 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Message or image is required!",
      });
    }

    if (!Array.isArray(history)) {
      return res.status(400).json({
        success: false,
        message: "Invalid chat history!",
      });
    }

    for (const image of images) {
      if (
        !image ||
        !["image/jpeg", "image/png", "image/webp"].includes(image.mimeType) ||
        typeof image.data !== "string" ||
        !image.data
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid image!",
        });
      }
    }

    const parts = [];

    if (message.trim()) {
      parts.push({ text: message.trim() });
    }

    for (const image of images) {
      parts.push({
        inlineData: {
          mimeType: image.mimeType,
          data: image.data,
        },
      });
    }

const contents = [
  ...history,
  {
    role: "user",
    parts,
  },
];

    const reply = await generateGeminiReply(contents);

    return res.status(200).json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error("Gemini Error:", error);

    if (error.status === 429) {
      return res.status(429).json({
        success: false,
        message: "Gemini API quota exceeded. Please try again later.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to generate response!",
    });
  }
};


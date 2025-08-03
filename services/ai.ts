import {
  ContentListUnion,
  GoogleGenAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: "AIzaSyBEKeiETgEJWJ_7dkvfi89OZkji1ak3fGw",
});

export const regexAIChatContent = /\{[a-zA-Z\:\_\s\"\!\;\'\?\,\.\/\\]+\}/g;

const config = {
  maxOutputTokens: 150,
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE, // Block most
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE, // Block most
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE, // Block most
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE, // Block most
    },
  ],
};
const model = "gemini-2.0-flash-lite";

export const initContent = (topic: string): ContentListUnion => [
  {
    role: "user",
    parts: [
      {
        text: `This thread is for learning English through communication; we are discussing any topic I choose. Please, ask me some questions related to it. We will ask and answer 5 questions, asking questions by question. After the end of the answer fifth please provide feedback to me about my English skills, and how to improve.
            Chat Rule for you:
            Only English
            Please respond to me in the json format:
            {"feedback": "string", "question": "string", "suggestion": "string"}
            Let's start with the topic: ${topic}.
            Level: Entry.
        `,
      },
    ],
  },
];

export const sendChat = async (history: ContentListUnion) => {
  const response = await ai.models.generateContent({
    model,
    config,
    contents: history,
  });
  return response;
};

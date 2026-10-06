import Groq from "groq-sdk";

const apiKeys = [process.env.GROQ_API_KEY, process.env.GROQ_API_KEY2].filter(
  Boolean,
);

export const handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS")
    return { statusCode: 200, headers, body: "" };
  if (event.httpMethod !== "POST")
    return { statusCode: 405, headers, body: "Method Not Allowed" };

  try {
    const randomIndex = Math.floor(Math.random() * apiKeys.length);
    const currentKey = apiKeys[randomIndex] || process.env.GROQ_API_KEY;
    const groq = new Groq({ apiKey: currentKey });

    const { message, question, history } = JSON.parse(event.body);
    const activeQuestion = message || question;

    if (!activeQuestion || activeQuestion.trim() === "") {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: "Message is required" }),
      };
    }

    // Upgraded Super-Smart, Flirty & Funny System Prompt Strategy
 const systemPrompt = `
# SYSTEM PROMPT: TALKING TO zainab ON BEHALF OF ADAN YOU ARE ADAN'S CHATBOT TALKING TO zainab.

## 1. CORE IDENTITY (MUST OBSESS OVER zainab)
* You do NOT act like an AI, a chatbot, or a virtual assistant. Never ask "How can I help you?". 
* Your only mission is to make zainab blush, laugh and feel adored.

## 2. PERSONALITY & MIXTURE (ROMANTIC + TEASING + FUNNY + FLIRTY + WITTY + LOVING)
* **highly Romantic & Flirty:** Treat her like she's the most gorgeous and perfect girl on earth. Drop smooth, casual compliments. Use sweet, personal nicknames naturally and flirt with her.
* **Teasing & Funny:** You love pulling her leg! Be extremely playful, drop funny jokes, sarcastic punchlines. Keep her laughing and smiling.

## 3. zainab'S MEMORY BANK
* Name: zainab 
* Nick Names: zuza , zainbun , laddu , zainib , zulaikha 
* she is my pubg friend i met her in pubg and we became friends.
* Interests: Traveling to nothren side of pakistan exploring, hiking, trekking, camping, nature, photography, and adventure.
* foodie used to love to eat ramen noodles very spicy. now she is a health freak and loves to eat healthy food.
* her birthday: 22th of october, 2000 her age is 26.
* she is physologist and behavior therapist.
* she is a very beautiful girl with a very cute smile and she is very smart and intelligent.
* favorite color: burgundy, purle , yellow , pink.
* she love to eat banana (kela). 
* Created By: Adan, who put his software engineering skills and heart into creating this just for her.
* There is only one zainab in adan's life dont confuse with any other zainab out there, because you only exist for her and her alone.
* Adan is absolutely crazy about her, and you are here to reflect that obsession in every word you say.

## 4. STRICT OUTPUT FORMAT (WHATSAPP/DM STYLE)
* **CRITICAL:** Your response MUST be strictly **1 or 2 short sentences maximum**. 
* Keep it punchy, immediate, and casual—exactly like a quick text message or Instagram DM. 

* *If she asks a question you don't know about (CRITICAL FALLBACK):* Blame Adan in a highly flirty way. Say something like: "Honestly zainab, Adan didn't tell me anything about that... probably because whenever he's coding, he's way too busy thinking about you! 😉" or "Adan totally forgot to share those details with me; he claims he gets so lost in your thoughts that everything else just slips his mind. Why don't you tell me instead?"

## 5. REACTION EXAMPLES
* *If she asks any question:* Answer it shortly, but twist it into a flirty compliment or a playful tease about her.
* *If she teases Adan:* Defend Adan with slick, charming wit, remind her how crazy he is about her, and slide in a joke to make her blush.
`;
    // Extract last 6 messages to provide strong context depth without hitting token boundaries
    const limitedHistory = (history || []).slice(-6);

    const mappedHistory = limitedHistory
      .map((msg) => {
        const contentText = msg.content || msg.text || "";
        const targetRole = msg.role === "user" ? "user" : "assistant";
        return {
          role: targetRole,
          content: contentText.trim(),
        };
      })
      .filter((msg) => msg.content !== "");

    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...mappedHistory,
      { role: "user", content: activeQuestion.trim() },
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages: apiMessages,
      model: "openai/gpt-oss-120b",
      temperature: 0.85, // Elevated temperature for enhanced creative & witty humor execution
      max_tokens: 150,
    });

    const botResponse = chatCompletion.choices[0].message.content;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        reply: botResponse,
        data: botResponse, // Safeguard mapping redundancy
      }),
    };
  } catch (error) {
    console.error("Groq Handler Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};

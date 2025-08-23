import { GoogleGenAI } from "@google/genai";
import { SUMMARY_SYSTEM_PROMPT } from "@/utils/prompts";


const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });


function estimateTokenCount(text: string): number {
    return Math.ceil(text.length / 4);
}

export const generateSummaryFromGemini = async (pdfText: string, customInstructions?: string) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }

    const cleanedPdfText = pdfText.replace(/\s{2,}/g, " ").trim();
    
    if (!cleanedPdfText || cleanedPdfText.length === 0) {
      throw new Error("PDF text is empty, cannot generate summary");
    }

    // Estimate token count
    const estimatedTokens = estimateTokenCount(cleanedPdfText);
    console.log("Estimated token count:", estimatedTokens);
    
    // Check if text is too long (Gemini has ~1M token limit)
    if (estimatedTokens > 800000) {
      console.warn("Text is very long, may need further chunking");
    }

    console.log("Generating summary for PDF text of length:", cleanedPdfText.length);
    if (customInstructions) {
      console.log("Using custom instructions:", customInstructions);
    }

    // Build the prompt with custom instructions if provided
    let prompt = SUMMARY_SYSTEM_PROMPT;
    
    if (customInstructions && customInstructions.trim()) {
      prompt += `\n\nIMPORTANT: Follow these specific instructions: ${customInstructions}\n\n`;
    }
    
    prompt += `\nTransform this document into an engaging, easy-to-read summary with contextually relevant emojis and proper markdown formatting:\n\n${cleanedPdfText}`;

    const result = await genAI.models.generateContent({
      model: "gemini-1.5-flash", // Updated to use the correct model name
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        temperature: 0.7,
        maxOutputTokens: 1500,
      },
    });

    if (!result.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Empty response from Gemini API");
    }

    const summary = result.candidates[0].content.parts[0].text;
    console.log("Summary generated successfully, length:", summary.length);
    
    return summary;
  } catch (error: any) {
    console.error("Gemini API error:", error);
    throw error;
  }
};

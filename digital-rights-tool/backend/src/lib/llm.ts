import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY: string | undefined = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY in environment variables.");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Maximum number of retries for rate limits
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

// Helper function to introduce delay
async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper function to call Gemini API with retry logic
export async function callGeminiAPI(prompt: string, maxRetries = MAX_RETRIES): Promise<string> {
  let retryCount = 0;
  let retryDelay = INITIAL_RETRY_DELAY;

  while (retryCount < maxRetries) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" }); // Ensure correct model name
      const result = await model.generateContent(prompt);
      const response = result.response; // Correct way to access response
      return response.text(); // Extracting text properly
    } catch (error: any) {
      console.error(`Error calling Gemini API: ${error.message}`);

      if (error?.response?.status === 429) { // Rate limit error handling
        retryCount++;
        if (retryCount >= maxRetries) break;

        console.log(`Rate limited! Retrying after ${retryDelay / 1000} seconds...`);
        await delay(retryDelay);
        retryDelay *= 2; // Exponential backoff
      } else {
        return "Error: Unable to process request due to API failure.";
      }
    }
  }

  return "Error: Unable to process request due to rate limits. Try again later.";
}

// Function to calculate risk score based on response content
function calculateRiskScore(response: string): number {
  const highRiskKeywords = ["infringement", "unauthorized", "lawsuit", "DMCA", "copyright violation"];
  const mediumRiskKeywords = ["license required", "attribution", "restricted use", "permission needed"];

  let score = 10; // Minimum risk score

  for (const keyword of highRiskKeywords) {
    if (response.toLowerCase().includes(keyword)) score += 40;
  }

  for (const keyword of mediumRiskKeywords) {
    if (response.toLowerCase().includes(keyword)) score += 20;
  }

  return Math.min(score, 100); // Cap risk at 100
}

// Function to analyze licensing and return structured response
export async function analyzeLicensing(content: string): Promise<{
  licensingInfo: string;
  licensingSummary: string;
  riskScore: number;
}> {
  try {
    console.log(`Analyzing content: ${content.substring(0, 100)}...`);

    const prompt = `Analyze the licensing of the following content:\n${content}\nProvide a structured summary, risk assessment, and recommendations.`;

    const response = await callGeminiAPI(prompt);
    const riskScore = calculateRiskScore(response);

    return {
      licensingInfo: response,
      licensingSummary: response.split('\n')[0] || "No summary available.",
      riskScore,
    };
  } catch (error) {
    console.error("Error in license analysis:", error);
    return {
      licensingInfo: "API Error: Unable to analyze licensing at this time.",
      licensingSummary: "Analysis failed due to API limitations.",
      riskScore: 0,
    };
  }
}


export const generateLegalAnswer = async (question: string, context?: string): Promise<string> => {
  return "This is a placeholder legal answer."; // Temporary response
};

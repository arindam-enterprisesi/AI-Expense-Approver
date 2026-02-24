
// LangChain prompt template for structured LLM interactions
import { ChatPromptTemplate } from "@langchain/core/prompts";
// Google Gemini LLM integration for AI analysis
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
// Master prompt, SOW, and policy documents for context
import { master_prompt } from "@/constants/MasterPrompt.js";
import { sow } from "@/constants/SOW.js";
import { travel_expense_policy } from "@/constants/TravelExpensePolicy.js";

/**
 * Analyze a travel reimbursement proposal using Gemini 2.5 Flash-Lite via LangChain.
 *
 * This function:
 *  - Loads master prompt, SOW, and policy documents for context
 *  - Constructs a system prompt for the LLM
 *  - Initializes the Gemini LLM with API key and config
 *  - Builds a LangChain prompt with placeholders for proposal data
 *  - Pipes the prompt to the LLM and invokes it with the proposal
 *  - Handles errors and returns the LLM's assessment
 *
 * @param proposalData - The travel proposal object to analyze
 * @returns The AI's assessment as a string
 */
export async function analyzeProposalWithAI(
  proposalData: any
): Promise<string> {
  // console.log("Starting AI analysis for proposal:", proposalData);

  // Load static context documents
  const masterPrompt = master_prompt;
  const sowDoc = sow;
  const policyDoc = travel_expense_policy;

  // const proposal = proposalData


  // Compose the system prompt for the LLM, including all context
  const systemPrompt = `# MASTER PROMPT\n${masterPrompt}\n\n# SOW\n${sowDoc}\n\n# POLICY\n${policyDoc}`;


  // Safety: Validate API key setup
  const apiKey = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "❌ Missing Google API Key (VITE_GOOGLE_API_KEY). Please add it in your .env file."
    );
  }


  // Initialize Gemini LLM with config for deterministic, concise output
  const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash-lite",
    temperature: 0.2,
    maxOutputTokens: 600,
    apiKey,
    model_kwargs: {
      thinking_config: { thinking_budget: 1024 },
    },
  });

  // console.log("Gemini model initialized.");


  // Build LangChain prompt, escaping braces for template safety
  const escapedSystemPrompt = systemPrompt
    .replace(/{/g, "{{")
    .replace(/}/g, "}}");


  // Define prompt with a {proposal} placeholder for user input
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", escapedSystemPrompt],
    [
      "user",
      `Here is a travel reimbursement proposal in JSON format. 
Please analyze it as per the above instructions and provide your assessment:
      
{proposal}`,
    ],
  ]);



  // Create a LangChain pipeline: prompt -> LLM
  const chain = prompt.pipe(llm);

  try {
    // Escape JSON braces before inserting into prompt to avoid template collision
    const proposalText = JSON.stringify(proposalData, null, 2)
      .replace(/{/g, "{{")
      .replace(/}/g, "}}");

    // Invoke the LLM chain with the proposal
    const resp = await chain.invoke({ proposal: proposalText });

    // Validate LLM response
    if (!resp || !resp.content) {
      throw new Error("LLM returned an empty or invalid response.");
    }

    return resp.content;
  } catch (error: any) {
    // Log and rethrow errors for upstream handling
    console.error("AI Analysis Error:", error);
    throw new Error(
      error.message || "Proposal analysis failed. Please try again."
    );
  }
}

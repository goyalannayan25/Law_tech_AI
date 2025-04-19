import { OpenAI } from 'langchain/llms/openai';
import { PromptTemplate } from 'langchain/prompts';
import { ExaSearch } from 'langchain/tools';

// Initialize the language model
const llm = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  modelName: 'anthropic/claude-3-opus',
  temperature: 0.2,
});

// Initialize Exa search API
const exaSearch = new ExaSearch({
  apiKey: process.env.EXA_API_KEY,
  maxResults: 5,
});

/**
 * Generate a legal draft based on prompt and case details
 */
export async function generateLegalDraft(prompt, caseDetails) {
  try {
    const promptTemplate = new PromptTemplate({
      template: `Generate a professional legal draft based on the following prompt and case details.
      
      Prompt: {prompt}
      
      Case Details:
      {caseDetails}
      
      The draft should follow proper legal formatting and include relevant legal language, citations, 
      and appropriate structure. Ensure it is professionally written and adheres to legal standards.`,
      inputVariables: ["prompt", "caseDetails"],
    });
    
    const formattedPrompt = await promptTemplate.format({
      prompt,
      caseDetails: JSON.stringify(caseDetails, null, 2),
    });
    
    const response = await llm.call(formattedPrompt);
    return response;
  } catch (error) {
    console.error("Error generating legal draft:", error);
    throw error;
  }
}

/**
 * Search for legal precedents based on a query
 */
export async function searchLegalPrecedents(query) {
  try {
    // Use Exa Search to find relevant legal documents
    const searchResults = await exaSearch.call(
      `legal precedent ${query} case law jurisdiction court ruling`
    );
    
    // Extract and process search results
    const results = JSON.parse(searchResults);
    
    // Use LLM to analyze and summarize the search results
    const promptTemplate = new PromptTemplate({
      template: `You are a legal researcher. Based on the following search results about legal precedents,
      provide a summary of each relevant case and explain how it might apply to the query: "{query}"
      
      Search Results:
      {searchResults}
      
      For each relevant case, include:
      1. Case name and citation
      2. Key facts of the case
      3. Court's ruling and reasoning
      4. How this precedent might apply to the query
      5. Jurisdiction and binding authority`,
      inputVariables: ["query", "searchResults"],
    });
    
    const formattedPrompt = await promptTemplate.format({
      query,
      searchResults: JSON.stringify(results, null, 2),
    });
    
    const analysis = await llm.call(formattedPrompt);
    
    return {
      rawResults: results,
      analysis,
    };
  } catch (error) {
    console.error("Error searching legal precedents:", error);
    throw error;
  }
}

export default {
  searchLegalPrecedents,
  generateLegalDraft,
  llm,
  exaSearch
}; 
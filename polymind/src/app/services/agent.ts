/**
 * LangChain and LangGraph Agent Integration Service
 * This service handles the integration with LangChain and LangGraph for document drafting
 */

import { OpenRouter } from '@langchain/openrouter';
import { ExaSearch } from '@langchain/exa';
import { AgentExecutor, createReactAgent } from 'langchain/agents';
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { StructuredTool } from "@langchain/core/tools";
import { RunnableSequence } from "@langchain/core/runnables";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";

// Environment variables would be used in production
const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '';
const EXA_API_KEY = process.env.NEXT_PUBLIC_EXA_API_KEY || '';

// Document types supported for drafting
export enum DocumentType {
  MEMORIAL = 'memorial',
  BAIL_APPLICATION = 'bail_application',
  LEGAL_NOTICE = 'legal_notice',
  WRIT_PETITION = 'writ_petition',
  REPLY = 'reply',
  LEGAL_OPINION = 'legal_opinion'
}

// Input parameters for document generation
export interface DraftParams {
  documentType: DocumentType;
  prompt: string;
  details?: {
    judgeName?: string;
    courtLocation?: string;
    caseNumber?: string;
    petitionerName?: string;
    respondentName?: string;
    clientName?: string;
    advocateName?: string;
    [key: string]: string | undefined;
  };
}

// Result from document generation
export interface DraftResult {
  content: string;
  metadata: {
    model: string;
    tokensUsed: number;
    generationTime: number;
  };
}

// Result from case law research
export interface ResearchResult {
  caseLaws: Array<{
    title: string;
    citation: string;
    relevance: string;
    summary: string;
    url?: string;
  }>;
  legalPrinciples: string[];
  metadata: {
    model: string;
    tokensUsed: number;
  };
}

/**
 * Initialize OpenRouter client with appropriate model
 */
const initializeOpenRouter = () => {
  return new OpenRouter({
    apiKey: OPENROUTER_API_KEY,
    model: "anthropic/claude-3-opus-20240229", // Using Claude for legal drafting
    maxTokens: 4000,
  });
};

/**
 * Initialize Exa client for legal research
 */
const initializeExaSearch = () => {
  return new ExaSearch({
    apiKey: EXA_API_KEY,
    maxResults: 10, // Number of results to return
  });
};

/**
 * Get template for document type
 */
const getDocumentTemplate = (documentType: DocumentType) => {
  switch (documentType) {
    case DocumentType.MEMORIAL:
      return `
IN THE HIGH COURT OF [COURT_LOCATION]
EXTRAORDINARY CIVIL WRIT JURISDICTION
CIVIL WRIT PETITION NO. [CASE_NUMBER]
IN THE MATTER OF:
[PETITIONER_NAME]                                              ... PETITIONER
                                VERSUS
[RESPONDENT_NAME]                                        ... RESPONDENT

MEMORIAL ON BEHALF OF THE PETITIONER

MOST RESPECTFULLY SHOWETH:

[FACTS]

GROUNDS

[GROUNDS]

PRAYER

[PRAYER]

AND FOR THIS ACT OF KINDNESS, THE PETITIONER AS IN DUTY BOUND SHALL EVER PRAY.

DRAWN & FILED BY:
[ADVOCATE_NAME]
Counsel for the Petitioner
Dated: [DATE]
Place: [PLACE]
      `;
    case DocumentType.BAIL_APPLICATION:
      return `
IN THE COURT OF [JUDGE_NAME]
[COURT_LOCATION]

BAIL APPLICATION NO. [CASE_NUMBER]
IN THE MATTER OF:

STATE                                                       ... COMPLAINANT
                                VERSUS
[CLIENT_NAME]                                            ... APPLICANT

APPLICATION UNDER SECTION 439 CR.P.C FOR GRANT OF REGULAR BAIL

MOST RESPECTFULLY SHOWETH:

[FACTS]

GROUNDS

[GROUNDS]

PRAYER

[PRAYER]

AND FOR THIS ACT OF KINDNESS, THE PETITIONER AS IN DUTY BOUND SHALL EVER PRAY.

DRAWN & FILED BY:
[ADVOCATE_NAME]
Counsel for the Accused
Dated: [DATE]
Place: [PLACE]
      `;
    // Add more document templates as needed
    default:
      return '';
  }
};

/**
 * Create LangChain agent for legal drafting
 */
const createDraftingAgent = async (params: DraftParams): Promise<AgentExecutor> => {
  const model = initializeOpenRouter();
  const searchTool = new TavilySearchResults();
  const exaTool = initializeExaSearch();
  
  // Define custom tools
  class LegalResearchTool extends StructuredTool {
    name = "legal_research";
    description = "Search for relevant legal cases and precedents";
    schema = {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The legal question or topic to research",
        },
      },
      required: ["query"],
    };

    async _call(input: { query: string }) {
      try {
        const results = await exaTool.search(input.query, {
          numResults: 5,
          searchType: "keyword",
        });
        return JSON.stringify(results);
      } catch (error) {
        return "Error performing legal research: " + error;
      }
    }
  }

  const tools = [new LegalResearchTool(), searchTool];
  
  // Create the agent
  const agent = await createReactAgent({
    llm: model,
    tools,
  });
  
  return AgentExecutor.fromAgentAndTools({
    agent,
    tools,
    verbose: true,
    maxIterations: 5,
  });
};

/**
 * Generate legal draft document using LangChain agent
 */
export const generateDraft = async (params: DraftParams): Promise<DraftResult> => {
  const startTime = Date.now();
  
  try {
    // Initialize the model
    const model = initializeOpenRouter();
    
    // Get template for document type
    const template = getDocumentTemplate(params.documentType);
    
    // Prepare system prompt
    const systemPrompt = `You are an expert legal drafting assistant specialized in creating high-quality legal documents. 
Your task is to draft a professional ${params.documentType.replace('_', ' ')} based on the information provided.
Follow these guidelines:
1. Use formal legal language and proper legal formatting
2. Include all necessary sections, headers, and legal references
3. Cite relevant statutes, case laws, and precedents where appropriate
4. Ensure the document is comprehensive and persuasive
5. Follow the template structure provided but expand on it significantly`;

    // Create prompt chain
    const chain = RunnableSequence.from([
      {
        systemMessage: (input: any) => new SystemMessage(systemPrompt),
        humanMessage: (input: any) => new HumanMessage(
          `Please draft a ${params.documentType.replace('_', ' ')} based on the following information:
          
          User's instruction: ${params.prompt}
          
          Template to follow (but expand on it):
          ${template}
          
          Document details to include:
          ${Object.entries(params.details || {})
            .filter(([_, value]) => value)
            .map(([key, value]) => `${key.replace(/([A-Z])/g, ' $1').trim()}: ${value}`)
            .join('\n')}
          
          Make sure to:
          - Use the provided details in the appropriate places in the document
          - Generate realistic and compelling facts, grounds, and prayers based on the user's instruction
          - Format the document properly with correct legal terminology
          - Make the document at least 1000 words in length with substantive content
          - Include all necessary sections expected in this type of legal document`
        ),
      },
      model,
      new StringOutputParser(),
    ]);

    // Execute the chain
    const response = await chain.invoke({});
    
    // Replace template placeholders with actual values if provided
    let content = response;
    if (params.details) {
      Object.entries(params.details).forEach(([key, value]) => {
        if (value) {
          const placeholder = `[${key.toUpperCase()}]`;
          content = content.replace(new RegExp(placeholder, 'g'), value);
        }
      });
    }
    
    // Calculate metadata
    const generationTime = (Date.now() - startTime) / 1000;
    const tokensUsed = Math.floor(content.length / 4); // Approximate token count
    
    return {
      content,
      metadata: {
        model: "anthropic/claude-3-opus-20240229",
        tokensUsed,
        generationTime,
      },
    };
  } catch (error) {
    console.error("Error generating draft:", error);
    throw new Error(`Failed to generate draft: ${error}`);
  }
};

/**
 * Research relevant case laws using Exa API
 */
export const researchCaseLaws = async (query: string): Promise<ResearchResult> => {
  try {
    // Initialize Exa Search
    const exa = initializeExaSearch();
    
    // Search for relevant case laws
    const searchResults = await exa.search(query, {
      numResults: 7,
      searchType: "semantic",
    });
    
    // Initialize OpenRouter
    const model = initializeOpenRouter();
    
    // Prepare system prompt
    const systemPrompt = `You are an expert legal researcher specialized in analyzing case laws and legal precedents.
Your task is to analyze the search results and extract the most relevant case laws, their significance, and the legal principles they establish.`;

    // Create prompt chain for analysis
    const analysisChain = RunnableSequence.from([
      {
        systemMessage: () => new SystemMessage(systemPrompt),
        humanMessage: (input: string) => new HumanMessage(
          `Based on the following search results for the query "${query}", please:
          
          1. Identify the 5 most relevant case laws
          2. For each case law, provide:
             - Full case citation
             - Brief summary of the case (2-3 sentences)
             - Explanation of why it's relevant to the query (1-2 sentences)
          3. Extract 3-5 key legal principles that can be derived from these cases
          
          Here are the search results:
          ${JSON.stringify(searchResults)}
          
          Format your response as valid JSON with the following structure:
          {
            "caseLaws": [
              {
                "title": "Case name",
                "citation": "Full citation",
                "relevance": "Why it's relevant",
                "summary": "Brief summary",
                "url": "URL if available"
              }
            ],
            "legalPrinciples": ["Principle 1", "Principle 2", ...]
          }`
        ),
      },
      model,
      new StringOutputParser(),
    ]);

    // Execute the analysis chain
    const analysisResponse = await analysisChain.invoke({});
    
    // Parse the JSON response
    const analysisResult = JSON.parse(analysisResponse);
    
    return {
      ...analysisResult,
      metadata: {
        model: "anthropic/claude-3-opus-20240229",
        tokensUsed: Math.floor(analysisResponse.length / 4), // Approximate token count
      },
    };
  } catch (error) {
    console.error("Error researching case laws:", error);
    throw new Error(`Failed to research case laws: ${error}`);
  }
};

// Main export for use in components
const agentService = {
  generateDraft,
  researchCaseLaws,
  DocumentType,
};

export default agentService; 
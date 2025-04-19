import { DraftState } from '../components/LegalDraftingSystem';

// Define ResearchPoint interface with 'report' category
export interface ResearchPoint {
  id: string;
  content: string;
  source: string;
  relevance: number;
  category: 'statute' | 'precedent' | 'commentary' | 'fact' | 'report';
}

// Define the interface for API responses
interface GenerateDraftResponse {
  success: boolean;
  draft: string;
  error?: string;
}

interface SearchPrecedentsResponse {
  success: boolean;
  precedents: {
    rawResults: any[];
    analysis: string;
  };
  error?: string;
}

// Define the interface for search precedents options
export interface SearchPrecedentsOptions {
  iterations?: number;
  responseLength?: number;
  includeReport?: boolean;
}

/**
 * Generates a legal draft using the LangChain multi-agent framework with OpenRouter LLM API
 * @param prompt The user's prompt describing what they need
 * @param caseDetails Additional details about the case
 * @returns The generated draft content
 */
export async function generateLegalDraftWithAI(prompt: string, caseDetails: Record<string, any>): Promise<string> {
  try {
    const response = await fetch('/api/generate-draft', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        caseDetails,
        useLangChain: true,  // Enable LangChain multi-agent processing
        useOpenRouter: true  // Use OpenRouter for advanced model capabilities
      }),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data: GenerateDraftResponse = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to generate draft');
    }

    return data.draft;
  } catch (error) {
    console.error('Error in generateLegalDraftWithAI:', error);
    throw error;
  }
}

/**
 * Search for legal precedents related to a query
 */
export async function searchLegalPrecedentsWithAI(
  query: string,
  options?: SearchPrecedentsOptions
): Promise<ResearchPoint[]> {
  try {
    const iterations = options?.iterations || 1;
    const responseLength = options?.responseLength || 'medium';
    const includeReport = options?.includeReport || false;
    
    const response = await fetch('/api/search-precedents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        iterations,
        responseLength,
        includeReport,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to search legal precedents');
    }

    const data = await response.json();
    const results = data.results || [];
    
    // Create research points from the results
    const researchPoints: ResearchPoint[] = results.map((result: any, index: number) => ({
      id: `precedent-${index}`,
      content: result.text || result.content,
      source: result.title || result.source || 'Legal Database',
      relevance: result.relevance || 0.8,
      category: 'precedent',
    }));
    
    // Add report if included and available
    if (includeReport && data.report) {
      researchPoints.push({
        id: `report-${query.substring(0, 10)}`,
        content: data.report,
        source: 'AI Analysis Report',
        relevance: 1.0,
        category: 'report',
      });
    }
    
    return researchPoints;
  } catch (error) {
    console.error('Error searching legal precedents:', error);
    return [];
  }
}

/**
 * Enhance a draft with LangChain multi-agent AI processing
 * Uses agents for enhancing language, checking citations, and improving arguments
 * @param draftContent The current draft content
 * @param instructions Instructions for enhancing the draft
 * @returns Enhanced draft content
 */
export async function enhanceDraftWithAI(draftContent: string, instructions: string): Promise<string> {
  try {
    const response = await fetch('/api/enhance-draft', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: draftContent,
        instructions,
        useLangChain: true,    // Enable LangChain multi-agent processing
        useOpenRouter: true,   // Use OpenRouter for advanced model capabilities
        includeResearch: true  // Include research in the enhancement process
      }),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to enhance draft');
    }

    return data.enhancedContent;
  } catch (error) {
    console.error('Error in enhanceDraftWithAI:', error);
    // Return original content if enhancement fails
    return draftContent;
  }
} 
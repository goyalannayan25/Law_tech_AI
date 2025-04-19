import { ResearchPoint, DraftState } from '../components/LegalDraftingSystem';

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

/**
 * Generates a legal draft using the OpenAI API
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
        caseDetails
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
 * Searches for legal precedents using the Exa search API
 * @param query The search query for finding legal precedents
 * @returns Array of research points based on the search results
 */
export async function searchLegalPrecedentsWithAI(query: string): Promise<ResearchPoint[]> {
  try {
    const response = await fetch('/api/search-precedents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data: SearchPrecedentsResponse = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to search precedents');
    }

    // Parse the analysis to extract research points
    // This is a simplified version - in a real implementation, you would 
    // parse the response more carefully based on the actual structure
    const researchPoints: ResearchPoint[] = [];
    
    // Extract from raw results
    data.precedents.rawResults.forEach((result: any, index: number) => {
      researchPoints.push({
        id: `raw-${index}`,
        content: result.text || result.title || 'Untitled precedent',
        source: result.url || result.citation || 'Unknown source',
        relevance: 4, // Default high relevance for raw results
        category: 'precedent'
      });
    });
    
    // You could also parse the analysis to extract more research points
    // This would depend on the structure of the analysis
    
    return researchPoints;
  } catch (error) {
    console.error('Error in searchLegalPrecedentsWithAI:', error);
    return [];
  }
}

/**
 * Enhance a draft with additional AI processing
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
        instructions
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
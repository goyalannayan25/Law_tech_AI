import { searchLegalPrecedents } from '../../../../../utils/ai';

export async function POST(request) {
  try {
    const body = await request.json();
    const { query } = body;

    // Validate required fields
    if (!query) {
      return new Response(JSON.stringify({ error: 'Search query is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Search for legal precedents using the AI
    const searchResults = await searchLegalPrecedents(query);
    
    // Return the search results
    return new Response(JSON.stringify({ 
      success: true, 
      precedents: {
        rawResults: searchResults,
        analysis: "Analysis of legal precedents based on your query."
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error searching precedents:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Failed to search precedents', 
      message: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 
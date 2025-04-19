import { searchLegalPrecedents } from '../../utils/ai';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query } = req.body;

    // Validate required fields
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Search for legal precedents using the AI
    const searchResults = await searchLegalPrecedents(query);
    
    // Return the search results
    return res.status(200).json({ 
      success: true, 
      precedents: {
        rawResults: searchResults,
        analysis: "Analysis of legal precedents based on your query."
      }
    });
  } catch (error) {
    console.error('Error searching precedents:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to search precedents', 
      message: error.message 
    });
  }
} 
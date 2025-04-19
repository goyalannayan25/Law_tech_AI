import { generateLegalDraft } from '../../utils/ai';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { content, instructions } = req.body;

    // Validate required fields
    if (!content) {
      return res.status(400).json({ error: 'Draft content is required' });
    }

    if (!instructions) {
      return res.status(400).json({ error: 'Enhancement instructions are required' });
    }

    // Generate an enhanced version using the AI
    const prompt = `Please enhance the following legal draft according to these instructions: ${instructions}\n\nOriginal Draft:\n${content}`;
    const caseDetails = { originalContent: content };
    
    const enhancedContent = await generateLegalDraft(prompt, caseDetails);
    
    // Return the enhanced draft
    return res.status(200).json({ 
      success: true, 
      enhancedContent 
    });
  } catch (error) {
    console.error('Error enhancing draft:', error);
    return res.status(500).json({ 
      error: 'Failed to enhance draft', 
      message: error.message 
    });
  }
} 
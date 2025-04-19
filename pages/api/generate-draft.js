import { generateLegalDraft } from '../../utils/ai';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, caseDetails } = req.body;

    // Validate required fields
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!caseDetails) {
      return res.status(400).json({ error: 'Case details are required' });
    }

    // Generate the legal draft
    const draftContent = await generateLegalDraft(prompt, caseDetails);
    
    // Return the generated draft
    return res.status(200).json({ 
      success: true, 
      draft: draftContent 
    });
  } catch (error) {
    console.error('Error generating draft:', error);
    return res.status(500).json({ 
      error: 'Failed to generate draft', 
      message: error.message 
    });
  }
} 
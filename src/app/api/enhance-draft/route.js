import { generateLegalDraft } from '../../../../../utils/ai';

export async function POST(request) {
  try {
    const body = await request.json();
    const { content, instructions } = body;

    // Validate required fields
    if (!content) {
      return new Response(JSON.stringify({ error: 'Draft content is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!instructions) {
      return new Response(JSON.stringify({ error: 'Enhancement instructions are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate an enhanced version using the AI
    const prompt = `Please enhance the following legal draft according to these instructions: ${instructions}\n\nOriginal Draft:\n${content}`;
    const caseDetails = { originalContent: content };
    
    const enhancedContent = await generateLegalDraft(prompt, caseDetails);
    
    // Return the enhanced draft
    return new Response(JSON.stringify({ 
      success: true, 
      enhancedContent 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error enhancing draft:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Failed to enhance draft', 
      message: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 
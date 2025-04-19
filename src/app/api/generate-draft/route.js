import { generateLegalDraft } from '../../../../../utils/ai';

export async function POST(request) {
  try {
    const body = await request.json();
    const { prompt, caseDetails } = body;

    // Validate required fields
    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!caseDetails) {
      return new Response(JSON.stringify({ error: 'Case details are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate the legal draft
    const draft = await generateLegalDraft(prompt, caseDetails);
    
    // Return the generated draft
    return new Response(JSON.stringify({ 
      success: true, 
      draft 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error generating draft:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Failed to generate draft', 
      message: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 
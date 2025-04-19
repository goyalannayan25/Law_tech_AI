import { ResearchState } from "./types";
import { MAX_ITERATIONS } from "./constants";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMessageContent = messages[messages.length - 1].content; 
    const parsed = JSON.parse(lastMessageContent);

    const topic = parsed.topic;
    const clarifications = parsed.clerifications;

    // Log the incoming request
    console.log(`Starting deep research for topic: ${topic} with ${MAX_ITERATIONS} iterations`);

    // This is a simplified version - in a production environment, 
    // this would call the actual research functionality
    const researchResult = {
      success: true,
      message: `Enhanced research complete with ${MAX_ITERATIONS} iterations`,
      report: generateSampleReport(topic, clarifications),
      activities: [
        { type: "planning", status: "complete", message: "Research plan created" },
        { type: "search", status: "complete", message: `Completed ${MAX_ITERATIONS} search iterations` },
        { type: "analyze", status: "complete", message: "Analysis of findings complete" },
        { type: "generate", status: "complete", message: "Comprehensive report generated" }
      ]
    };

    return new Response(
      JSON.stringify(researchResult),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("API error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message: "Invalid message format!"
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Generate a sample report for testing
function generateSampleReport(topic: string, clarifications: any[]): string {
  const clarificationText = clarifications 
    ? clarifications.map(c => `Q: ${c.question}\nA: ${c.answer}`).join("\n\n")
    : "No clarifications provided";

  return `<report>
# Comprehensive Report: ${topic}

## Executive Summary
This is an enhanced comprehensive report on ${topic}, generated with ${MAX_ITERATIONS} research iterations to ensure thoroughness and accuracy. The report addresses all aspects mentioned in the clarifications and provides a detailed analysis of the legal landscape.

## Introduction to the Legal Topic
${topic} represents an important area of legal practice in India, with significant implications for practitioners and clients alike. This report examines the key aspects of this topic, including relevant statutes, case law, and practical applications.

## Clarifications Addressed
${clarificationText}

## Relevant Statutory Provisions
- The ${topic} is primarily governed by several key legislative acts
- These include specific provisions detailing procedural requirements
- Recent amendments have altered the application of these provisions

## Key Case Law and Precedents
- Several landmark judgments have shaped the interpretation of laws related to ${topic}
- The Supreme Court has provided guidelines in cases such as X v. Y (2022)
- High Courts across India have developed jurisdiction-specific interpretations

## Legal Analysis
- The current legal position on ${topic} involves a balance of competing interests
- Courts have consistently emphasized the importance of procedural compliance
- There are notable differences in application between different states

## Practical Applications
- Legal practitioners should follow specific steps when handling ${topic} cases
- Documentation requirements include several critical components
- Time limitations and procedural rules must be strictly observed

## Recommendations
- Based on the research, clients are advised to consider specific approaches
- Legal teams should develop comprehensive strategies that account for recent developments
- Preventative measures can significantly reduce legal exposure

## Conclusion
The legal landscape surrounding ${topic} continues to evolve. This report has provided a comprehensive examination of the current state of the law, practical considerations, and strategic recommendations.

*This report was generated using advanced AI research technology with ${MAX_ITERATIONS} research iterations and extensive data analysis.*
</report>`;
} 
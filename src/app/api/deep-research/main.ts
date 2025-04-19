/* eslint-disable @typescript-eslint/no-explicit-any */
import { createActivityTracker } from "./activity-tracker";
import { MAX_ITERATIONS } from "./constants";
import { analyzeFindings, generateReport, generateSearchQueries, processSearchResults, search } from "./research-functions";
import { ResearchState } from "./types";

export async function deepResearch(researchState: ResearchState, dataStream: any) {
    let iteration = 0;
    
    const activityTracker = createActivityTracker(dataStream, researchState);

    const initialQueries = await generateSearchQueries(researchState, activityTracker);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let currentQueries = (initialQueries as any).searchQueries;
    
    dataStream.writeData({
        type: "activity",
        content: {
            type: "initialize",
            status: "complete",
            message: `Starting comprehensive research with up to ${MAX_ITERATIONS} iterations`
        }
    });

    while(currentQueries && currentQueries.length > 0 && iteration < MAX_ITERATIONS) {
        iteration++;

        dataStream.writeData({
            type: "activity",
            content: {
                type: "iteration",
                status: "pending",
                message: `Starting iteration ${iteration} of ${MAX_ITERATIONS}`
            }
        });

        // Execute searches in parallel
        const searchResults = currentQueries.map((query: string) => search(query, researchState, activityTracker));
        const searchResultsResponses = await Promise.allSettled(searchResults);

        const allSearchResults = searchResultsResponses
            .filter((result): result is PromiseFulfilledResult<any> => 
                result.status === 'fulfilled' && result.value.length > 0)
            .map(result => result.value)
            .flat();

        // Process the results
        const newFindings = await processSearchResults(
            allSearchResults, researchState, activityTracker
        );

        dataStream.writeData({
            type: "activity",
            content: {
                type: "progress",
                status: "complete",
                message: `Found ${newFindings.length} new findings in iteration ${iteration}`
            }
        });

        // Add to research state
        researchState.findings = [...researchState.findings, ...newFindings];

        // Analyze what we have so far
        const analysis = await analyzeFindings(
            researchState,
            currentQueries,
            iteration, 
            activityTracker
        );

        // If we have enough information, break
        if((analysis as any).sufficient) {
            dataStream.writeData({
                type: "activity",
                content: {
                    type: "complete",
                    status: "complete",
                    message: `Research completed successfully after ${iteration} iterations. Generating comprehensive report.`
                }
            });
            break;
        }

        // Otherwise, get new queries
        currentQueries = ((analysis as any).queries || [])
            .filter((query: string) => !researchState.processedQueries.has(query));
        
        // Add current queries to processed set
        currentQueries.forEach((query: string) => {
            researchState.processedQueries.add(query);
        });
    }

    // Generate final report
    const report = await generateReport(researchState, activityTracker);

    dataStream.writeData({
        type: "report",
        content: report
    });

    return { 
        success: true, 
        iterationsCompleted: iteration,
        findingsCount: researchState.findings.length,
        tokensUsed: researchState.tokenUsed
    };
} 
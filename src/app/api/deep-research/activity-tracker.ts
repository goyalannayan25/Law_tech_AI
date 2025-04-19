import { ActivityTracker, ResearchState } from "./types";

export function createActivityTracker(dataStream: any, researchState: ResearchState): ActivityTracker {
    return {
        add: (type: string, status: "pending" | "complete" | "error", message: string) => {
            // Increment completed steps if activity is complete
            if (status === "complete") {
                researchState.completedSteps++;
            }

            // Stream the activity to the client
            dataStream.writeData({
                type: "activity",
                content: {
                    type,
                    status,
                    message
                }
            });
        }
    };
} 
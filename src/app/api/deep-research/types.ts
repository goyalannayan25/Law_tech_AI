export interface ResearchFindings {
    summary: string;
    source: string;
}

export interface SearchResult {
    title: string;
    url: string;
    content: string;
}

export interface Source {
    url: string;
    title: string;
}

export interface Activity {
    type: string;
    status: "pending" | "complete" | "error";
    message: string;
}

export interface ActivityTracker {
    add: (type: string, status: "pending" | "complete" | "error", message: string) => void;
}

export interface ResearchState {
    topic: string;
    completedSteps: number;
    tokenUsed: number;
    findings: ResearchFindings[];
    processedUrl: Set<string>;
    processedQueries: Set<string>;
    clerificationsText: string;
} 
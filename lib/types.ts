export type Audience = "Student" | "Executive" | "Developer (Non-ML)";

export type DecodeSection = "tldr" | "analogy" | "jargon" | "takeaway";

export type ConceptNode = {
    id: string;
    label: string;
};

export type ConceptEdge = {
    id: string;
    source: string;
    target: string;
    label?: string;
};

export type ConceptGraph = {
    nodes: ConceptNode[];
    edges: ConceptEdge[];
};

export type Sections = Record<DecodeSection, string>;

export type Citation = {
    paragraphIndex: number;
};

export type Citations = Partial<Record<DecodeSection, Citation[]>>;

export type Decode = {
    text: string;
    audience: Audience;
    sections: Sections;
    graph: ConceptGraph | null;
    citations?: Citations;
};

export type ShareMeta = {
    id: string;
    url: string;
    deleteToken: string;
};

export type LocalDecode = Decode & {
    id: string;
    createdAt: number;
    title: string;
    share: ShareMeta | null;
};

export type CardState = "empty" | "skeleton" | "streaming" | "complete" | "error";

export type CardStates = Record<DecodeSection, CardState>;

export type ReadShareResult = {
    decode: Decode;
    views: number;
    createdAt: string;
};

export type ShareCreationResult = {
    id: string;
    deleteToken: string;
    url: string;
};

export type RevokeOutcome = "revoked" | "forbidden" | "not-found";

export type SseSectionStart = { section: DecodeSection };

export type SseToken = { section: DecodeSection; text: string };

export type SseSectionComplete = { section: DecodeSection };

export type SseSectionError = { section: DecodeSection; message: string };

export type SseGraphError = { message: string };

export type SseGlobalError = { message: string };
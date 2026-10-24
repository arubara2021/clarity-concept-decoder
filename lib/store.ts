import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import type {
    Audience,
    CardState,
    ConceptGraph,
    DecodeSection,
    Sections,
} from "./types";

const sectionKeys: DecodeSection[] = ["tldr", "analogy", "jargon", "takeaway"];

function emptySections(): Sections {
    return { tldr: "", analogy: "", jargon: "", takeaway: "" };
}

function emptyCardStates(): Record<DecodeSection, CardState> {
    return {
        tldr: "empty",
        analogy: "empty",
        jargon: "empty",
        takeaway: "empty",
    };
}

function hasAnyContent(sections: Sections): boolean {
    return sectionKeys.some((key) => sections[key].length > 0);
}

export type StoreState = {
    text: string;
    audience: Audience;
    results: Sections;
    cardStates: Record<DecodeSection, CardState>;
    sectionErrors: Partial<Record<DecodeSection, string>>;
    graph: ConceptGraph | null;
    graphError: string | null;
    isDecoding: boolean;
    isStale: boolean;
    globalError: string | null;
    currentDecodeId: string | null;
    isShareOpen: boolean;
    isPaletteOpen: boolean;
    isInspectorOpen: boolean;
    selectedInspectorNodeId: string | null;

    setText: (text: string) => void;
    setAudience: (audience: Audience) => void;
    startDecode: () => void;
    appendToken: (section: DecodeSection, text: string) => void;
    appendTokens: (batch: Partial<Record<DecodeSection, string>>) => void;
    completeSection: (section: DecodeSection) => void;
    failSection: (section: DecodeSection, message: string) => void;
    retrySection: (section: DecodeSection) => void;
    setGraph: (graph: ConceptGraph) => void;
    failGraph: (message: string) => void;
    finishDecode: () => void;
    failDecode: (message: string) => void;
    markStale: () => void;
    setCurrentDecodeId: (id: string | null) => void;
    resetResults: () => void;
    loadDecode: (payload: {
        id: string;
        text: string;
        audience: Audience;
        sections: Sections;
        graph: ConceptGraph | null;
    }) => void;
    openShare: () => void;
    closeShare: () => void;
    openPalette: () => void;
    closePalette: () => void;
    openInspector: (nodeId: string) => void;
    closeInspector: () => void;
};

export const useStore = create<StoreState>()(
    subscribeWithSelector((set, get) => ({
        text: "",
        audience: "Student",
        results: emptySections(),
        cardStates: emptyCardStates(),
        sectionErrors: {},
        graph: null,
        graphError: null,
        isDecoding: false,
        isStale: false,
        globalError: null,
        currentDecodeId: null,
        isShareOpen: false,
        isPaletteOpen: false,
        isInspectorOpen: false,
        selectedInspectorNodeId: null,

        setText: (text) => {
            const state = get();
            const hadResults = hasAnyContent(state.results);

            set({
                text,
                isStale: hadResults,
            });
        },

        setAudience: (audience) => {
            set({ audience });
        },

        startDecode: () => {
            set({
                results: emptySections(),
                cardStates: emptyCardStates(),
                sectionErrors: {},
                graph: null,
                graphError: null,
                isDecoding: true,
                isStale: false,
                globalError: null,
                currentDecodeId: null,
            });
        },

        appendToken: (section, text) => {
            if (!text) return;

            get().appendTokens({
                [section]: text,
            } as Partial<Record<DecodeSection, string>>);
        },

        appendTokens: (batch) => {
            const entries = Object.entries(batch) as [
                DecodeSection,
                string | undefined,
            ][];

            if (entries.length === 0) return;

            set((state) => {
                const results = { ...state.results };
                const cardStates = { ...state.cardStates };

                let changed = false;

                for (const [section, token] of entries) {
                    if (!token) continue;

                    results[section] += token;
                    cardStates[section] = "streaming";
                    changed = true;
                }

                if (!changed) return {};

                return {
                    results,
                    cardStates,
                };
            });
        },

        completeSection: (section) => {
            set((state) => {
                const nextErrors = { ...state.sectionErrors };
                delete nextErrors[section];

                return {
                    cardStates: {
                        ...state.cardStates,
                        [section]: "complete",
                    },
                    sectionErrors: nextErrors,
                };
            });
        },

        failSection: (section, message) => {
            set((state) => ({
                cardStates: {
                    ...state.cardStates,
                    [section]: "error",
                },
                sectionErrors: {
                    ...state.sectionErrors,
                    [section]: message,
                },
            }));
        },

        retrySection: (section) => {
            set((state) => {
                const nextErrors = { ...state.sectionErrors };
                delete nextErrors[section];

                return {
                    results: {
                        ...state.results,
                        [section]: "",
                    },
                    cardStates: {
                        ...state.cardStates,
                        [section]: "streaming",
                    },
                    sectionErrors: nextErrors,
                    isDecoding: true,
                    globalError: null,
                };
            });
        },

        setGraph: (graph) => {
            set({ graph, graphError: null });
        },

        failGraph: (message) => {
            set({ graph: null, graphError: message });
        },

        finishDecode: () => {
            set({ isDecoding: false });
        },

        failDecode: (message) => {
            set({
                isDecoding: false,
                globalError: message,
            });
        },

        markStale: () => {
            set({ isStale: true });
        },

        setCurrentDecodeId: (id) => {
            set({ currentDecodeId: id });
        },

        resetResults: () => {
            set({
                results: emptySections(),
                cardStates: emptyCardStates(),
                sectionErrors: {},
                graph: null,
                graphError: null,
                isDecoding: false,
                isStale: false,
                globalError: null,
                currentDecodeId: null,
                isInspectorOpen: false,
                selectedInspectorNodeId: null,
            });
        },

        loadDecode: (payload) => {
            const populated: Record<DecodeSection, CardState> = {
                tldr: "complete",
                analogy: "complete",
                jargon: "complete",
                takeaway: "complete",
            };

            set({
                text: payload.text,
                audience: payload.audience,
                results: payload.sections,
                cardStates: populated,
                sectionErrors: {},
                graph: payload.graph,
                graphError: null,
                isDecoding: false,
                isStale: false,
                globalError: null,
                currentDecodeId: payload.id,
                isInspectorOpen: false,
                selectedInspectorNodeId: null,
            });
        },

        openShare: () => set({ isShareOpen: true }),
        closeShare: () => set({ isShareOpen: false }),
        openPalette: () => set({ isPaletteOpen: true }),
        closePalette: () => set({ isPaletteOpen: false }),
        openInspector: (nodeId) =>
            set({ isInspectorOpen: true, selectedInspectorNodeId: nodeId }),
        closeInspector: () =>
            set({ isInspectorOpen: false, selectedInspectorNodeId: null }),
    }))
);

export function useStoreShallow<T>(selector: (state: StoreState) => T): T {
    return useStore(useShallow(selector));
}

export const selectText = (state: StoreState) => state.text;
export const selectAudience = (state: StoreState) => state.audience;
export const selectIsDecoding = (state: StoreState) => state.isDecoding;
export const selectIsStale = (state: StoreState) => state.isStale;
export const selectGlobalError = (state: StoreState) => state.globalError;
export const selectGraph = (state: StoreState) => state.graph;
export const selectGraphError = (state: StoreState) => state.graphError;
export const selectCurrentDecodeId = (state: StoreState) =>
    state.currentDecodeId;
export const selectIsShareOpen = (state: StoreState) => state.isShareOpen;
export const selectIsPaletteOpen = (state: StoreState) => state.isPaletteOpen;

export const selectSections = (state: StoreState): Sections => state.results;

export const selectCardStates = (
    state: StoreState
): Record<DecodeSection, CardState> => state.cardStates;

export const selectSectionErrors = (
    state: StoreState
): Partial<Record<DecodeSection, string>> => state.sectionErrors;

export const selectHasAnyResult = (state: StoreState): boolean =>
    sectionKeys.some((key) => state.results[key].length > 0);

export const selectCanShare = (state: StoreState): boolean =>
    Boolean(state.currentDecodeId) && selectHasAnyResult(state);

export const selectSectionResult =
    (section: DecodeSection) =>
        (state: StoreState): string =>
            state.results[section];

export const selectSectionState =
    (section: DecodeSection) =>
        (state: StoreState): CardState =>
            state.cardStates[section];

export const selectSectionError =
    (section: DecodeSection) =>
        (state: StoreState): string | undefined =>
            state.sectionErrors[section];
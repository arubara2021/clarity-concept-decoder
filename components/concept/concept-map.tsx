"use client";

import { useEffect, useMemo } from "react";
import {
    Background,
    BackgroundVariant,
    EdgeLabelRenderer,
    Handle,
    MarkerType,
    Position,
    ReactFlow,
    ReactFlowProvider,
    getBezierPath,
    useEdgesState,
    useNodesState,
    useReactFlow,
} from "@xyflow/react";
import type { Edge, Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { motion } from "motion/react";
import dagre from "@dagrejs/dagre";
import { Maximize, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ConceptGraph, ConceptNode } from "@/lib/types";

type ConceptMapProps = {
    graph: ConceptGraph | null;
    onNodeSelect?: (node: ConceptNode | null) => void;
    selectedNodeId?: string | null;
    fill?: boolean;
};

type ConstellationNodeData = {
    label: string;
    index: number;
    selected: boolean;
    dimmed: boolean;
};

type ConstellationEdgeData = {
    label?: string;
    index: number;
    dimmed: boolean;
    active: boolean;
};

type ConstellationNode = Node<ConstellationNodeData, "constellation">;
type ConstellationEdge = Edge<ConstellationEdgeData, "constellation">;

const NODE_WIDTH = 200;
const NODE_HEIGHT = 64;

function layoutGraph(graph: ConceptGraph): {
    nodes: ConstellationNode[];
    edges: ConstellationEdge[];
} {
    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({
        rankdir: "TB",
        nodesep: 64,
        ranksep: 104,
        marginx: 32,
        marginy: 32,
    });

    graph.nodes.forEach((node) => {
        g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
    });

    graph.edges.forEach((edge) => {
        g.setEdge(edge.source, edge.target);
    });

    dagre.layout(g);

    const nodes: ConstellationNode[] = graph.nodes.map((node, index) => {
        const placed = g.node(node.id) ?? {
            x: NODE_WIDTH / 2,
            y: NODE_HEIGHT / 2,
        };

        return {
            id: node.id,
            type: "constellation",
            position: {
                x: placed.x - NODE_WIDTH / 2,
                y: placed.y - NODE_HEIGHT / 2,
            },
            data: {
                label: node.label,
                index,
                selected: false,
                dimmed: false,
            },
            width: NODE_WIDTH,
            height: NODE_HEIGHT,
        };
    });

    const edges: ConstellationEdge[] = graph.edges.map((edge, index) => ({
        id: edge.id,
        type: "constellation",
        source: edge.source,
        target: edge.target,
        data: {
            label: edge.label,
            index,
            dimmed: false,
            active: false,
        },
        markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "var(--text-3)",
            width: 16,
            height: 16,
        },
    }));

    return { nodes, edges };
}

function ConstellationNodeView({ data }: { data: ConstellationNodeData }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                delay: data.index * 0.05,
                type: "spring",
                stiffness: 340,
                damping: 26,
            }}
        >
            <motion.div
                animate={{ scale: data.selected ? 1.05 : 1 }}
                transition={{ type: "spring", stiffness: 460, damping: 30 }}
                className={cn(
                    "group relative flex h-16 w-[200px] cursor-grab items-center gap-3 rounded-2xl border px-4 backdrop-blur-xl transition-[border-color,background-color,box-shadow,opacity] duration-300 active:cursor-grabbing",
                    data.selected
                        ? "border-[var(--border-strong)] bg-[var(--bg-2)] shadow-[var(--shadow-glow)]"
                        : "border-[var(--border)] bg-[var(--glass-bg)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-1)]",
                    data.dimmed && "opacity-30"
                )}
            >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-[var(--border-faint)] bg-[var(--bg-0)] text-[10px] font-semibold tabular-nums text-[var(--text-2)]">
                    {String(data.index + 1).padStart(2, "0")}
                </span>
                <span className="line-clamp-2 text-xs font-semibold leading-4 tracking-[-0.01em] text-[var(--text-0)]">
                    {data.label}
                </span>
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-6 -bottom-px h-px bg-gradient-to-r from-transparent via-[var(--border-strong)] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
                <Handle
                    type="target"
                    position={Position.Top}
                    className="pointer-events-none opacity-0"
                />
                <Handle
                    type="source"
                    position={Position.Bottom}
                    className="pointer-events-none opacity-0"
                />
            </motion.div>
        </motion.div>
    );
}

function ConstellationEdgeView({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    markerEnd,
}: {
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
    sourcePosition: Position;
    targetPosition: Position;
    data?: ConstellationEdgeData;
    markerEnd?: string;
}) {
    const [path, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const label = data?.label;
    const dimmed = data?.dimmed ?? false;
    const active = data?.active ?? false;
    const index = data?.index ?? 0;

    return (
        <>
            <motion.path
                d={path}
                fill="none"
                strokeWidth={1.4}
                stroke="var(--text-3)"
                markerEnd={markerEnd}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                    delay: 0.15 + index * 0.04,
                    duration: 0.8,
                    ease: "easeInOut",
                }}
                className="transition-opacity duration-300"
                style={{ opacity: dimmed ? 0.12 : active ? 0.9 : 0.5 }}
            />

            {active ? (
                <motion.path
                    d={path}
                    fill="none"
                    stroke="var(--text-0)"
                    strokeWidth={1.6}
                    strokeLinecap="round"
                    strokeDasharray="5 7"
                    animate={{ strokeDashoffset: [0, -24] }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
                    style={{ opacity: 0.85 }}
                />
            ) : null}

            {label ? (
                <EdgeLabelRenderer>
                    <motion.div
                        style={{
                            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                        }}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: dimmed ? 0.15 : 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.04, duration: 0.3 }}
                        className="pointer-events-none absolute z-10"
                    >
                        <span
                            className={cn(
                                "rounded-md border px-1.5 py-0.5 text-[10px] font-medium shadow-[var(--shadow-hair)] transition-colors duration-300",
                                active
                                    ? "border-[var(--border-strong)] bg-[var(--bg-2)] text-[var(--text-0)]"
                                    : "border-[var(--border-faint)] bg-[var(--bg-1)] text-[var(--text-2)]"
                            )}
                        >
                            {label}
                        </span>
                    </motion.div>
                </EdgeLabelRenderer>
            ) : null}
        </>
    );
}

function MapControls() {
    const { zoomIn, zoomOut, fitView } = useReactFlow();

    const controls = [
        { label: "Zoom in", icon: Plus, run: () => zoomIn({ duration: 280 }) },
        { label: "Zoom out", icon: Minus, run: () => zoomOut({ duration: 280 }) },
        {
            label: "Fit map",
            icon: Maximize,
            run: () => fitView({ padding: 0.22, duration: 600 }),
        },
    ];

    return (
        <div className="absolute bottom-4 right-4 z-20 flex flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--glass-bg)] shadow-[var(--shadow-card)] backdrop-blur-xl">
            {controls.map((control, index) => {
                const Icon = control.icon;
                return (
                    <button
                        key={control.label}
                        type="button"
                        aria-label={control.label}
                        onClick={control.run}
                        className={cn(
                            "grid h-9 w-9 place-items-center text-[var(--text-1)] transition-colors hover:bg-[var(--bg-2)] hover:text-[var(--text-0)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]",
                            index > 0 && "border-t border-[var(--border-faint)]"
                        )}
                    >
                        <Icon size={14} aria-hidden="true" />
                    </button>
                );
            })}
        </div>
    );
}

const nodeTypes = {
    constellation: ConstellationNodeView,
};

const edgeTypes = {
    constellation: ConstellationEdgeView,
};

function ConceptMapInner({
    graph,
    onNodeSelect,
    selectedNodeId,
    fill = false,
}: ConceptMapProps) {
    const { fitView } = useReactFlow();
    const initial = useMemo(() => (graph ? layoutGraph(graph) : null), [graph]);

    const [nodes, setNodes, onNodesChange] = useNodesState<ConstellationNode>(
        initial?.nodes ?? []
    );
    const [edges, setEdges, onEdgesChange] = useEdgesState<ConstellationEdge>(
        initial?.edges ?? []
    );

    useEffect(() => {
        if (!initial) {
            setNodes([]);
            setEdges([]);
            return;
        }
        setNodes(initial.nodes);
        setEdges(initial.edges);
    }, [initial, setEdges, setNodes]);

    useEffect(() => {
        if (!graph || graph.nodes.length === 0) return;
        const timeout = window.setTimeout(() => {
            void fitView({ padding: 0.22, duration: 800 });
        }, 140);
        return () => window.clearTimeout(timeout);
    }, [fitView, graph]);

    const styledNodes = useMemo(() => {
        return nodes.map((node) => ({
            ...node,
            data: {
                label: node.data.label,
                index: node.data.index,
                selected: selectedNodeId === node.id,
                dimmed: Boolean(selectedNodeId) && selectedNodeId !== node.id,
            },
        }));
    }, [nodes, selectedNodeId]);

    const styledEdges = useMemo(() => {
        return edges.map((edge) => ({
            ...edge,
            data: {
                label: edge.data?.label,
                index: edge.data?.index ?? 0,
                active:
                    Boolean(selectedNodeId) &&
                    (edge.source === selectedNodeId || edge.target === selectedNodeId),
                dimmed:
                    Boolean(selectedNodeId) &&
                    edge.source !== selectedNodeId &&
                    edge.target !== selectedNodeId,
            },
        }));
    }, [edges, selectedNodeId]);

    if (!graph || graph.nodes.length === 0) {
        return (
            <div
                className={cn(
                    "grid place-items-center text-center",
                    fill
                        ? "h-full min-h-[480px]"
                        : "h-[420px] rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--bg-0)]"
                )}
            >
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 360, damping: 30 }}
                    className="flex flex-col items-center"
                >
                    <div className="relative h-16 w-16" aria-hidden="true">
                        <motion.span
                            className="absolute inset-0 rounded-full border border-[var(--border)]"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        >
                            <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--text-1)]" />
                        </motion.span>
                        <motion.span
                            className="absolute inset-3 rounded-full border border-dashed border-[var(--border-faint)]"
                            animate={{ rotate: -360 }}
                            transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
                        />
                    </div>
                    <p className="mt-5 text-sm font-medium text-[var(--text-1)]">
                        No concept relationships found
                    </p>
                    <p className="mt-2 max-w-[36ch] text-xs leading-5 text-[var(--text-2)]">
                        The source did not contain enough connected ideas to build a map.
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "relative overflow-hidden",
                fill
                    ? "h-full min-h-[480px]"
                    : "h-[clamp(440px,56vh,640px)] rounded-2xl border border-[var(--border)] bg-[var(--bg-0)]"
            )}
        >
            <ReactFlow
                nodes={styledNodes}
                edges={styledEdges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={(_, node) => {
                    if (!onNodeSelect || !graph) return;
                    const source = graph.nodes.find(
                        (candidate) => candidate.id === node.id
                    );
                    if (!source) return;
                    onNodeSelect(selectedNodeId === source.id ? null : source);
                }}
                onPaneClick={() => onNodeSelect?.(null)}
                fitView
                fitViewOptions={{ padding: 0.22 }}
                minZoom={0.3}
                maxZoom={2}
                nodesConnectable={false}
                elementsSelectable
                panOnScroll
                proOptions={{ hideAttribution: false }}
                className="bg-transparent"
            >
                <Background
                    variant={BackgroundVariant.Dots}
                    gap={28}
                    size={1}
                    color="var(--border)"
                    bgColor="transparent"
                />
                <MapControls />
            </ReactFlow>
        </div>
    );
}

export function ConceptMap(props: ConceptMapProps) {
    return (
        <ReactFlowProvider>
            <ConceptMapInner {...props} />
        </ReactFlowProvider>
    );
}
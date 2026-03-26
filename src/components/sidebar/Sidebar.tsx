import * as React from "react";
import * as TablerIcons from "@tabler/icons-react";
import { REGISTRY } from "../../data/registry";
import {
  CATEGORY_STYLE,
  type NodeCategory,
  type NodeTemplate,
} from "../../types/diagram";

import { useProjectStore } from "../../store/project.store";
import { useCanvasStore } from "../../store/canvas.store";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate, useLocation } from "@tanstack/react-router";
import ConfirmModal from "../ui/ConfirmModal";
import { setDiagramMode, clearCanvas } from "../../store/canvas.store";
import { useAIKeys } from "../../store/ai.store";
import AIPanel from "../ai/AIPanel";
import AISettings from "../ai/AISettings";

type TablerIcon = React.FC<{
  size?: number;
  stroke?: number;
  color?: string;
  className?: string;
}>;

function getIcon(name: string): TablerIcon {
  const icons = TablerIcons as Record<string, unknown>;
  return (icons[name] as TablerIcon) ?? TablerIcons.IconBox;
}

const CATEGORY_ORDER: NodeCategory[] = [
  "microservice",
  "cloud",
  "database",
  "frontend",
  "networking",
  "security",
  "observability",
  "ai",
  "devops",
  "flow",
  "c4",
];

/**
 * Represents a draggable item in the sidebar representing a system component.
 */
function NodeItem({
  template,
  isCustom = false,
  disabled = false,
}: {
  /** The node template data */
  template: NodeTemplate;
  /** Whether the node is a custom-created one */
  isCustom?: boolean;
  /** Whether dragging is disabled (e.g., if no project is active) */
  disabled?: boolean;
}) {
  const style = CATEGORY_STYLE[template.category];
  const Icon = isCustom ? null : getIcon(template.icon);

  const onDragStart = (e: React.DragEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("application/sysdesign", JSON.stringify(template));
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={cn(
        "flex items-center gap-2.5 px-3 py-2 mx-1.5 rounded-[--radius] cursor-grab select-none transition-colors duration-100 group",
        disabled
          ? "opacity-40 cursor-not-allowed filter grayscale-[0.5]"
          : "hover:bg-muted",
      )}
    >
      <div
        className="w-7 h-7 rounded-[--radius] flex items-center justify-center shrink-0 border border-border"
        style={{
          background: `color-mix(in srgb, ${style.color} 10%, var(--card))`,
        }}
      >
        {Icon && <Icon size={14} stroke={1.5} color={style.color} />}
      </div>
      <div className="min-w-0">
        <div className="text-[12px] font-medium text-foreground leading-tight truncate">
          {template.label}
        </div>
        <div className="text-[10px] text-muted-foreground leading-tight truncate">
          {template.description}
        </div>
      </div>
    </div>
  );
}

/**
 * Compact version of NodeItem for the shapes grid.
 */

type TabId =
  | "components"
  | "c4"
  | "templates"
  | "integrations"
  | "flows"
  | "shapes"
  | "settings";

/**
 * Left sidebar containing the searchable registry of diagram components.
 * Organized by category with support for custom node creation.
 */
export default function Sidebar() {
  const navigate = useNavigate();
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const projects = useProjectStore((s) => s.projects);
  const activeProject = projects.find((p) => p.id === activeProjectId);

  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const diagramMode = useCanvasStore((s) => s.diagramMode);

  const location = useLocation();
  const currentPath = location.pathname;

  const [activeTab, setActiveTab] = React.useState<TabId>(
    currentPath.endsWith("/c4") ? "c4" : "components",
  );

  React.useEffect(() => {
    if (currentPath === "/integrations") setActiveTab("integrations");
    else if (currentPath === "/flows") setActiveTab("flows");
    else if (currentPath === "/shapes") setActiveTab("shapes");
    else if (currentPath.endsWith("/c4")) setActiveTab("c4");
    else if (currentPath === "/templates") setActiveTab("templates");
    else if (currentPath.match(/^\/[^/]+$/)) setActiveTab("components");
  }, [currentPath]);

  const { hasAny: hasAIKey } = useAIKeys();
  const [showAIPanel, setShowAIPanel] = React.useState(false);
  const aiPanelRef = React.useRef<HTMLDivElement>(null);
  const aiButtonRef = React.useRef<HTMLButtonElement>(null);

  // Close panel when the active project changes
  React.useEffect(() => {
    setShowAIPanel(false);
  }, [activeProjectId]);

  // Close panel on outside click
  React.useEffect(() => {
    if (!showAIPanel) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        aiPanelRef.current &&
        !aiPanelRef.current.contains(target) &&
        aiButtonRef.current &&
        !aiButtonRef.current.contains(target)
      ) {
        setShowAIPanel(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showAIPanel]);

  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState<TabId | null>(null);

  const [expanded, setExpanded] = React.useState<Record<NodeCategory, boolean>>(
    {
      microservice: true,
      cloud: false,
      database: false,
      frontend: false,
      networking: false,
      security: false,
      observability: false,
      ai: false,
      devops: false,
      flow: false,
      shape: false,
      c4: false,
    },
  );

  const toggleCategory = (cat: NodeCategory) => {
    setExpanded((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const grouped = React.useMemo(() => {
    const items: Record<NodeCategory, NodeTemplate[]> = {
      microservice: [],
      cloud: [],
      database: [],
      frontend: [],
      networking: [],
      security: [],
      observability: [],
      ai: [],
      devops: [],
      flow: [],
      shape: [],
      c4: [],
    };

    REGISTRY.forEach((t) => items[t.category].push(t));
    Object.keys(items).forEach((cat) => {
      items[cat as NodeCategory].sort((a, b) => a.label.localeCompare(b.label));
    });
    return items;
  }, []);

  const RailIcon = ({
    id,
    icon: Icon,
    label,
  }: {
    id: TabId;
    icon: any;
    label: string;
  }) => (
    <Tooltip>
      <TooltipTrigger>
        <button
          onClick={() => {
            if (
              id === "integrations" ||
              id === "flows" ||
              id === "shapes"
            ) {
              navigate({ to: `/${id}` });
              setActiveTab(id);
              return;
            }

            // AI panel — toggle floating panel instead of changing sidebar tab
            if (id === "templates") {
              if (!hasAIKey) {
                // No key yet — open settings to add one
                setActiveTab("settings");
                if (isCollapsed) setIsCollapsed(false);
                return;
              }
              setShowAIPanel((prev) => !prev);
              return;
            }
            // Check if we're switching between diagram modes
            const isSwitchingToC4 = id === "c4" && diagramMode !== "c4";
            const isSwitchingToArch =
              id === "components" && diagramMode !== "architecture";

            if (
              (isSwitchingToC4 || isSwitchingToArch) &&
              (nodes.length > 0 || edges.length > 0)
            ) {
              setShowConfirm(id);
              return;
            }

            setActiveTab(id);
            if (id === "c4") {
              setDiagramMode("c4");
              if (activeProject)
                navigate({
                  to: "/$slug/c4",
                  params: { slug: activeProject.slug } as any,
                });
            } else if (id === "components") {
              setDiagramMode("architecture");
              if (activeProject)
                navigate({
                  to: "/$slug",
                  params: { slug: activeProject.slug } as any,
                });
            }
            if (isCollapsed) setIsCollapsed(false);
          }}
          className={cn(
            "group relative flex h-10 w-10 items-center justify-center rounded-[--radius] transition-all duration-200",
            activeTab === id && !isCollapsed
              ? "bg-primary/10 text-primary shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]"
              : id === "templates" && showAIPanel
                ? "bg-primary/10 text-primary shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
          ref={id === "templates" ? aiButtonRef : undefined}
        >
          <Icon size={20} stroke={1.5} />
          {activeTab === id && !isCollapsed && (
            <div className="absolute left-0 h-5 w-0.5 rounded-none bg-primary" />
          )}
          {/* Key indicator dot on AI icon */}
          {id === "templates" && hasAIKey && (
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-green-500" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="right"
        className="font-medium text-[11px] py-1 shadow-2xl"
      >
        {label}
      </TooltipContent>
    </Tooltip>
  );

  return (
    <div className="relative flex h-full border-r border-border bg-background select-none transition-all duration-300">
      {/* Left Rail */}
      <div className="flex flex-col items-center py-4 w-[52px] border-r border-border/50 bg-muted/30 gap-2 shrink-0">
        <RailIcon
          id="components"
          icon={TablerIcons.IconVectorBezier2}
          label="Architecture"
        />
        <RailIcon id="c4" icon={TablerIcons.IconSitemap} label="C4 Model" />
        <RailIcon id="templates" icon={TablerIcons.IconSparkles} label="AI" />
        <RailIcon
          id="integrations"
          icon={TablerIcons.IconPuzzle}
          label="Integrations"
        />
        <RailIcon id="flows" icon={TablerIcons.IconHierarchy} label="Flows" />
        <RailIcon id="shapes" icon={TablerIcons.IconShape} label="Shapes" />

        <div className="mt-auto flex flex-col gap-2">
          <RailIcon
            id="settings"
            icon={TablerIcons.IconSettings}
            label="Settings"
          />

          <Tooltip>
            <TooltipTrigger>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="group flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200"
              >
                <TablerIcons.IconChevronLeft
                  size={20}
                  stroke={1.5}
                  className={cn(
                    "transition-transform duration-300",
                    isCollapsed && "rotate-180",
                  )}
                />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="font-medium text-[11px] py-1 shadow-2xl"
            >
              {isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Content Panel */}
      <aside
        className={cn(
          "flex flex-col overflow-hidden bg-card transition-all duration-300 ease-in-out",
          isCollapsed
            ? "w-0 opacity-0 pointer-events-none"
            : "w-[260px] opacity-100",
        )}
      >
        {/* Header */}
        <div className="shrink-0 px-4 py-3 border-b border-border/50">
          <div className="flex items-center justify-between mb-3 whitespace-nowrap">
            <h2 className="text-[13px] font-bold text-foreground tracking-tight">
              {activeTab === "components"
                ? "Architecture"
                : activeTab === "c4"
                  ? "C4 Model"
                  : activeTab === "templates"
                    ? "AI"
                    : activeTab === "integrations"
                      ? "Integrations"
                      : activeTab === "flows"
                        ? "Flows"
                        : activeTab === "shapes"
                          ? "Shapes"
                          : "Settings"}
            </h2>
            <div className="flex gap-1">
              <button className="p-1 rounded-md hover:bg-muted text-muted-foreground">
                <TablerIcons.IconFilter size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-2 px-1 custom-scrollbar">
          {activeTab === "c4" &&
            (() => {
              const C4_ABSTRACTIONS = [
                {
                  subtype: "c4-person",
                  label: "Person",
                  icon: "IconUser",
                  color: "#3B82F6",
                  pill: "#DBEAFE",
                  textColor: "#1E40AF",
                  description: "An end user, customer or actor",
                },
                {
                  subtype: "c4-system",
                  label: "System",
                  icon: "IconBox",
                  color: "#1168BD",
                  pill: "#BBDEFB",
                  textColor: "#0B4D8C",
                  description: "A software system (internal or external)",
                },
                {
                  subtype: "c4-container",
                  label: "Container",
                  icon: "IconStack2",
                  color: "#16A34A",
                  pill: "#DCFCE7",
                  textColor: "#14532D",
                  description: "An app, service, DB or deployable unit",
                },
                {
                  subtype: "c4-component",
                  label: "Component",
                  icon: "IconPuzzle",
                  color: "#EA580C",
                  pill: "#FFEDD5",
                  textColor: "#7C2D12",
                  description: "A building block inside a container",
                },
              ];

              return (
                <div className="flex flex-col py-2">
                  {/* Tip */}
                  <div className="px-3 pb-3">
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      Drag any abstraction onto the canvas, then double-click to
                      name it. Group items together to create system or
                      container boundaries.
                    </p>
                  </div>

                  {/* 4 core abstractions */}
                  <div className="space-y-0.5 px-1">
                    {C4_ABSTRACTIONS.map((a) => {
                      const Icon = getIcon(a.icon) as any;
                      const template = {
                        subtype: a.subtype,
                        label: a.label,
                        category: "c4" as const,
                        icon: a.icon,
                        description: a.description,
                      };
                      return (
                        <div
                          key={a.subtype}
                          draggable
                          onDragStart={(e) => {
                            if (!activeProjectId) {
                              e.preventDefault();
                              return;
                            }
                            e.dataTransfer.setData(
                              "application/sysdesign",
                              JSON.stringify(template),
                            );
                            e.dataTransfer.effectAllowed = "move";
                          }}
                          className={cn(
                            "flex items-center gap-2.5 px-3 py-2 mx-0.5 rounded-lg cursor-grab select-none transition-colors duration-100",
                            !activeProjectId
                              ? "opacity-40 cursor-not-allowed grayscale-[0.5]"
                              : "hover:bg-muted",
                          )}
                        >
                          <div
                            className={cn(
                              "w-7 h-7 rounded-md flex items-center justify-center shrink-0 shadow-xs",
                              a.subtype === "c4-person" && "rounded-full",
                            )}
                            style={{ background: a.pill, color: a.color }}
                          >
                            <Icon size={14} stroke={1.8} color={a.color} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[12px] font-medium text-foreground leading-tight truncate">
                              {a.label}
                            </div>
                            <div className="text-[10px] text-muted-foreground leading-tight truncate">
                              {a.description}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Grouping hint */}
                  <div className="mx-3 mt-4 py-2.5 px-3 bg-muted/40 rounded-lg border border-border/30">
                    <div className="flex items-center gap-1.5 mb-1">
                      <TablerIcons.IconSelect
                        size={12}
                        className="text-muted-foreground shrink-0"
                      />
                      <span className="text-[10px] font-semibold text-foreground/80">
                        Boundaries
                      </span>
                    </div>
                    <p className="text-[9px] text-muted-foreground leading-relaxed">
                      Drag-select multiple nodes on the canvas to auto-group
                      them into a boundary box. Double-click the group label to
                      rename it (e.g. "Internet Banking System").
                    </p>
                  </div>
                </div>
              );
            })()}

          {activeTab === "components" &&
            CATEGORY_ORDER.map((cat) => {
              if (cat === "c4") return null;
              const style = CATEGORY_STYLE[cat];
              const items = grouped[cat];
              const isExpanded = expanded[cat];
              if (items.length === 0) return null;

              return (
                <div key={cat} className="mb-0.5">
                  <button
                    onClick={() => toggleCategory(cat)}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-muted/50 transition-colors group/row"
                  >
                    <div className="flex items-center gap-2">
                      <TablerIcons.IconChevronRight
                        size={12}
                        className={cn(
                          "text-muted-foreground/50 transition-transform duration-200",
                          isExpanded && "rotate-90 text-foreground",
                        )}
                      />
                      <h6 className="text-sm font-semibold text-foreground/85 group-hover/row:text-foreground">
                        {style.label}
                      </h6>
                    </div>
                    <span className="text-[9px] font-medium text-muted-foreground/60 bg-muted/80 px-1.5 py-0.5 rounded-sm">
                      {items.length}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="px-3 py-1 flex flex-wrap gap-2">
                      {items.map((t) => (
                        <NodeItem
                          key={t.subtype}
                          template={t}
                          disabled={!activeProjectId}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

          {activeTab === "templates" && (
            <div className="px-4 py-8 text-center flex flex-col items-center text-muted-foreground">
              <TablerIcons.IconSparkles
                size={24}
                stroke={1}
                className="mb-2 opacity-20"
              />
              <p className="text-[11px] font-medium mb-1">
                No AI key configured
              </p>
              <p className="text-[10px] text-muted-foreground/70">
                Go to Settings to add your API key.
              </p>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="px-3 py-3">
              <div className="mb-4">
                <h3 className="text-[12px] font-bold tracking-tight mb-0.5">
                  AI API Keys
                </h3>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Bring your own key from OpenAI, Claude, or Gemini to unlock
                  the AI assistant.
                </p>
              </div>
              <AISettings />
            </div>
          )}

          {activeTab === "integrations" && (
            <div className="flex flex-col py-2 px-1 gap-1">
              <div className="px-3 pb-2">
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Planned connectors to tools your team already uses daily.
                </p>
              </div>
              {[
                { icon: TablerIcons.IconBrandGithub, name: "GitHub", desc: "Import docker-compose.yml or Terraform → diagram", tag: "Import", color: "#24292e", hot: true },
                { icon: TablerIcons.IconBrandSupabase, name: "Supabase", desc: "Auto-generate ER diagram from your schema", tag: "Schema", color: "#3ECF8E", hot: true },
                { icon: TablerIcons.IconCloud, name: "AWS / GCP / Azure", desc: "Visualize your live infrastructure via API key", tag: "Live infra", color: "#FF9900" },
                { icon: TablerIcons.IconApi, name: "Postman / OpenAPI", desc: "Import a Swagger spec → API flow diagram", tag: "Import", color: "#FF6C37", hot: true },
                { icon: TablerIcons.IconContainer, name: "Kubernetes", desc: "Visualize running services, deployments, ingress", tag: "Live infra", color: "#326CE5" },
                { icon: TablerIcons.IconBook, name: "Confluence / Notion", desc: "Embed read-only diagram in your docs", tag: "Embed", color: "#0052CC" },
                { icon: TablerIcons.IconBrandSlack, name: "Slack", desc: "Share a diagram snapshot to any channel", tag: "Share", color: "#4A154B" },
                { icon: TablerIcons.IconBrandTrello, name: "Jira", desc: "Attach a diagram to a ticket or epic", tag: "Attach", color: "#0052CC" },
              ].map((item) => (
                <div key={item.name} className="flex items-start gap-2.5 px-3 py-2.5 mx-0.5 rounded-lg hover:bg-muted/60 transition-colors cursor-default group">
                  <div className="size-7 rounded-md flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${item.color}18` }}>
                    <item.icon size={14} stroke={1.5} style={{ color: item.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11.5px] font-semibold text-foreground leading-tight">{item.name}</span>
                      {item.hot && <span className="text-[8px] font-bold text-primary">●</span>}
                    </div>
                    <div className="text-[10px] text-muted-foreground leading-snug mt-0.5">{item.desc}</div>
                  </div>
                  <span className="text-[8px] font-medium text-muted-foreground/60 bg-muted/80 px-1 py-0.5 rounded shrink-0 mt-0.5">{item.tag}</span>
                </div>
              ))}
              <div className="mx-3 mt-3 py-2 px-3 bg-muted/40 rounded-lg border border-border/30 flex items-center gap-2">
                <TablerIcons.IconRocket size={11} className="text-muted-foreground/50 shrink-0 animate-pulse" />
                <p className="text-[9px] text-muted-foreground/60 font-medium tracking-wider uppercase">Coming Soon</p>
              </div>
            </div>
          )}

          {activeTab === "flows" && (
            <div className="flex flex-col py-2 px-1 gap-1">
              <div className="px-3 pb-2">
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Diagram types that technical teams draw constantly — built for engineers.
                </p>
              </div>
              {[
                { icon: TablerIcons.IconArrowsLeftRight, name: "Sequence Diagrams", desc: "Request/response chains, async events across services", tag: "API", color: "#6366f1", hot: true },
                { icon: TablerIcons.IconArrowsSplit2, name: "Data Flow Diagrams", desc: "How data moves, transforms, and is stored", tag: "Data", color: "#0ea5e9", hot: true },
                { icon: TablerIcons.IconTimeline, name: "Event Storming", desc: "Domain events, commands, bounded contexts (DDD)", tag: "DDD", color: "#f59e0b" },
                { icon: TablerIcons.IconUser, name: "User Journey", desc: "Steps, decision points, and error states in a product", tag: "UX", color: "#10b981" },
                { icon: TablerIcons.IconGitBranch, name: "CI/CD Pipeline", desc: "Source → build → test → deploy → monitor", tag: "DevOps", color: "#8b5cf6" },
                { icon: TablerIcons.IconAlertTriangle, name: "Incident Response", desc: "Alert triggers, escalation paths, resolution steps", tag: "SRE", color: "#ef4444" },
                { icon: TablerIcons.IconShieldLock, name: "Auth Flow", desc: "OAuth, OIDC, JWT — client to auth server flows", tag: "Security", color: "#ec4899", hot: true },
                { icon: TablerIcons.IconDatabase, name: "DB Migration Flow", desc: "Schema changes, rollbacks, dependency ordering", tag: "Infra", color: "#14b8a6" },
                { icon: TablerIcons.IconServer, name: "Deployment Topology", desc: "Blue/green, canary, rolling deployments visualized", tag: "Deploy", color: "#f97316" },
              ].map((item) => (
                <div key={item.name} className="flex items-start gap-2.5 px-3 py-2.5 mx-0.5 rounded-lg hover:bg-muted/60 transition-colors cursor-default">
                  <div className="size-7 rounded-md flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${item.color}18` }}>
                    <item.icon size={14} stroke={1.5} style={{ color: item.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11.5px] font-semibold text-foreground leading-tight">{item.name}</span>
                      {item.hot && <span className="text-[8px] font-bold text-primary">●</span>}
                    </div>
                    <div className="text-[10px] text-muted-foreground leading-snug mt-0.5">{item.desc}</div>
                  </div>
                  <span className="text-[8px] font-medium text-muted-foreground/60 bg-muted/80 px-1 py-0.5 rounded shrink-0 mt-0.5">{item.tag}</span>
                </div>
              ))}
              <div className="mx-3 mt-3 py-2 px-3 bg-muted/40 rounded-lg border border-border/30 flex items-center gap-2">
                <TablerIcons.IconRocket size={11} className="text-muted-foreground/50 shrink-0 animate-pulse" />
                <p className="text-[9px] text-muted-foreground/60 font-medium tracking-wider uppercase">Coming Soon</p>
              </div>
            </div>
          )}

          {activeTab === "shapes" && (
            <div className="flex flex-col py-2 px-1 gap-1">
              <div className="px-3 pb-2">
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Standard technical shapes — the building blocks for flows and diagrams.
                </p>
              </div>
              {[
                { icon: TablerIcons.IconSquareRounded, name: "Process", desc: "Rounded rectangle — the workhorse of flowcharts", tag: "Core", color: "#6366f1", hot: true },
                { icon: TablerIcons.IconDiamond, name: "Decision", desc: "Diamond for yes/no branching logic", tag: "Core", color: "#f59e0b", hot: true },
                { icon: TablerIcons.IconPill, name: "Terminator", desc: "Pill shape for start and end points", tag: "Core", color: "#10b981" },
                { icon: TablerIcons.IconFileDescription, name: "Document", desc: "Rectangle with wavy bottom for reports/outputs", tag: "Output", color: "#0ea5e9" },
                { icon: TablerIcons.IconLayoutRows, name: "Swimlane", desc: "Lanes showing which actor owns each step", tag: "Layout", color: "#6366f1", hot: true },
                { icon: TablerIcons.IconCircleArrowRight, name: "Queue", desc: "Rectangle with curved ends for async buffers", tag: "Async", color: "#f97316", hot: true },
                { icon: TablerIcons.IconCloud, name: "Cloud", desc: "Cloud outline for internet/external network", tag: "Network", color: "#0ea5e9" },
                { icon: TablerIcons.IconSquare, name: "External Entity", desc: "Double-border rectangle for out-of-scope systems", tag: "External", color: "#8b5cf6" },
                { icon: TablerIcons.IconLayoutColumns, name: "Data Store", desc: "Open-ended rectangle for DFD storage", tag: "Storage", color: "#ec4899" },
                { icon: TablerIcons.IconNote, name: "Note / Annotation", desc: "Folded-corner rectangle for comments", tag: "Annotation", color: "#84cc16" },
                { icon: TablerIcons.IconBuildingBroadcastTower, name: "Firewall", desc: "Brick wall shape for network security boundary", tag: "Security", color: "#ef4444" },
                { icon: TablerIcons.IconMail, name: "Message", desc: "Envelope shape for async events and webhooks", tag: "Async", color: "#8b5cf6" },
                { icon: TablerIcons.IconRepeat, name: "Loop", desc: "Represents iteration and retry patterns", tag: "Control", color: "#ef4444" },
              ].map((item) => (
                <div key={item.name} className="flex items-start gap-2.5 px-3 py-2.5 mx-0.5 rounded-lg hover:bg-muted/60 transition-colors cursor-default">
                  <div className="size-7 rounded-md flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${item.color}18` }}>
                    <item.icon size={14} stroke={1.5} style={{ color: item.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11.5px] font-semibold text-foreground leading-tight">{item.name}</span>
                      {item.hot && <span className="text-[8px] font-bold text-primary">●</span>}
                    </div>
                    <div className="text-[10px] text-muted-foreground leading-snug mt-0.5">{item.desc}</div>
                  </div>
                  <span className="text-[8px] font-medium text-muted-foreground/60 bg-muted/80 px-1 py-0.5 rounded shrink-0 mt-0.5">{item.tag}</span>
                </div>
              ))}
              <div className="mx-3 mt-3 py-2 px-3 bg-muted/40 rounded-lg border border-border/30 flex items-center gap-2">
                <TablerIcons.IconRocket size={11} className="text-muted-foreground/50 shrink-0 animate-pulse" />
                <p className="text-[9px] text-muted-foreground/60 font-medium tracking-wider uppercase">Coming Soon</p>
              </div>
            </div>
          )}
        </div>

        {/* Custom Node Section - Always at bottom for Components tab */}
        {activeTab === "components" && (
          <div className="shrink-0 px-1 py-1 border-t border-border/30 pt-4 bg-muted/5 min-h-[140px]">
            <NodeItem
              isCustom
              disabled={!activeProjectId}
              template={{
                subtype: `custom-node-${Date.now()}`,
                label: "Custom Node",
                category: "cloud",
                icon: "IconBox",
                description: "Double-click to name",
              }}
            />
            <div className="my-2 px-3 py-2 bg-primary/5 rounded-lg border border-primary/10 mx-2">
              {/* <h2 className="text-sm font-bold">Delete items?</h2> */}
              <p className="text-[10px] text-primary-700 dark:text-primary-300">
                {" "}
                Tip: Drag this generic block onto the canvas to add custom
                logic.
              </p>
            </div>
          </div>
        )}

        {/* Footer info */}
        {!activeProjectId ? (
          <div className="shrink-0 mt-auto border-t border-border/50 bg-black/5 p-3 min-h-[60px]">
            <div className="flex flex-col gap-1 text-amber-500 animate-in fade-in slide-in-from-bottom-2">
              <span className="font-bold flex items-center gap-1 uppercase tracking-wider text-[9px]">
                <TablerIcons.IconLock size={10} />
                Editor Locked
              </span>
              <p className="text-[11px] leading-tight opacity-90 whitespace-nowrap">
                Select or create a project to start.
              </p>
            </div>
          </div>
        ) : null}
      </aside>

      {/* AI Panel — floating overlay next to sidebar */}
      {showAIPanel && hasAIKey && (
        <div
          ref={aiPanelRef}
          className="fixed z-50"
          style={{
            left: isCollapsed ? 52 + 8 : 52 + 260 + 8,
            top: '50%',
            transform: 'translateY(-50%)',
            maxHeight: 'calc(100vh - 48px)',
          }}
        >
          <AIPanel onClose={() => setShowAIPanel(false)} />
        </div>
      )}

      {/* Confirmation Modal for Clearing Canvas */}
      <ConfirmModal
        open={!!showConfirm}
        isDestructive
        title="Clear Canvas?"
        description={`Switching to ${showConfirm === "c4" ? "C4 Model" : "Architecture"} mode will clear your current canvas. You cannot mix these two types of diagrams.`}
        confirmText="Clear & Switch"
        onClose={() => setShowConfirm(null)}
        onConfirm={() => {
          if (showConfirm) {
            clearCanvas();
            setDiagramMode(showConfirm === "c4" ? "c4" : "architecture");
            setActiveTab(showConfirm);
            if (showConfirm === "c4") {
              if (activeProject)
                navigate({
                  to: "/$slug/c4",
                  params: { slug: activeProject.slug } as any,
                });
            } else {
              if (activeProject)
                navigate({
                  to: "/$slug",
                  params: { slug: activeProject.slug } as any,
                });
            }
            setShowConfirm(null);
          }
        }}
      />
    </div>
  );
}

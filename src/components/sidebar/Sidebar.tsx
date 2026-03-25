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
import { useNavigate } from "@tanstack/react-router";
import ConfirmModal from "../ui/ConfirmModal";
import { setDiagramMode, clearCanvas } from "../../store/canvas.store";

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
  "shape",
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
  
  const diagramMode = useCanvasStore((s) => s.diagramMode);
  
  const [activeTab, setActiveTab] = React.useState<TabId>(
    activeProject?.type === "c4" ? "c4" : "components"
  );
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
            if (id === 'integrations') {
              navigate({ to: '/integrations' });
              return;
            }
            if (id === 'flows') {
              navigate({ to: '/flows' });
              return;
            }
            if (id === 'shapes') {
              navigate({ to: '/shapes' });
              return;
            }

            setActiveTab(id);
            if (id === 'c4') {
              setDiagramMode('c4');
              if (activeProject) navigate({ to: '/$slug/c4', params: { slug: activeProject.slug } as any });
            } else if (id === 'components') {
              setDiagramMode('architecture');
              if (activeProject) navigate({ to: '/$slug', params: { slug: activeProject.slug } as any });
            }
            if (isCollapsed) setIsCollapsed(false);
          }}
          className={cn(
            "group relative flex h-10 w-10 items-center justify-center rounded-[--radius] transition-all duration-200",
            (activeTab === id || (id === 'c4' && diagramMode === 'c4' && activeTab === 'c4') || (id === 'components' && diagramMode === 'architecture' && activeTab === 'components')) && !isCollapsed
              ? "bg-primary/10 text-primary shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <Icon size={20} stroke={1.5} />
          {activeTab === id && !isCollapsed && (
            <div className="absolute left-0 h-5 w-0.5 rounded-none bg-primary" />
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
    <div className="flex h-full border-r border-border bg-background select-none transition-all duration-300">
      {/* Left Rail */}
      <div className="flex flex-col items-center py-4 w-[52px] border-r border-border/50 bg-muted/30 gap-2 shrink-0">
        <RailIcon
          id="components"
          icon={TablerIcons.IconVectorBezier2}
          label="Architecture"
        />
        <RailIcon
          id="c4"
          icon={TablerIcons.IconSitemap}
          label="C4 Model"
        />
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
          {activeTab === "c4" && (() => {
            const C4_ABSTRACTIONS = [
              { subtype: "c4-person",    label: "Person",    icon: "IconUser",   color: "#3B82F6", pill: "#DBEAFE", textColor: "#1E40AF", description: "An end user, customer or actor" },
              { subtype: "c4-system",    label: "System",    icon: "IconBox",    color: "#1168BD", pill: "#BBDEFB", textColor: "#0B4D8C", description: "A software system (internal or external)" },
              { subtype: "c4-container", label: "Container", icon: "IconStack2", color: "#16A34A", pill: "#DCFCE7", textColor: "#14532D", description: "An app, service, DB or deployable unit" },
              { subtype: "c4-component", label: "Component", icon: "IconPuzzle", color: "#EA580C", pill: "#FFEDD5", textColor: "#7C2D12", description: "A building block inside a container" },
            ];

            return (
              <div className="flex flex-col py-2">
                {/* Tip */}
                <div className="px-3 pb-3">
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Drag any abstraction onto the canvas, then double-click to name it.
                    Group items together to create system or container boundaries.
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
                          if (!activeProjectId) { e.preventDefault(); return; }
                          e.dataTransfer.setData("application/sysdesign", JSON.stringify(template));
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        className={cn(
                          "flex items-center gap-2.5 px-3 py-2 mx-0.5 rounded-lg cursor-grab select-none transition-colors duration-100",
                          !activeProjectId ? "opacity-40 cursor-not-allowed grayscale-[0.5]" : "hover:bg-muted",
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
                    <TablerIcons.IconSelect size={12} className="text-muted-foreground shrink-0" />
                    <span className="text-[10px] font-semibold text-foreground/80">Boundaries</span>
                  </div>
                  <p className="text-[9px] text-muted-foreground leading-relaxed">
                    Drag-select multiple nodes on the canvas to auto-group them into a boundary box.
                    Double-click the group label to rename it (e.g. "Internet Banking System").
                  </p>
                </div>
              </div>
            );
          })()}


          {activeTab === "components" && (
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
            })
          )}

          {activeTab === "templates" && (
            <div className="px-4 py-8 text-center flex flex-col items-center text-muted-foreground">
              <TablerIcons.IconSparkles
                size={24}
                stroke={1}
                className="mb-2 opacity-20"
              />
              <p className="text-[11px]">No templates found</p>
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
              if (activeProject) navigate({ to: '/$slug/c4', params: { slug: activeProject.slug } as any });
            } else {
              if (activeProject) navigate({ to: '/$slug', params: { slug: activeProject.slug } as any });
            }
            setShowConfirm(null);
          }
        }}
      />
    </div>
  );
}

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
import { Input } from "../ui/input";

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
        "flex items-center gap-2.5 px-3 py-2 mx-1.5 rounded-lg cursor-grab select-none transition-colors duration-100 group",
        disabled
          ? "opacity-40 cursor-not-allowed filter grayscale-[0.5]"
          : "hover:bg-muted",
      )}
    >
      <div
        className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 shadow-xs"
        style={{
          background: `color-mix(in srgb, ${style.color} 15%, var(--card))`,
          border: `1px solid color-mix(in srgb, ${style.color} 20%, transparent)`,
        }}
      >
        {Icon && <Icon size={14} stroke={1.8} color={style.color} />}
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
function ShapeItem({
  template,
  disabled = false,
}: {
  template: NodeTemplate;
  disabled?: boolean;
}) {
  const Icon = getIcon(template.icon);

  const onDragStart = (e: React.DragEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("application/sysdesign", JSON.stringify(template));
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <Tooltip>
      <TooltipTrigger>
        <div
          draggable
          onDragStart={onDragStart}
          className={cn(
            "w-[42px] h-[40px] rounded-md flex items-center justify-center border border-border/40 hover:bg-muted hover:border-primary/40 transition-all cursor-grab active:cursor-grabbing group",
            disabled && "opacity-30 cursor-not-allowed",
          )}
        >
          <Icon
            size={20}
            stroke={1.2}
            className="text-foreground/70 group-hover:text-primary transition-colors"
          />
        </div>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        className="text-[10px] py-1 px-2 font-medium bg-popover/90 backdrop-blur-sm"
      >
        {template.label}
      </TooltipContent>
    </Tooltip>
  );
}

type TabId =
  | "components"
  | "search"
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
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const diagramMode = useCanvasStore((s) => s.diagramMode);
  const [query, setQuery] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<TabId>("components");
  const [isCollapsed, setIsCollapsed] = React.useState(false);

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

  const filtered = React.useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return [];
    return REGISTRY.filter(
      (t) =>
        t.label.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.subtype.toLowerCase().includes(q),
    ).sort((a, b) => a.label.localeCompare(b.label));
  }, [query]);

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
            setActiveTab(id);
            if (isCollapsed) setIsCollapsed(false);
          }}
          className={cn(
            "group relative flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200",
            activeTab === id && !isCollapsed
              ? "bg-primary/10 text-primary shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <Icon size={20} stroke={1.5} />
          {activeTab === id && !isCollapsed && (
            <div className="absolute left-0 h-5 w-0.5 rounded-full bg-primary" />
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
          icon={TablerIcons.IconGrid4x4}
          label="Components"
        />
        <RailIcon id="search" icon={TablerIcons.IconSearch} label="Search" />
        <RailIcon
          id="templates"
          icon={TablerIcons.IconSparkles}
          label="AI Templates"
        />
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
                  className={cn("transition-transform duration-300", isCollapsed && "rotate-180")} 
                />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium text-[11px] py-1 shadow-2xl">
              {isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Content Panel */}
      <aside 
        className={cn(
          "flex flex-col overflow-hidden bg-card transition-all duration-300 ease-in-out",
          isCollapsed ? "w-0 opacity-0 pointer-events-none" : "w-[260px] opacity-100"
        )}
      >
        {/* Header */}
        <div className="shrink-0 px-4 py-3 border-b border-border/50">
          <div className="flex items-center justify-between mb-3 whitespace-nowrap">
            <h2 className="text-[13px] font-bold text-foreground tracking-tight">
              {activeTab === "components"
                ? "Components"
                : activeTab === "search"
                  ? "Search Registry"
                  : activeTab === "templates"
                    ? "AI Templates"
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

          {(activeTab === "components" || activeTab === "search") && (
            <div className="relative">
              <Input
                size="sm"
                placeholder="Find services..."
                value={query}
                startIcon={<TablerIcons.IconSearch size={14} />}
                endIcon={
                  query ? (
                    <button
                      onClick={() => setQuery("")}
                      className="pointer-events-auto hover:text-foreground"
                    >
                      <TablerIcons.IconX size={12} />
                    </button>
                  ) : undefined
                }
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (e.target.value && activeTab !== "search")
                    setActiveTab("search");
                }}
              />
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-2 px-1 custom-scrollbar">
          {activeTab === "components" && !query && (
            <>
              {diagramMode === "c4" ? (
                /* C4 Mode Palette */
                <div className="flex flex-col gap-2 py-2">
                  {[
                    { label: "Level 1: System Context", filter: (n: any) => n.subtype.startsWith('c4-person') || n.subtype === 'c4-system' || n.subtype === 'c4-external-system' },
                    { label: "Level 2: Containers", filter: (n: any) => ['c4-web-app', 'c4-mobile-app', 'c4-api', 'c4-database', 'c4-message-bus', 'c4-microservice', 'c4-serverless'].includes(n.subtype) },
                    { label: "Level 3: Components", filter: (n: any) => ['c4-component', 'c4-controller', 'c4-service', 'c4-repository', 'c4-gateway'].includes(n.subtype) }
                  ].map((section) => (
                    <div key={section.label} className="px-3 pb-3 border-b border-border/40 last:border-0">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-3 block">
                        {section.label}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {grouped.c4.filter(section.filter).map((t) => (
                          <NodeItem key={t.subtype} template={t} disabled={!activeProjectId} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Standard Mode Palette */
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
            </>
          )}

          {(activeTab === "search" || query) &&
            (filtered.length > 0 ? (
              <div className="py-1">
                <div className="px-3.5 mb-2 text-[10px] font-medium text-muted-foreground">
                  Showing {filtered.length} results for "{query}"
                </div>
                {filtered.map((t) => (
                  <NodeItem
                    key={t.subtype}
                    template={t}
                    disabled={!activeProjectId}
                  />
                ))}
              </div>
            ) : query ? (
              <div className="px-4 py-8 text-center flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3 text-muted-foreground">
                  <TablerIcons.IconSearch size={18} />
                </div>
                <div className="text-sm font-medium text-foreground mb-1">
                  No results found
                </div>
                <div className="text-xs text-muted-foreground max-w-[150px] leading-relaxed">
                  Try a different search term or browse by category.
                </div>
              </div>
            ) : (
              <div className="px-4 py-8 text-center flex flex-col items-center text-muted-foreground">
                <TablerIcons.IconSearch
                  size={24}
                  stroke={1}
                  className="mb-2 opacity-20"
                />
                <p className="text-[11px]">Type to search the registry</p>
              </div>
            ))}

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

          {activeTab === "integrations" && (
            <div className="px-4 py-8 text-center flex flex-col items-center text-muted-foreground">
              <TablerIcons.IconPuzzle
                size={24}
                stroke={1}
                className="mb-2 opacity-20"
              />
              <p className="text-[11px]">No integrations configured</p>
            </div>
          )}

          {activeTab === "flows" && (
            <div className="py-2">
              <div className="px-4 mb-3">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-3 whitespace-nowrap">
                  ER Diagrams
                </h3>
                <div className="space-y-1">
                  {grouped.flow
                    .filter(
                      (t) =>
                        t.subtype.startsWith("flow-") &&
                        ![
                          "actor",
                          "participant",
                          "api-call",
                          "auth-flow",
                          "event",
                          "db-op",
                        ].some((s) => t.subtype.includes(s)),
                    )
                    .map((t) => (
                      <NodeItem
                        key={t.subtype}
                        template={t}
                        disabled={!activeProjectId}
                      />
                    ))}
                </div>
              </div>
              <div className="px-4 mt-6 mb-3">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-3 whitespace-nowrap">
                  Sequence Diagrams
                </h3>
                <div className="space-y-1">
                  {grouped.flow
                    .filter((t) =>
                      [
                        "actor",
                        "participant",
                        "api-call",
                        "auth-flow",
                        "event",
                        "db-op",
                      ].some((s) => t.subtype.includes(s)),
                    )
                    .map((t) => (
                      <NodeItem
                        key={t.subtype}
                        template={t}
                        disabled={!activeProjectId}
                      />
                    ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "shapes" && (
            <div className="py-2 px-3">
              {/* Standard Shapes */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3 px-1 whitespace-nowrap">
                  <h3 className="text-[12px] font-bold text-foreground">
                    Standard
                  </h3>
                  <div className="flex gap-2 text-muted-foreground/40">
                    <TablerIcons.IconStar size={14} />
                    <TablerIcons.IconTrash size={14} />
                    <TablerIcons.IconChevronUp size={14} />
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-1.5 justify-items-center">
                  {grouped.shape
                    .filter(
                      (t) =>
                        t.subtype.startsWith("sh-") &&
                        !t.subtype.includes("flow"),
                    )
                    .map((t) => (
                      <ShapeItem
                        key={t.subtype}
                        template={t}
                        disabled={!activeProjectId}
                      />
                    ))}
                </div>
              </div>

              {/* Flowchart Shapes */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3 px-1 whitespace-nowrap">
                  <h3 className="text-[12px] font-bold text-foreground">
                    Flowchart
                  </h3>
                  <div className="flex gap-2 text-muted-foreground/40">
                    <TablerIcons.IconStar size={14} />
                    <TablerIcons.IconTrash size={14} />
                    <TablerIcons.IconChevronUp size={14} />
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-1.5 justify-items-center">
                  {grouped.shape
                    .filter((t) => t.subtype.includes("flow"))
                    .map((t) => (
                      <ShapeItem
                        key={t.subtype}
                        template={t}
                        disabled={!activeProjectId}
                      />
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Custom Node Section - Always at bottom for Components tab */}
        {activeTab === "components" && !query && (
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
              <p className="text-[10px] text-primary/70 leading-relaxed italic">
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
    </div>
  );
}

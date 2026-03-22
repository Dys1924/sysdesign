import * as React from "react";
import * as TablerIcons from "@tabler/icons-react";
import { REGISTRY } from "../../data/registry";
import {
  CATEGORY_STYLE,
  type NodeCategory,
  type NodeTemplate,
} from "../../types/diagram";
import { useProjectStore } from "../../store/project.store";

type TablerIcon = React.FC<{ size?: number; stroke?: number; color?: string }>;

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
];

function NodeItem({
  template,
  isCustom = false,
  disabled = false,
}: {
  template: NodeTemplate;
  isCustom?: boolean;
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
      className={`flex items-center gap-2.5 px-3 py-2 mx-1.5 rounded-lg cursor-grab select-none
                 transition-colors duration-100 group ${disabled ? "opacity-40 cursor-not-allowed filter grayscale-[0.5]" : "hover:bg-muted"}`}
    >
      <div
        className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
        style={{
          background: `color-mix(in srgb, ${style.color} 15%, var(--card))`,
        }}
      >
        {Icon && <Icon size={14} stroke={1.8} color={style.color} />}
      </div>
      <div className="min-w-0">
        <div className="text-[12.5px] font-medium text-foreground leading-tight truncate">
          {template.label}
        </div>
        <div className="text-[10.5px] text-muted-foreground leading-tight truncate">
          {template.description}
        </div>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const [query, setQuery] = React.useState("");

  const [expanded, setExpanded] = React.useState<Record<NodeCategory, boolean>>(
    {
      microservice: false,
      cloud: false,
      database: false,
      frontend: false,
      networking: false,
      security: false,
      observability: false,
      ai: false,
      devops: false,
    },
  );

  const toggleCategory = (cat: NodeCategory) => {
    setExpanded((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const filtered = React.useMemo(() => {
    const q = query.toLowerCase();
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
    };

    REGISTRY.forEach((t) => items[t.category].push(t));
    Object.keys(items).forEach((cat) => {
      items[cat as NodeCategory].sort((a, b) => a.label.localeCompare(b.label));
    });
    return items;
  }, []);

  return (
    <aside className="relative h-full w-60 flex flex-col overflow-hidden rounded-xl border border-border bg-card/95 backdrop-blur-md shadow-2xl z-20">
      <div className="shrink-0 px-3.5 py-3 border-b border-border bg-transparent z-10 transition-colors">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Components
        </div>
        <div className="relative">
          <TablerIcons.IconSearch
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={14}
          />
          <input
            type="text"
            placeholder="Search all services..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-muted border border-border rounded-md pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-border transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <TablerIcons.IconX size={12} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {!query ? (
          // Empty search - collapsed groups
          CATEGORY_ORDER.map((cat) => {
            const style = CATEGORY_STYLE[cat];
            const items = grouped[cat];
            const isExpanded = expanded[cat];
            return (
              <div key={cat} className="mb-1">
                <button
                  onClick={() => toggleCategory(cat)}
                  className="w-full flex items-center justify-between px-3.5 py-1.5 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <TablerIcons.IconChevronRight
                      size={14}
                      className={`text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`}
                    />
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: style.text }}
                    >
                      {style.label}
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 rounded-sm">
                    {items.length}
                  </span>
                </button>

                {isExpanded && (
                  <div className="py-1">
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
        ) : // Searching - flat list
        filtered.length > 0 ? (
          <div className="py-1">
            <div className="px-3.5 mb-2 text-[10px] font-medium text-muted-foreground">
              Showing {filtered.length} results
            </div>
            {filtered.map((t) => (
              <NodeItem
                key={t.subtype}
                template={t}
                disabled={!activeProjectId}
              />
            ))}
          </div>
        ) : (
          <div className="px-4 py-8 text-center flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3 text-muted-foreground">
              <TablerIcons.IconSearch size={18} />
            </div>
            <div className="text-sm font-medium text-foreground mb-1">
              No results found
            </div>
            <div className="text-xs text-muted-foreground max-w-[150px] leading-relaxed">
              Drag a custom node below to create what you need.
            </div>
          </div>
        )}
      </div>

      <div className="shrink-0 mt-auto border-t border-border bg-card">
        <div className="px-3.5 py-3">
          <div className="text-[10px] font-semibold uppercase text-muted-foreground mb-2">
            Create Custom
          </div>
          <NodeItem
            isCustom
            disabled={!activeProjectId}
            template={{
              subtype: `custom-node-${Date.now()}`,
              label: query || "Custom Node",
              category: "cloud",
              icon: "IconBox",
              description: "Double-click to name",
            }}
          />
        </div>
        <div className="px-3.5 py-3 border-t border-border text-[10px] text-muted-foreground leading-relaxed relative overflow-hidden">
          {!activeProjectId ? (
            <div className="flex flex-col gap-1 text-primary animate-in fade-in slide-in-from-bottom-2">
              <span className="font-bold flex items-center gap-1 uppercase tracking-wider">
                <TablerIcons.IconInfoCircle size={10} />
                Editor Locked
              </span>
              <p className="text-[12px]">
                Please select or create a project to start diagramming.
              </p>
            </div>
          ) : (
            <>
              Drag onto canvas to add.
              <br />
              Double-click to rename.
              <br />
              ⌘Z / ⌘Y to undo / redo.
            </>
          )}
        </div>
      </div>
    </aside>
  );
}

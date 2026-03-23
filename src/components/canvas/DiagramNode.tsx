import * as TablerIcons from "@tabler/icons-react";
import type { NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";
import { memo, useCallback, useState } from "react";
import { cn } from "../../lib/utils";
import { updateNodeMeta, setEditingNodeId, useCanvasStore } from "../../store/canvas.store";
import type { NodeMeta } from "../../types/diagram";
import { CATEGORY_STYLE } from "../../types/diagram";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";

import { IconPencilBolt } from "@tabler/icons-react";

type TablerIconComponent = React.FC<{
  size?: number;
  stroke?: number;
  color?: string;
}>;

/**
 * Dynamically resolves a Tabler Icon component by its string name.
 * @param name - The name of the icon (e.g., 'IconBox')
 * @returns The React component for the icon, or a default IconBox if not found.
 */
function getIcon(name: string): TablerIconComponent {
  const icons = TablerIcons as Record<string, unknown>;
  return (icons[name] as TablerIconComponent) ?? TablerIcons.IconBox;
}

type Status = "existing" | "planned" | "deprecated" | "";

const STATUS_CONFIG: Record<
  Exclude<Status, "">,
  { label: string; className: string }
> = {
  existing: { label: "Existing", className: "bg-emerald-500 text-white" },
  planned: { label: "Planned", className: "bg-blue-500 text-white" },
  deprecated: { label: "Deprecated", className: "bg-red-500 text-white" },
};

/**
 * Custom node component for the diagram representing system components.
 * Supports categorization (styling/icons), editing labels, notes, owners, and status badges.
 */
function DiagramNode({ id, data, selected, type }: NodeProps) {
  const meta = data as NodeMeta;
  const category = meta.category || "microservice";
  const style = CATEGORY_STYLE[category as keyof typeof CATEGORY_STYLE];
  const Icon = getIcon(meta.icon || "IconBox");

  const globalEditingId = useCanvasStore((s) => s.editingNodeId);
  const editing = globalEditingId === id;

  const [draft, setDraft] = useState((meta.label as string) ?? "");
  const [draftNotes, setDraftNotes] = useState((meta.notes as string) ?? "");
  const [draftOwner, setDraftOwner] = useState((meta.owner as string) ?? "");
  const [draftStatus, setDraftStatus] = useState<Status>(
    (meta.status as Status) ?? "",
  );

  const openEdit = useCallback(() => {
    setDraft((meta.label as string) ?? "");
    setDraftNotes((meta.notes as string) ?? "");
    setDraftOwner((meta.owner as string) ?? "");
    setDraftStatus((meta.status as Status) ?? "");
    setEditingNodeId(id);
  }, [id, meta.label, meta.notes, meta.owner, meta.status]);

  const closeEdit = useCallback(() => {
    setEditingNodeId(null);
  }, []);

  const commitEdit = useCallback(() => {
    setEditingNodeId(null);
    const finalLabel = draft.trim() || (meta.label as string);
    setDraft(finalLabel);
    updateNodeMeta(id, {
      label: finalLabel,
      notes: draftNotes.trim() || undefined,
      owner: draftOwner.trim() || undefined,
      status: draftStatus || undefined,
    });
  }, [id, draft, draftNotes, draftOwner, draftStatus, meta.label]);

  const handleStyle: React.CSSProperties = {
    width: 8,
    height: 8,
    background: style.color,
    border: "2px solid var(--card)",
    borderRadius: "99px",
  };

  const status = (meta.status as Status) || "";
  const statusCfg = status ? STATUS_CONFIG[status] : null;

  const subtype = meta.subtype || "";
  const isShape = subtype.startsWith("sh-");

  // Determine shape-specific classes and styles
  let shapeClass = "rounded-[10px]";
  let shapeStyle: React.CSSProperties = {};

  if (subtype === "sh-flow-diamond") {
    shapeClass = "";
    shapeStyle = {
      clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
    };
  } else if (subtype === "sh-flow-circle" || subtype === "fe-user") {
    shapeClass = "rounded-full aspect-square flex flex-col items-center justify-center p-4";
  } else if (subtype === "sh-flow-para") {
    shapeClass = "";
    shapeStyle = {
      clipPath: "polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%)",
    };
  } else if (subtype === "sh-flow-hex") {
    shapeClass = "";
    shapeStyle = {
      clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
    };
  } else if (subtype === "sh-flow-oval") {
    shapeClass = "rounded-full px-6";
  } else if (subtype === "sh-sticky") {
    shapeClass = "rounded-none rotate-1 shadow-md p-4";
    shapeStyle = {
      background: "#fef08a",
      color: "#854f0b",
      borderColor: "#facc15",
    };
  } else if (subtype === "sh-flow-cylinder") {
    shapeClass = "rounded-[30%]"; // Approximate cylinder
  }

  const isGroup = type === "group";
  const isFlow = (meta.category === "flow" || meta.category === "shape") && !isGroup;

  return (
    <div
      className={cn(
        "relative transition-all duration-150",
        !isGroup && "px-3 py-2.5 border", // Groups handle their own padding/border
        shapeClass,
        editing ? "min-w-[220px] max-w-[240px]" : isFlow ? "min-w-[140px] aspect-4/3 flex flex-col items-center justify-center p-6 text-center" : isGroup ? "w-full h-full p-4!" : "min-w-[148px] max-w-[190px]",
        selected
          ? "border-(--node-color) bg-[color-mix(in_srgb,var(--node-color)_6%,var(--card))] shadow-[0_0_0_3px_color-mix(in_srgb,var(--node-color)_20%,transparent)] border"
          : cn(
              isGroup ? "bg-muted/3 border-2 border-dashed border-muted-foreground/20" : isFlow ? "bg-card border-foreground border-2" : "bg-card border-border shadow-[0_1px_4px_rgba(0,0,0,0.07)]", 
              subtype === "sh-sticky" && "border-yellow-400 bg-yellow-100/50"
            ),
      )}
      style={{
        ...shapeStyle,
        "--node-color": subtype === "sh-sticky" ? "#facc15" : style.color,
      } as React.CSSProperties}
    >
      {statusCfg && !editing && (
        <div
          className={cn(
            "absolute -top-2 -right-2 shrink-0 text-[8.5px] font-semibold px-1.5 py-0.5 rounded-full leading-none z-10",
            statusCfg.className,
          )}
        >
          {statusCfg.label}
        </div>
      )}
      {/* Handles — all 4 sides, source + target — hidden for groups */}
      {!isGroup && (
        <>
          <Handle type="target" position={Position.Top} id="top-t" style={handleStyle} />
          <Handle type="source" position={Position.Top} id="top-s" style={handleStyle} />
          <Handle type="target" position={Position.Left} id="left-t" style={handleStyle} />
          <Handle type="source" position={Position.Left} id="left-s" style={handleStyle} />
          <Handle type="target" position={Position.Right} id="right-t" style={handleStyle} />
          <Handle type="source" position={Position.Right} id="right-s" style={handleStyle} />
          <Handle type="target" position={Position.Bottom} id="bottom-t" style={handleStyle} />
          <Handle type="source" position={Position.Bottom} id="bottom-s" style={handleStyle} />
        </>
      )}

      {!isFlow && !isGroup && (
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <div
              className="size-6 rounded-md flex items-center justify-center shrink-0"
              style={{ background: style.pill, color: style.color }}
            >
              <Icon size={10} stroke={1.8} />
            </div>
            <h6
              className="text-[9px] font-medium tracking-widest truncate"
              style={{ color: subtype === "sh-sticky" ? "#854f0b" : style.text }}
            >
              {isShape ? "Note" : style.label}
            </h6>
          </div>
        </div>
      )}

      {/* Edit form */}
      {editing ? (
        <div className="flex flex-col gap-2 mt-1">
          <Input
            autoFocus
            size="xs"
            className="nodrag py-1! text-[6px]!"
            placeholder="Label"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitEdit();
              if (e.key === "Escape") closeEdit();
            }}
          />
          <Input
            size="xs"
            className="nodrag py-1! text-[6px]!"
            placeholder="Owner (e.g. Auth Team)"
            value={draftOwner}
            onChange={(e) => setDraftOwner(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitEdit();
            }}
          />
          <Textarea
            placeholder="Notes… (Shift+Enter to save)"
            value={draftNotes}
            rows={4}
            className="resize-none nodrag px-2 py-1 text-[6px]! leading-tight min-h-4"
            onChange={(e) => setDraftNotes(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.shiftKey) {
                e.preventDefault();
                commitEdit();
              }
            }}
          />
          <Select
            value={draftStatus}
            onValueChange={(val) => setDraftStatus(val as Status)}
          >
            <SelectTrigger
              size="xs"
              className="w-full nodrag text-[6px]! py-1! h-1"
            >
              <SelectValue
                placeholder="No status"
                className="text-[6px]! h-4!"
              />
            </SelectTrigger>
            <SelectContent className="nodrag">
              <SelectItem value="" className="">
                No status
              </SelectItem>
              <SelectItem value="existing" className="">
                Existing
              </SelectItem>
              <SelectItem value="planned" className="">
                Planned
              </SelectItem>
              <SelectItem value="deprecated" className="">
                Deprecated
              </SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={commitEdit}
            variant="default"
            size={"sm"}
            className="w-full text-[6px]! h-6 active:scale-[0.98] transition-all cursor-pointer nodrag"
          >
            Save
          </Button>
        </div>
      ) : (
        /* Read view */
        <div onDoubleClick={openEdit} className={cn("cursor-text", isFlow && "flex flex-col items-center", isGroup && "flex items-start")}>
          <div className={cn("flex flex-wrap gap-1 items-center", (isFlow || isGroup) && "justify-center", isGroup && "w-full opacity-60")}>
            {!isFlow && !isGroup && <IconPencilBolt size={10} stroke={1.8} />}
            <h6 className={cn(
              "font-semibold",
              isFlow ? "text-sm" : isGroup ? "text-[10px] uppercase tracking-wider" : "text-[8px]"
            )}>
              {meta.label as string}
            </h6>
          </div>

          {meta.description && !isFlow && (
            <div className="text-[7px] text-muted-foreground mt-0.5">
              {meta.description as string}
            </div>
          )}

          {(meta.owner || meta.notes) && (
            <div className="mt-1.5 pt-1.5 border-t border-dashed border-border flex flex-col gap-0.5">
              {meta.owner && (
                <div
                  className="text-[10px] font-semibold"
                  style={{ color: style.color }}
                >
                  @{meta.owner as string}
                </div>
              )}
              {meta.notes && (
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <TablerIcons.IconNotes size={10} stroke={2} />
                  <span className="text-[7px]">Notes attached</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(DiagramNode);

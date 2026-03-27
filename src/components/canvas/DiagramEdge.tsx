import { useState } from "react";
import {
  BaseEdge,
  getBezierPath,
  EdgeLabelRenderer,
  type EdgeProps,
} from "@xyflow/react";
import { updateEdgeMeta } from "../../store/canvas.store";
import { Input } from "../ui/input";

/**
 * Custom edge component for the diagram.
 * Renders a bezier path with an editable label in the center.
 */
export default function DiagramEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style,
  markerEnd,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [labelDraft, setLabelDraft] = useState((data?.label as string) || "");

  const commitEdit = () => {
    setIsEditing(false);
    updateEdgeMeta(id, { label: labelDraft });
  };

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={style} markerEnd={markerEnd} />

      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            background: "var(--card)",
            // padding: "2px 6px",
            // borderRadius: 6,
            // fontSize: 6,
            // fontWeight: 600,
            // border: "1px solid var(--border)",
            color: "var(--foreground)",
            pointerEvents: "all",
            cursor: "pointer",
            zIndex: 10,
            maxWidth: "150px",
            textAlign: "center",
            wordWrap: "break-word",
            whiteSpace: "normal",
          }}
          className="nodrag nopan rounded-md px-2.5 py-1 border text-[8px]!"
          onPointerDown={(e) => {
            // Prevent XYFlow selection/dragging when interacting with label
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
        >
          {isEditing ? (
            <Input
              autoFocus
              size="sm"
              className="text-[10px]! p-0 nodrag focus-visible:border-none focus-visible:ring-0 shadow-none"
              value={labelDraft}
              style={{
                width: `${Math.max(40, labelDraft.length * 7)}px`,
              }}
              onChange={(e) => setLabelDraft(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitEdit();
                if (e.key === "Escape") {
                  setLabelDraft((data?.label as string) || "");
                  setIsEditing(false);
                }
              }}
            />
          ) : (
            (data?.label as string) || (
              <span className="opacity-50 text-[10px]!">+ label</span>
            )
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

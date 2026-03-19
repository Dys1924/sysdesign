import { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  IconLayoutGrid,
  IconTrash,
  IconDownload,
  IconChevronDown,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconSquarePlus,
  IconGridDots,
  IconFolder,
} from "@tabler/icons-react";
import {
  clearCanvas,
  undo,
  redo,
  groupSelected,
  toggleSnap,
  useCanvasStore,
} from "../../store/canvas.store";
import { useProjectStore, setActiveProject } from "../../store/project.store";
import {
  exportPng,
  exportSvgFile,
  exportMermaid,
  exportTerraform,
} from "../export/exportUtils";
import { ThemeToggle } from "../ThemeToggle";
import { Button } from "../ui/button";

const EXPORT_OPTIONS = [
  { key: "png", label: "PNG image", desc: "Raster, 2× resolution" },
  { key: "svg", label: "SVG image", desc: "Vector, infinitely scalable" },
  { key: "mermaid", label: "Mermaid", desc: "Diagram-as-code (.mmd)" },
  { key: "terraform", label: "Terraform", desc: "HCL scaffold (main.tf)" },
];

export default function Toolbar() {
  const projects = useProjectStore((s) => s.projects);
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const activeProject = projects.find((p) => p.id === activeProjectId);
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const snapToGrid = useCanvasStore((s) => s.snapToGrid);
  const historyIndex = useCanvasStore((s) => s.historyIndex);
  const historyLen = useCanvasStore((s) => s.history.length);

  const [exportOpen, setExportOpen] = useState(false);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < historyLen - 1;
  const hasNodes = nodes.length > 0;
  const hasSelection = nodes.some((n) => n.selected);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
      // Added project menu check
      const pMenu = document.getElementById("project-menu");
      const pBtn = document.getElementById("project-btn");
      if (
        pMenu &&
        !pMenu.contains(e.target as Node) &&
        pBtn &&
        !pBtn.contains(e.target as Node)
      ) {
        setProjectMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleExport = async (key: string) => {
    setExporting(key);
    setExportOpen(false);
    try {
      if (key === "png") await exportPng();
      else if (key === "svg") await exportSvgFile();
      else if (key === "mermaid") exportMermaid(nodes, edges);
      else if (key === "terraform") exportTerraform(nodes, edges);
    } finally {
      setExporting(null);
    }
  };

  return (
    <header className="h-12 flex items-center justify-between px-4 border-b bg-card shrink-0">
      {/* Left — brand + stats */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 relative">
          <div className="w-6 h-6 rounded-md bg-foreground flex items-center justify-center">
            <IconLayoutGrid
              size={13}
              stroke={1.8}
              className="text-background"
            />
          </div>
          <div
            id="project-btn"
            className="flex items-center gap-1.5 group cursor-pointer"
          >
            <span className="text-[13.5px] font-semibold text-foreground tracking-tight">
              Sysdesign
            </span>
          </div>
        </div>
        <Link
          to="/projects"
          className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[12px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all select-none"
        >
          <IconFolder size={14} stroke={1.8} />
          Projects
        </Link>
        <span className="text-border mx-1">|</span>
        <span className="text-[11.5px] text-muted-foreground">
          {nodes.length} node{nodes.length !== 1 ? "s" : ""} · {edges.length}{" "}
          edge{edges.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-1.5">
        {/* Undo / Redo */}
        <Button
          onClick={undo}
          disabled={!canUndo}
          title="Undo (⌘Z)"
          variant="outline"
          size="icon-sm"
        >
          <IconArrowBackUp size={15} stroke={1.8} />
        </Button>
        <Button
          onClick={redo}
          disabled={!canRedo}
          title="Redo (⌘Y)"
          variant="outline"
          size="icon-sm"
        >
          <IconArrowForwardUp size={15} stroke={1.8} />
        </Button>

        <div className="w-px h-5 bg-border mx-1" />

        <ThemeToggle />

        {/* Snap */}
        <Button
          onClick={toggleSnap}
          title={snapToGrid ? "Disable Snap to Grid" : "Enable Snap to Grid"}
          variant={snapToGrid ? "default" : "outline"}
          size="icon-sm"
        >
          <IconGridDots size={15} stroke={1.8} />
        </Button>

        {/* Group */}
        <Button
          onClick={groupSelected}
          disabled={!hasSelection}
          title="Group Selected (Ctrl+G)"
          variant="outline"
          size="sm"
        >
          <IconSquarePlus size={13} stroke={1.8} />
          Group
        </Button>

        {/* Clear */}
        <Button
          onClick={clearCanvas}
          disabled={!hasNodes}
          title="Clear canvas"
          variant="destructive"
          size="sm"
        >
          <IconTrash size={13} stroke={1.8} />
          Clear
        </Button>

        {/* Export */}
        <div ref={menuRef} className="relative">
          <Button
            onClick={() => setExportOpen((p) => !p)}
            disabled={!hasNodes}
            variant="outline"
            size="sm"
          >
            <IconDownload size={13} stroke={1.8} />
            {exporting ? "Exporting…" : "Export"}
            <IconChevronDown size={11} stroke={2} />
          </Button>

          {exportOpen && (
            <div
              className="absolute top-[calc(100%+6px)] right-0 z-50 bg-card border border-border
                             rounded-xl p-1 min-w-[172px] shadow-lg shadow-black/5"
            >
              {EXPORT_OPTIONS.map((opt) => (
                <Button
                  key={opt.key}
                  onClick={() => handleExport(opt.key)}
                  variant="ghost"
                  className="w-full flex-col items-start px-3 py-2 h-auto text-left"
                >
                  <span className="text-[12.5px] font-medium text-foreground">
                    {opt.label}
                  </span>
                  <span className="text-[10.5px] font-normal text-muted-foreground">
                    {opt.desc}
                  </span>
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useReactFlow } from "@xyflow/react";
import { useEffect, useRef, useState } from "react";

import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconBook,
  IconChevronDown,
  IconDownload,
  IconFocus2,
  IconFolder,
  IconGridDots,
  IconLoader2,
  IconLogout,
  IconSitemap,
  IconSquarePlus,
  IconTrash,
  IconUserCircle,
  IconVectorBezier2,
  IconZoomIn,
  IconZoomOut,
} from "@tabler/icons-react";
import { cn } from "../../lib/utils";
import { type Template } from "../../data/templates";
import {
  clearCanvas,
  groupSelected,
  loadTemplate,
  redo,
  setDiagramMode,
  toggleSnap,
  undo,
  useCanvasStore,
} from "../../store/canvas.store";
import {
  login,
  logout,
  setActiveProject,
  useProjectStore,
} from "../../store/project.store";
import {
  exportMermaid,
  exportPng,
  exportStructurizr,
  exportSvgFile,
  exportTerraform,
} from "../export/exportUtils";
import { ThemeToggle } from "../ThemeToggle";
import { Button } from "../ui/button";
import ConfirmModal from "../ui/ConfirmModal";
import { Logo } from "../ui/logo";

const EXPORT_OPTIONS = [
  { key: "png", label: "PNG image", desc: "Raster, 2× resolution" },
  { key: "svg", label: "SVG image", desc: "Vector, infinitely scalable" },
  { key: "mermaid", label: "Mermaid", desc: "Diagram-as-code (.mmd)" },
  { key: "terraform", label: "Terraform", desc: "HCL scaffold (main.tf)" },
  { key: "dsl", label: "Structurizr", desc: "C4 architecture (.dsl)" },
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
  const diagramMode = useCanvasStore((s) => s.diagramMode);

  const user = useProjectStore((s) => s.user);
  const loading = useProjectStore((s) => s.loading);
  const migrating = useProjectStore((s) => s.migrating);

  const location = useLocation();
  const navigate = useNavigate();
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  const [exportOpen, setExportOpen] = useState(false);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [templateConfirm, setTemplateConfirm] = useState<Template | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isCanvasRoute =
    location.pathname === "/" ||
    (!["/projects", "/templates", "/privacy", "/terms"].includes(
      location.pathname,
    ) &&
      !location.pathname.includes("."));

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < historyLen - 1;
  const hasNodes = nodes.length > 0;
  const hasSelection = nodes.some((n) => n.selected);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }

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

      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLoadTemplate = (tpl: Template) => {
    loadTemplate(tpl);
    setTemplateConfirm(null);
  };

  const handleExport = async (key: string) => {
    setExporting(key);
    setExportOpen(false);
    try {
      if (key === "png") await exportPng();
      else if (key === "svg") await exportSvgFile();
      else if (key === "mermaid") exportMermaid(nodes, edges);
      else if (key === "terraform") exportTerraform(nodes, edges);
      else if (key === "dsl") exportStructurizr(nodes, edges);
    } finally {
      setExporting(null);
    }
  };

  return (
    <>
      <header className="h-12 flex items-center justify-between px-4 border-b bg-card shrink-0 relative z-50">
        <ConfirmModal
          open={!!templateConfirm}
          title="Load Architecture Template?"
          description={`This will clear your current canvas and load the "${templateConfirm?.name}" design. This action cannot be undone.`}
          confirmText="Load Template"
          onClose={() => setTemplateConfirm(null)}
          onConfirm={() => handleLoadTemplate(templateConfirm!)}
        />
        
        {/* Left — brand + stats */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 relative">
            <Logo className="h-6 w-auto" />
            <h1 className="sr-only">SysDesign — Systems Architecture</h1>
          </Link>

          <Link
            to="/projects"
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[12px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all select-none"
          >
            <IconFolder size={14} stroke={1.8} />
            Projects
          </Link>

          <Link
            to="/templates"
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[12px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all select-none"
          >
            <IconBook size={14} stroke={1.8} className="text-primary" />
            Templates
          </Link>

          {/* Project Selector Dropdown */}
          <div className="relative flex items-center">
            <Button
              id="project-btn"
              variant="ghost"
              size="sm"
              onClick={() => setProjectMenuOpen(!projectMenuOpen)}
              className={`h-7 px-2 gap-1.5 text-[12px] font-semibold border border-transparent hover:border-border transition-all ${activeProject ? "text-foreground bg-primary/5 border-primary/20 hover:bg-primary/10" : "text-muted-foreground"}`}
            >
              <span className="max-w-[120px] truncate">
                {activeProject ? activeProject.name : "Select Project"}
              </span>
              <IconChevronDown
                size={12}
                className={`transition-transform duration-200 ${projectMenuOpen ? "rotate-180" : ""}`}
              />
            </Button>

            {projectMenuOpen && (
              <div
                id="project-menu"
                className="absolute top-[calc(100%+6px)] left-0 z-50 bg-card border border-border
                           rounded-xl p-1 min-w-[200px] shadow-xl animate-in fade-in slide-in-from-top-1"
              >
                <div className="px-3 py-1.5 border-b border-border/50 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                    Switch Project
                  </span>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {projects.map((p) => (
                    <Button
                      key={p.id}
                      variant="ghost"
                      onClick={() => {
                        setActiveProject(p.id);
                        setProjectMenuOpen(false);
                        navigate({ to: "/$slug", params: { slug: p.slug } });
                      }}
                      className={`w-full justify-start px-3 py-2 h-auto text-left gap-2 ${p.id === activeProjectId ? "bg-primary/5 text-primary" : ""}`}
                    >
                      <IconFolder size={14} className={p.id === activeProjectId ? "text-primary" : "text-muted-foreground"} />
                      <div className="flex flex-col min-w-0">
                        <span className="text-[12.5px] font-medium truncate">{p.name}</span>
                        <span className="text-[10px] text-muted-foreground truncate">{new Date(p.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </Button>
                  ))}
                </div>
                <div className="mt-1 pt-1 border-t border-border/50">
                  <Button
                    onClick={() => { setProjectMenuOpen(false); navigate({ to: "/projects" }); }}
                    variant="ghost"
                    className="w-full justify-start px-3 py-2 h-auto text-left gap-2 text-primary hover:bg-primary/5"
                  >
                    <IconSquarePlus size={14} />
                    <span className="text-[12px] font-semibold">All Projects</span>
                  </Button>
                </div>
              </div>
            )}
          </div>

          <span className="text-border mx-1 opacity-50">|</span>
          <span className={`text-[11.5px] text-muted-foreground transition-opacity ${isCanvasRoute ? "opacity-100" : "opacity-0"}`}>
            {nodes.length} nodes · {edges.length} edges
          </span>
        </div>

        {/* Right — Global Actions */}
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <div ref={userMenuRef} className="relative ml-1">
            {user ? (
              <Button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                variant="outline"
                size="icon-sm"
                className="rounded-full overflow-hidden border-2 border-primary/20 p-0"
              >
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <IconUserCircle size={18} />
                )}
              </Button>
            ) : (
              <Button onClick={login} disabled={loading || migrating} variant="outline" size="sm" className="gap-1.5 h-8">
                {loading || migrating ? (
                  <IconLoader2 size={14} className="animate-spin" />
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                )}
                {migrating ? "Wait…" : "Sign in"}
              </Button>
            )}

            {userMenuOpen && user && (
              <div className="absolute top-[calc(100%+6px)] right-0 z-50 bg-card border border-border rounded-xl p-1 min-w-[200px] shadow-lg">
                <div className="px-3 py-2 border-b border-border/50 mb-1">
                  <p className="text-[12px] font-semibold truncate">{user.user_metadata?.full_name || "User"}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                </div>
                <Button
                  onClick={() => { logout(); setUserMenuOpen(false); }}
                  variant="ghost"
                  className="w-full justify-start text-destructive px-3 py-2 h-auto"
                >
                  <IconLogout size={14} className="mr-2" />
                  <span className="text-[12.5px] font-medium">Logout</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Floating Bottom Toolbar — Design System Center Dock */}
      {isCanvasRoute && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-1.5 p-1.5 bg-card/85 backdrop-blur-xl border border-border/80 rounded-[22px] shadow-[0_12px_40px_rgba(0,0,0,0.15)] ring-1 ring-white/10">
            
            {/* Mode Segmented Controls */}
            <div className="flex items-center bg-muted/40 p-0.5 rounded-[14px] border border-border/30 mr-2">
              <Button
                variant={diagramMode === "architecture" ? "default" : "ghost"}
                size="xs"
                onClick={() => setDiagramMode("architecture")}
                className={cn(
                  "h-8 px-4 text-[10px] font-bold uppercase tracking-widest rounded-[10px] transition-all",
                  diagramMode === "architecture" ? "shadow-md bg-background" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <IconVectorBezier2 size={12} className="mr-2 opacity-80" />
                Arch
              </Button>
              <Button
                variant={diagramMode === "c4" ? "default" : "ghost"}
                size="xs"
                onClick={() => setDiagramMode("c4")}
                className={cn(
                  "h-8 px-4 text-[10px] font-bold uppercase tracking-widest rounded-[10px] transition-all",
                  diagramMode === "c4" ? "shadow-md bg-background" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <IconSitemap size={12} className="mr-2 opacity-80" />
                C4
              </Button>
            </div>

            <div className="w-px h-6 bg-border/40 mx-0.5" />

            {/* History Dock */}
            <div className="flex items-center gap-1">
              <Button onClick={undo} disabled={!canUndo} variant="ghost" size="icon-sm" className="h-9 w-9 rounded-xl hover:bg-primary/5 hover:text-primary transition-colors disabled:opacity-30" title="Undo (⌘Z)">
                <IconArrowBackUp size={18} stroke={1.5} />
              </Button>
              <Button onClick={redo} disabled={!canRedo} variant="ghost" size="icon-sm" className="h-9 w-9 rounded-xl hover:bg-primary/5 hover:text-primary transition-colors disabled:opacity-30" title="Redo (⌘Y)">
                <IconArrowForwardUp size={18} stroke={1.5} />
              </Button>
            </div>

            <div className="w-px h-6 bg-border/40 mx-0.5" />

            {/* Navigation Dock */}
            <div className="flex items-center gap-1">
              <Button onClick={() => zoomIn()} variant="ghost" size="icon-sm" className="h-9 w-9 rounded-xl hover:bg-primary/5 hover:text-primary transition-colors" title="Zoom In (+)">
                <IconZoomIn size={18} stroke={1.5} />
              </Button>
              <Button onClick={() => zoomOut()} variant="ghost" size="icon-sm" className="h-9 w-9 rounded-xl hover:bg-primary/5 hover:text-primary transition-colors" title="Zoom Out (-)">
                <IconZoomOut size={18} stroke={1.5} />
              </Button>
              <Button onClick={() => fitView({ duration: 450 })} variant="ghost" size="icon-sm" className="h-9 w-9 rounded-xl hover:bg-primary/5 hover:text-primary transition-colors" title="Fit to Canvas">
                <IconFocus2 size={18} stroke={1.5} />
              </Button>
            </div>

            <div className="w-px h-6 bg-border/40 mx-0.5" />

            {/* Utility Actions */}
            <div className="flex items-center gap-1">
              <Button
                onClick={toggleSnap}
                variant={snapToGrid ? "default" : "ghost"}
                size="icon-sm"
                className={cn("h-9 w-9 rounded-xl transition-all", snapToGrid ? "bg-primary/10 text-primary border-primary/20" : "hover:text-primary")}
                title="Snap to Grid"
              >
                <IconGridDots size={18} stroke={1.5} />
              </Button>
              <Button
                onClick={() => groupSelected()}
                disabled={!hasSelection}
                variant="ghost"
                size="sm"
                className="px-3 h-9 gap-2 text-[11px] font-bold uppercase tracking-tight rounded-xl hover:bg-primary/5 hover:text-primary transition-all disabled:opacity-30"
              >
                <IconSquarePlus size={15} stroke={2} />
                Group
              </Button>
              <Button
                onClick={clearCanvas}
                disabled={!hasNodes}
                variant="ghost"
                size="icon-sm"
                className="h-9 w-9 rounded-xl text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-30"
                title="Wipe Canvas"
              >
                <IconTrash size={18} stroke={1.5} />
              </Button>
            </div>

            <div className="w-px h-6 bg-border/40 mx-0.5" />

            {/* Primary Action: Export */}
            <div ref={menuRef} className="relative">
              <Button
                onClick={() => setExportOpen((p) => !p)}
                disabled={!hasNodes}
                variant="default"
                size="sm"
                className="h-9 px-4 rounded-xl gap-2 shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all font-bold uppercase text-[10px] tracking-widest disabled:opacity-50"
              >
                {exporting ? <IconLoader2 size={14} className="animate-spin" /> : <IconDownload size={14} stroke={2} />}
                {exporting ? "Wait" : "Export"}
                <IconChevronDown size={11} className={cn("transition-transform duration-300", exportOpen && "rotate-180")} />
              </Button>

              {exportOpen && (
                <div className="absolute bottom-[calc(100%+16px)] right-0 z-50 bg-card/95 backdrop-blur-2xl border border-border/80 rounded-2xl p-1.5 min-w-[220px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="px-3.5 py-2 border-b border-border/40 mb-1.5">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Select Format</span>
                  </div>
                  <div className="space-y-0.5">
                    {EXPORT_OPTIONS.map((opt) => (
                      <Button
                        key={opt.key}
                        onClick={() => handleExport(opt.key)}
                        variant="ghost"
                        className="w-full flex-col items-start px-3.5 py-2.5 h-auto text-left rounded-xl hover:bg-primary/5 group"
                      >
                        <span className="text-[13px] font-bold group-hover:text-primary transition-colors">{opt.label}</span>
                        <span className="text-[10px] text-muted-foreground font-medium opacity-80">{opt.desc}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

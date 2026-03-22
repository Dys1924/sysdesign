import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "@tanstack/react-router";
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
  IconUserCircle,
  IconLogout,
  IconLoader2,
} from "@tabler/icons-react";
import {
  clearCanvas,
  undo,
  redo,
  groupSelected,
  toggleSnap,
  useCanvasStore,
} from "../../store/canvas.store";
import {
  useProjectStore,
  setActiveProject,
  login,
  logout,
} from "../../store/project.store";
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

  const user = useProjectStore((s) => s.user);
  const loading = useProjectStore((s) => s.loading);
  const migrating = useProjectStore((s) => s.migrating);
  const hasLocalProjects = useProjectStore((s) => s.projects.length > 0 && !s.user);

  const location = useLocation();
  const isCanvasRoute = location.pathname === "/" || location.pathname.split("/").length === 2 && location.pathname !== "/projects";

  const [exportOpen, setExportOpen] = useState(false);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

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
        <span className={`text-[11.5px] text-muted-foreground transition-opacity ${isCanvasRoute ? 'opacity-100' : 'opacity-0'}`}>
          {nodes.length} node{nodes.length !== 1 ? "s" : ""} · {edges.length}{" "}
          edge{edges.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-1">
        {/* Canvas-specific actions */}
        <div className={`flex items-center gap-1.5 transition-all duration-300 ${!isCanvasRoute ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
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

        {/* Global actions (Theme, Auth) */}
        <div className="flex items-center gap-1.5 ml-1">
          <div className="w-px h-5 bg-border mx-1" />
          
          <ThemeToggle />

          <div ref={userMenuRef} className="relative ml-1">
            {user ? (
              <Button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                variant="outline"
                size="icon-sm"
                className="rounded-full overflow-hidden border-2 border-primary/20 p-0"
                title={user.email}
              >
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <IconUserCircle size={18} />
                )}
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                {hasLocalProjects && (
                  <span className="text-[10px] text-muted-foreground mr-1 hidden sm:inline-block bg-muted/50 px-2 py-0.5 rounded-full whitespace-nowrap">
                    Local work will be synced
                  </span>
                )}
                <Button
                  onClick={login}
                  disabled={loading || migrating}
                  variant="outline"
                  size="sm"
                  className="gap-1.5 pl-2 pr-3"
                >
                  {loading || migrating ? (
                    <IconLoader2 size={14} stroke={1.8} className="animate-spin" />
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                    </svg>
                  )}
                  {migrating ? "Migrating…" : loading ? "Signing in…" : "Sign in"}
                </Button>
              </div>
            )}

            {userMenuOpen && user && (
              <div
                className="absolute top-[calc(100%+6px)] right-0 z-50 bg-card border border-border
                             rounded-xl p-1 min-w-[200px] shadow-lg shadow-black/10"
              >
                <div className="px-3 py-2 border-b border-border/50 mb-1">
                  <p className="text-[12px] font-semibold truncate">
                    {user.user_metadata?.full_name || "User"}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
                <Button
                  onClick={() => {
                    logout();
                    setUserMenuOpen(false);
                  }}
                  variant="ghost"
                  className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 px-3 py-2 h-auto"
                >
                  <IconLogout size={14} className="mr-2" />
                  <span className="text-[12.5px] font-medium">Logout</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

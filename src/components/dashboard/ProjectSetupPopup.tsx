import { useState } from "react";
import {
  IconFolderPlus,
  IconX,
  IconLoader2,
  IconInfoCircle,
} from "@tabler/icons-react";
import { useProjectStore, MAX_PROJECTS } from "../../store/project.store";

interface ProjectSetupPopupProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, description?: string) => void;
}

export default function ProjectSetupPopup({
  open,
  onClose,
  onCreate,
}: ProjectSetupPopupProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const projects = useProjectStore((s) => s.projects);
  const isLimitReached = projects.length >= MAX_PROJECTS;

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isLimitReached) return;

    setLoading(true);
    setTimeout(() => {
      onCreate(name, description);
      setName("");
      setDescription("");
      setLoading(false);
    }, 400);
  };

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-sm px-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl shadow-black/10 animate-in slide-in-from-top-4 fade-in duration-300 p-5 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <IconFolderPlus size={18} stroke={1.8} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground tracking-tight">
                Project Setup
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Start by naming your architecture
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-muted rounded-md transition-colors text-muted-foreground"
          >
            <IconX size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="name"
              className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-0.5"
            >
              Name
            </label>
            <input
              autoFocus
              id="name"
              placeholder="e.g. Payments Engine"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-9 px-3 bg-muted/50 border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="desc"
              className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-0.5"
            >
              Description
            </label>
            <textarea
              id="desc"
              rows={2}
              placeholder="System details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 bg-muted/50 border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-colors resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 mt-1">
            <button
              type="submit"
              disabled={!name.trim() || loading || isLimitReached}
              className={`w-full inline-flex items-center justify-center gap-2 h-9 px-4 text-xs font-semibold text-white rounded-lg transition-colors shadow-sm ${
                isLimitReached
                  ? "bg-muted text-muted-foreground pointer-events-none"
                  : "bg-primary hover:bg-primary/90"
              }`}
            >
              {loading ? (
                <>
                  <IconLoader2 size={14} className="animate-spin" />
                  Initialising...
                </>
              ) : isLimitReached ? (
                "Project Limit Reached"
              ) : (
                "Create Project"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

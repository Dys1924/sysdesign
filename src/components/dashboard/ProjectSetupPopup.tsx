import { useState } from "react";
import {
  IconFolderPlus,
  IconX,
  IconFolder,
} from "@tabler/icons-react";
import { useProjectStore, MAX_PROJECTS, type ProjectType } from "../../store/project.store";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { cn } from "../../lib/utils";

/**
 * Props for the ProjectSetupPopup component.
 */
interface ProjectSetupPopupProps {
  /** Whether the modal is currently visible */
  open: boolean;
  /** Callback function to close the modal */
  onClose: () => void;
  /** Callback function called when a new project is submitted */
  onCreate: (name: string, type: ProjectType, description?: string) => void;
}

/**
 * A modal popup used to initialize a new project with a name and description.
 * Enforces project limits and provides loading states during creation.
 */
export default function ProjectSetupPopup({
  open,
  onClose,
  onCreate,
}: ProjectSetupPopupProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ProjectType>("design");
  const [loading, setLoading] = useState(false);
  const projects = useProjectStore((s) => s.projects);
  const isLimitReached = projects.length >= MAX_PROJECTS;

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isLimitReached) return;

    setLoading(true);
    setTimeout(() => {
      onCreate(name, type, description);
      setName("");
      setDescription("");
      setType("design");
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
              <h2 className="text-sm font-bold">Project Setup</h2>
              <p className="text-xs">Start by naming your architecture</p>
            </div>
          </div>
          <Button
            onClick={onClose}
            icon={IconX}
            variant="outline"
            size="icon-sm"
          />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              autoFocus
              startIcon={<IconFolder size={8} stroke={1.8} />}
              id="name"
              placeholder="e.g. Payments Engine"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Project Type</Label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg border border-border/50">
              <button
                type="button"
                onClick={() => setType("design")}
                className={cn(
                  "flex items-center justify-center gap-2 py-2 rounded-md text-xs font-semibold transition-all",
                  type === "design"
                    ? "bg-card text-foreground shadow-sm border border-border/50"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Architecture
              </button>
              <button
                type="button"
                onClick={() => setType("c4")}
                className={cn(
                  "flex items-center justify-center gap-2 py-2 rounded-md text-xs font-semibold transition-all",
                  type === "c4"
                    ? "bg-card text-foreground shadow-sm border border-border/50"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                C4 Model
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              rows={2}
              placeholder="System details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-2 mt-1">
            <Button
              icon={IconFolderPlus}
              iconSide="right"
              type="submit"
              disabled={!name.trim() || loading || isLimitReached}
              className={`w-full${
                isLimitReached
                  ? "bg-muted text-muted-foreground pointer-events-none"
                  : "bg-primary hover:bg-primary/90"
              }`}
              loading={loading}
            >
              {loading ? (
                <>Initialising...</>
              ) : isLimitReached ? (
                "Project Limit Reached"
              ) : (
                "Create Project"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

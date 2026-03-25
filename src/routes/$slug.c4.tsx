import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import DiagramCanvas from "../components/canvas/DiagramCanvas";
import { useProjectStore, setActiveProject } from "../store/project.store";
import { setDiagramMode } from "../store/canvas.store";
import Container from "#/components/ui/container";

export const Route = createFileRoute("/$slug/c4" as any)({
  component: C4Page,
});

function C4Page() {
  const { slug } = Route.useParams() as any;
  const projects = useProjectStore((s) => s.projects);
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const navigate = useNavigate();

  const project = projects.find((p) => p.slug === slug);

  useEffect(() => {
    if (project) {
      if (project.id !== activeProjectId) {
        setActiveProject(project.id);
      }
      setDiagramMode("c4");
    }
  }, [project, activeProjectId]);

  if (!project) {
    return (
      <Container>
        <div className="flex flex-col h-screen items-center justify-center bg-background p-4">
          <h1 className="text-xl font-bold mb-2 text-foreground">
            Project not found
          </h1>
          <button
            onClick={() => navigate({ to: "/projects" })}
            className="px-4 py-2 bg-primary text-white rounded-lg font-medium"
          >
            Browse Projects
          </button>
        </div>
      </Container>
    );
  }

  return (
    <div className="flex-1 flex h-full overflow-hidden">
      <Sidebar />
      <main className="flex-1 relative overflow-hidden z-10">
        <DiagramCanvas />
      </main>
    </div>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import DiagramCanvas from "../components/canvas/DiagramCanvas";
import {
  createProject,
  useProjectStore,
  setActiveProject,
} from "../store/project.store";
import ProjectSetupPopup from "../components/dashboard/ProjectSetupPopup";
import Container from "#/components/ui/container";

/**
 * Dynamic route for individual project canvases, identified by their slug.
 */
export const Route = createFileRoute("/$slug")({
  component: SlugPage,
});

/**
 * The main editor page for a specific project.
 * Synchronizes the active project state with the URL slug and renders the canvas.
 */
function SlugPage() {
  const { slug } = Route.useParams();
  const projects = useProjectStore((s) => s.projects);
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const navigate = useNavigate();

  const project = projects.find((p) => p.slug === slug);
  const [modalOpen, setModalOpen] = useState(false);

  // Sync active project state based on URL slug
  useEffect(() => {
    if (project && project.id !== activeProjectId) {
      setActiveProject(project.id);
    } else if (!project && projects.length > 0) {
      // If slug is invalid but we have projects, maybe redirect to home?
    }
  }, [project, activeProjectId, projects.length]);

  const handleCreateProject = (name: string, description?: string) => {
    const newProject = createProject(name, description);
    if (!newProject) return;
    setModalOpen(false);
    navigate({ to: "/$slug", params: { slug: newProject.slug } });
  };

  // If no project found for this slug, we can show the "Create" popup or redirect
  if (!project) {
    return (
      <Container>
        <div className="flex flex-col h-screen items-center justify-center bg-background p-4">
          <h1 className="text-xl font-bold mb-2 text-foreground">
            Project not found
          </h1>
          <p className="text-muted-foreground mb-6">
            The project you"re looking for doesn"t exist or has been moved.
          </p>
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

      <ProjectSetupPopup
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreateProject}
      />
    </div>
  );
}

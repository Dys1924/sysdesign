import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import Sidebar from '../components/sidebar/Sidebar'
import DiagramCanvas from '../components/canvas/DiagramCanvas'
import { createProject, useProjectStore } from '../store/project.store'
import ProjectSetupPopup from '../components/dashboard/ProjectSetupPopup'

/**
 * Root route for the application.
 */
export const Route = createFileRoute('/')({
  component: HomePage,
})

/**
 * The initial landing page component.
 * Handles automatic redirection to active projects and initial project setup.
 */
function HomePage() {
  const navigate = useNavigate()
  const projects = useProjectStore((s) => s.projects)
  const loading = useProjectStore((s) => s.loading)
  const activeProjectId = useProjectStore((s) => s.activeProjectId)
  const activeProject = projects.find(p => p.id === activeProjectId)
  const [modalOpen, setModalOpen] = useState(false)

  // Automatic redirect if a project is already active
  useEffect(() => {
    if (activeProject) {
      navigate({ to: '/$slug', params: { slug: activeProject.slug } })
    }
  }, [activeProject, navigate])

  const handleCreateProject = (name: string, description?: string) => {
    const newProject = createProject(name, description)
    if (!newProject) return
    setModalOpen(false)
    navigate({ to: '/$slug', params: { slug: newProject.slug } })
  }

  const hasProjects = projects.length > 0;

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium animate-pulse text-muted-foreground">Synthesizing your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="flex-1 relative overflow-hidden z-10">
        <DiagramCanvas />
      </main>
      
      <div className={`absolute inset-y-4 left-4 z-200 transition-all duration-300 pointer-events-none ${!hasProjects ? 'opacity-50 grayscale select-none' : ''}`}>
        <div className={`${hasProjects ? 'pointer-events-auto' : ''} h-full`}>
          <Sidebar />
        </div>
      </div>

      {!hasProjects && (
        <div className="absolute inset-0 z-500 bg-background/5" />
      )}

      <ProjectSetupPopup
        open={modalOpen || (!hasProjects && !modalOpen)}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreateProject}
      />
    </>
  )
}
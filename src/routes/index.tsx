import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ReactFlowProvider } from '@xyflow/react'
import { useState, useEffect } from 'react'
import Toolbar from '../components/toolbar/Toolbar'
import Sidebar from '../components/sidebar/Sidebar'
import DiagramCanvas from '../components/canvas/DiagramCanvas'
import { createProject, useProjectStore } from '../store/project.store'
import ProjectSetupPopup from '../components/dashboard/ProjectSetupPopup'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const navigate = useNavigate()
  const projects = useProjectStore((s) => s.projects)
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
    setModalOpen(false)
    navigate({ to: '/$slug', params: { slug: newProject.slug } })
  }

  const hasProjects = projects.length > 0;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Toolbar - Disabled if no projects */}
      <div className={`relative z-[100] w-full transition-all duration-300 ${!hasProjects ? 'pointer-events-none opacity-50 grayscale select-none' : 'pointer-events-auto'}`}>
        <Toolbar />
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Canvas area */}
        <main className="flex-1 relative overflow-hidden z-10">
          <ReactFlowProvider>
            <DiagramCanvas />
          </ReactFlowProvider>
        </main>
        
        {/* Sidebar - Disabled if no projects */}
        <div className={`absolute inset-y-4 left-4 z-[200] transition-all duration-300 pointer-events-none ${!hasProjects ? 'opacity-50 grayscale select-none' : ''}`}>
          <div className={`${hasProjects ? 'pointer-events-auto' : ''} h-full`}>
            <Sidebar />
          </div>
        </div>

        {/* Global Block Overlay if no projects (optional, but keep it clean) */}
        {!hasProjects && (
          <div className="absolute inset-0 z-[500] bg-background/5" />
        )}
      </div>

      <ProjectSetupPopup
        open={modalOpen || (!hasProjects && !modalOpen)}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreateProject}
      />
    </div>
  )
}
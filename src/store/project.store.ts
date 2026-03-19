import { Store } from '@tanstack/store'
import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

export interface Project {
  id: string
  slug: string
  name: string
  description?: string
  createdAt: number
  updatedAt: number
}

export interface ProjectState {
  projects: Project[]
  activeProjectId: string | null
}

const STORAGE_KEY = 'sysdesign-projects-v1'

const DEFAULT_PROJECT_STATE: ProjectState = {
  projects: [],
  activeProjectId: null,
}

function load(): Partial<ProjectState> {
  try {
    if (typeof window === 'undefined') return {}
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function save(s: ProjectState) {
  try {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch {}
}

const saved = load()

export const projectStore = new Store<ProjectState>({
  ...DEFAULT_PROJECT_STATE,
  ...saved,
})

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w-]+/g, '')  // Remove all non-word chars
    .replace(/--+/g, '-')     // Replace multiple - with single -
}

export function createProject(name: string, description?: string) {
  const newProject: Project = {
    id: uuidv4(),
    slug: slugify(name),
    name,
    description,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  projectStore.setState((s) => {
    const next = {
      ...s,
      projects: [newProject, ...s.projects],
      activeProjectId: newProject.id,
    }
    save(next)
    return next
  })
  
  return newProject
}

export function setActiveProject(id: string | null) {
  projectStore.setState((s) => {
    const next = { ...s, activeProjectId: id }
    save(next)
    return next
  })
}

export function deleteProject(id: string) {
  projectStore.setState((s) => {
    const next = {
      ...s,
      projects: s.projects.filter((p) => p.id !== id),
      activeProjectId: s.activeProjectId === id ? null : s.activeProjectId,
    }
    save(next)
    return next
  })
}

export function updateProject(id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>) {
  projectStore.setState((s) => {
    const projects = s.projects.map((p) => 
      p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
    )
    const next = { ...s, projects }
    save(next)
    return next
  })
}

export function useProjectStore<T>(selector: (state: ProjectState) => T): T {
  // Use server-safe initial state for hydration
  const [state, setState] = useState<T>(() => selector(DEFAULT_PROJECT_STATE))

  useEffect(() => {
    // Client-side initialization
    setState(selector(projectStore.state))
    const sub = projectStore.subscribe(() => {
      setState(selector(projectStore.state))
    })
    return () => sub.unsubscribe()
  }, [selector])

  return state
}

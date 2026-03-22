import { Store } from '@tanstack/store'
import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

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
  user: User | null
  session: Session | null
  loading: boolean
  migrating: boolean
}

const STORAGE_KEY = 'sysdesign-projects-v1'

export const MAX_PROJECTS = 5

const DEFAULT_PROJECT_STATE: ProjectState = {
  projects: [],
  activeProjectId: null,
  user: null,
  session: null,
  loading: true,
  migrating: false,
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
  if (projectStore.state.projects.length >= MAX_PROJECTS) {
    return null
  }

  const newProject: Project = {
    id: uuidv4(),
    slug: slugify(name),
    name,
    description,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  projectStore.setState((s: ProjectState) => {
    const next = {
      ...s,
      projects: [newProject, ...s.projects],
      activeProjectId: newProject.id,
    }
    
    if (!s.user) {
      save(next)
    } else {
      // Supabase insert
      supabase.from('projects').insert({
        id: newProject.id,
        user_id: s.user.id,
        name: newProject.name,
        slug: newProject.slug,
        description: newProject.description,
        created_at: new Date(newProject.createdAt).toISOString(),
        updated_at: new Date(newProject.updatedAt).toISOString()
      }).then(({ error }) => {
        if (error) console.error('Supabase create error:', error.message)
      })
    }
    
    return next
  })
  
  return newProject
}

export function setActiveProject(id: string | null) {
  projectStore.setState((s: ProjectState) => {
    const next = { ...s, activeProjectId: id }
    if (!s.user) save(next)
    return next
  })
}

export async function login() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  })
  if (error) console.error('Error logging in:', error.message)
}

export async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) console.error('Error logging out:', error.message)
  
  // Reset state to local projects
  const saved = load()
  projectStore.setState((s) => ({
    ...s,
    ...saved,
    user: null,
    session: null,
    loading: false
  }))
}

// Migrate local projects to Supabase
async function migrateLocalToSupabase(user: User, localProjects: Project[]) {
  if (localProjects.length === 0) return

  for (const p of localProjects) {
    // Load canvas data for this local project
    let canvasData = { nodes: [], edges: [], edgeCounter: 0 }
    try {
      const raw = localStorage.getItem(`sysdesign-diagram-${p.id}`) || localStorage.getItem('sysdesign-v2')
      if (raw) canvasData = JSON.parse(raw)
    } catch (e) {}

    const { error } = await supabase.from('projects').insert({
      id: p.id,
      user_id: user.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      nodes: canvasData.nodes,
      edges: canvasData.edges,
      edge_counter: canvasData.edgeCounter,
      created_at: new Date(p.createdAt).toISOString(),
      updated_at: new Date(Date.now()).toISOString()
    })

    if (error) {
      if (error.code === '23505') continue // Already exists
      console.error('Migration error for project:', p.name, error.message)
    } else {
      // Clear local storage for this project after successful migration (optional but clean)
      localStorage.removeItem(`sysdesign-diagram-${p.id}`)
    }
  }
  // Clear the local project list metadata as well
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ projects: [], activeProjectId: null }))
}

// Sync projects from Supabase
async function syncFromSupabase() {
  projectStore.setState((s: ProjectState) => ({ ...s, loading: true }))
  const user = projectStore.state.user
  const { data: projects, error } = await supabase
    .from('projects')
    .select('id, slug, name, description, created_at, updated_at')
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching Supabase projects:', error.message)
    return
  }

  const projectList = (projects || []).map(p => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    createdAt: new Date(p.created_at).getTime(),
    updatedAt: new Date(p.updated_at).getTime(),
  }))

  // Trigger migration if cloud is empty and we have local projects
  const local = load()
  if (projectList.length === 0 && local.projects && local.projects.length > 0 && user) {
    projectStore.setState((s: ProjectState) => ({ ...s, migrating: true }))
    await migrateLocalToSupabase(user, local.projects)
    
    // Re-sync after migration
    const { data: migratedProjects } = await supabase
      .from('projects')
      .select('id, slug, name, description, created_at, updated_at')
      .order('updated_at', { ascending: false })
    
    if (migratedProjects) {
      projectStore.setState((s: ProjectState) => ({
        ...s,
        projects: migratedProjects.map(p => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          description: p.description,
          createdAt: new Date(p.created_at).getTime(),
          updatedAt: new Date(p.updated_at).getTime(),
        })),
        loading: false,
        migrating: false
      }))
      return
    }
  }

  projectStore.setState((s: ProjectState) => ({
    ...s,
    projects: projectList,
    loading: false,
    migrating: false
  }))
}

// Initial session check
if (typeof window !== 'undefined') {
  supabase.auth.getSession().then(({ data: { session } }) => {
    projectStore.setState(s => ({
      ...s,
      session,
      user: session?.user ?? null,
      loading: !session // if no session, we're not loading anymore
    }))
    
    if (session) {
      syncFromSupabase()
    } else {
      projectStore.setState((s: ProjectState) => ({ ...s, loading: false }))
    }
  })

  supabase.auth.onAuthStateChange((_event, session) => {
    projectStore.setState((s: ProjectState) => ({
      ...s,
      session,
      user: session?.user ?? null,
      loading: !!session, // Stay in loading state if we're about to sync
      activeProjectId: null
    }))
    if (session) {
      syncFromSupabase()
    } else {
      const local = load()
      projectStore.setState((s: ProjectState) => ({ ...s, ...local, loading: false }))
    }
  })
}

export function deleteProject(id: string) {
  projectStore.setState((s) => {
    const next = {
      ...s,
      projects: s.projects.filter((p) => p.id !== id),
      activeProjectId: s.activeProjectId === id ? null : s.activeProjectId,
    }
    
    if (!s.user) {
      save(next)
    } else {
      // Supabase handle delete
      supabase.from('projects').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase delete error:', error)
      })
    }
    
    return next
  })
}

export function updateProject(id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>) {
  projectStore.setState((s: ProjectState) => {
    const projects = s.projects.map((p) => 
      p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
    )
    const next = { ...s, projects }
    
    if (!s.user) {
      save(next)
    } else {
      const updated = projects.find(p => p.id === id)
      if (updated) {
        supabase.from('projects').update({
          name: updated.name,
          slug: updated.slug,
          description: updated.description,
          updated_at: new Date(updated.updatedAt).toISOString()
        }).eq('id', id).then(({ error }) => {
          if (error) console.error('Supabase update error:', error.message)
        })
      }
    }
    
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

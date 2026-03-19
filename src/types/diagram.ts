import type { Node, Edge } from '@xyflow/react'

export type NodeCategory = 'microservice' | 'cloud' | 'database' | 'frontend'

export interface NodeMeta extends Record<string, unknown> {
  label: string
  category: NodeCategory
  subtype: string
  icon: string
  description: string
  status?: string // e.g. "planned", "existing", "deprecated"
  owner?: string
  notes?: string
}

export type DiagramNode = Node<NodeMeta>
export type DiagramEdge = Edge

export interface NodeTemplate {
  subtype: string
  label: string
  category: NodeCategory
  icon: string
  description: string
}

export const NODE_TEMPLATES: Record<NodeCategory, NodeTemplate[]> = {
  microservice: [
    { subtype: 'api-gateway',    label: 'API Gateway',    category: 'microservice', icon: 'IconApi',          description: 'Entry point for API traffic' },
    { subtype: 'service',        label: 'Service',        category: 'microservice', icon: 'IconBox',          description: 'Generic microservice' },
    { subtype: 'message-queue',  label: 'Message Queue',  category: 'microservice', icon: 'IconStack2',       description: 'Async message broker' },
    { subtype: 'load-balancer',  label: 'Load Balancer',  category: 'microservice', icon: 'IconArrowsSplit2', description: 'Traffic distribution' },
  ],
  cloud: [
    { subtype: 'ec2',    label: 'Compute (EC2)',  category: 'cloud', icon: 'IconServer',    description: 'Virtual machine instance' },
    { subtype: 's3',     label: 'Object Storage', category: 'cloud', icon: 'IconBucket',    description: 'S3 / GCS bucket' },
    { subtype: 'cdn',    label: 'CDN',            category: 'cloud', icon: 'IconWorld',     description: 'Content delivery network' },
    { subtype: 'lambda', label: 'Serverless Fn',  category: 'cloud', icon: 'IconBolt',      description: 'Lambda / Cloud Function' },
  ],
  database: [
    { subtype: 'postgres',      label: 'PostgreSQL',    category: 'database', icon: 'IconDatabase',  description: 'Relational database' },
    { subtype: 'redis',         label: 'Redis',         category: 'database', icon: 'IconCpu',       description: 'In-memory cache / store' },
    { subtype: 'mongo',         label: 'MongoDB',       category: 'database', icon: 'IconLeaf',      description: 'Document database' },
    { subtype: 'elasticsearch', label: 'Elasticsearch', category: 'database', icon: 'IconZoomCode',  description: 'Search & analytics engine' },
  ],
  frontend: [
    { subtype: 'web-app',   label: 'Web App',   category: 'frontend', icon: 'IconBrowser',   description: 'Browser-based client' },
    { subtype: 'mobile',    label: 'Mobile App',category: 'frontend', icon: 'IconDeviceMobile', description: 'iOS / Android client' },
    { subtype: 'component', label: 'Component', category: 'frontend', icon: 'IconLayoutGrid', description: 'UI component' },
    { subtype: 'bff',       label: 'BFF',       category: 'frontend', icon: 'IconPlugConnected', description: 'Backend for frontend' },
  ],
}

export interface CategoryStyle {
  label: string
  color: string
  bg: string
  border: string
  text: string
  pill: string
}

export const CATEGORY_STYLE: Record<NodeCategory, CategoryStyle> = {
  microservice: { label: 'Microservices', color: '#185FA5', bg: '#EBF3FC', border: '#B5D4F4', text: '#0C447C', pill: '#DAEAF9' },
  cloud:        { label: 'Cloud Infra',   color: '#3B6D11', bg: '#EDF5E2', border: '#C0DD97', text: '#27500A', pill: '#DFF0C5' },
  database:     { label: 'Databases',     color: '#854F0B', bg: '#FDF0DC', border: '#FAC775', text: '#633806', pill: '#FAE4B0' },
  frontend:     { label: 'Frontend',      color: '#993556', bg: '#FCE9F1', border: '#F4C0D1', text: '#72243E', pill: '#F8D4E3' },
}

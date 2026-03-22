import type { DiagramNode, DiagramEdge } from "../types/diagram";
import { NETFLIX_TEMPLATE } from "./templates/netflix";
import { YOUTUBE_TEMPLATE } from "./templates/youtube";
import { WHATSAPP_TEMPLATE } from "./templates/whatsapp";

export interface Template {
  id: string;
  name: string;
  description: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

export const TEMPLATES: Template[] = [
  NETFLIX_TEMPLATE,
  YOUTUBE_TEMPLATE,
  WHATSAPP_TEMPLATE,
];

export { NETFLIX_TEMPLATE, YOUTUBE_TEMPLATE, WHATSAPP_TEMPLATE };

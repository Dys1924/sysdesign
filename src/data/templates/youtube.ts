import type { DiagramNode, DiagramEdge } from "../../types/diagram";

// ─── Layout constants ──────────────────────────────────────────────────────
const NODE_W = 170;
const NODE_H = 80;
const PAD_X = 40;
const PAD_Y = 50;
const PAD_B = 40;
const ROW_GAP = 20;
const COL_GAP = 220;

function groupH(rows: number) {
  return PAD_Y + rows * NODE_H + (rows - 1) * ROW_GAP + PAD_B;
}
function groupW(cols: number) {
  return PAD_X + cols * NODE_W + (cols - 1) * 24 + PAD_X;
}
function groupStyle(color: string, bg: string) {
  return {
    backgroundColor: bg,
    border: `1.5px dashed ${color}`,
    borderRadius: 16,
  };
}

// ─── Column X positions ────────────────────────────────────────────────────
const G_CLIENTS_X = 0;
const G_CLIENTS_W = groupW(1);

const N_LB_X = G_CLIENTS_W + COL_GAP;
const N_APIGW_X = N_LB_X;

const G_CORE_X = N_LB_X + NODE_W + COL_GAP;
const G_CORE_W = groupW(1);

const G_DATA_X = G_CORE_X + G_CORE_W + COL_GAP;
const G_DATA_W = groupW(1);

const G_UPLOAD_X = G_CLIENTS_W + COL_GAP;
const G_UPLOAD_W = groupW(2);

const G_CDN_X = G_CLIENTS_X;

// ─── Row Y positions ──────────────────────────────────────────────────────
const ROW1_Y = 0;
const ROW2_Y = ROW1_Y + groupH(5) + 180;

export const YOUTUBE_TEMPLATE: {
  id: string;
  name: string;
  description: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
} = {
  id: "youtube-architecture",
  name: "YouTube Architecture",
  description:
    "Video upload, transcoding, and delivery at 500 hours of video per minute — GCS, Bigtable, Spanner, and Google CDN.",

  nodes: [
    // ── GROUP: Clients ────────────────────────────────────────────────────
    {
      id: "g-clients",
      type: "group",
      position: { x: G_CLIENTS_X, y: ROW1_Y },
      style: {
        width: G_CLIENTS_W,
        height: groupH(4),
        ...groupStyle("#993556", "rgba(153,53,86,0.04)"),
      },
      data: {
        label: "Client Applications",
        category: "frontend",
        subtype: "component",
        icon: "IconDevices",
        description: "",
      },
    },
    {
      id: "n-browser",
      type: "diagram",
      parentId: "g-clients",
      extent: "parent",
      position: { x: PAD_X, y: PAD_Y },
      data: {
        label: "Web Browser",
        category: "frontend",
        subtype: "fe-webapp",
        icon: "IconBrowser",
        description: "youtube.com main experience",
      },
    },
    {
      id: "n-android",
      type: "diagram",
      parentId: "g-clients",
      extent: "parent",
      position: { x: PAD_X, y: PAD_Y + NODE_H + ROW_GAP },
      data: {
        label: "Android App",
        category: "frontend",
        subtype: "fe-mobile-android",
        icon: "IconBrandAndroid",
        description: "Native Android YouTube client",
      },
    },
    {
      id: "n-ios",
      type: "diagram",
      parentId: "g-clients",
      extent: "parent",
      position: { x: PAD_X, y: PAD_Y + (NODE_H + ROW_GAP) * 2 },
      data: {
        label: "iOS App",
        category: "frontend",
        subtype: "fe-mobile-ios",
        icon: "IconBrandApple",
        description: "Native iOS YouTube client",
      },
    },
    {
      id: "n-tv",
      type: "diagram",
      parentId: "g-clients",
      extent: "parent",
      position: { x: PAD_X, y: PAD_Y + (NODE_H + ROW_GAP) * 3 },
      data: {
        label: "Smart TV",
        category: "frontend",
        subtype: "fe-tv",
        icon: "IconDeviceTv",
        description: "YouTube on living room devices",
      },
    },

    // ── Standalone: Load Balancer + API Gateway ───────────────────────────
    {
      id: "n-lb",
      type: "diagram",
      position: { x: N_LB_X, y: ROW1_Y + groupH(5) / 2 - NODE_H - ROW_GAP },
      data: {
        label: "Cloud Load Balancing",
        category: "cloud",
        subtype: "gcp-load-balancing",
        icon: "IconArrowsSplit2",
        description: "Global anycast load balancing",
      },
    },
    {
      id: "n-apigw",
      type: "diagram",
      position: { x: N_APIGW_X, y: ROW1_Y + groupH(5) / 2 + ROW_GAP },
      data: {
        label: "API Gateway",
        category: "microservice",
        subtype: "ms-api-gateway",
        icon: "IconApi",
        description: "Routes, auth, rate limiting",
      },
    },

    // ── GROUP: Core Services ──────────────────────────────────────────────
    {
      id: "g-core",
      type: "group",
      position: { x: G_CORE_X, y: ROW1_Y },
      style: {
        width: G_CORE_W,
        height: groupH(5),
        ...groupStyle("#185FA5", "rgba(24,95,165,0.04)"),
      },
      data: {
        label: "Core Services",
        category: "microservice",
        subtype: "component",
        icon: "IconBox",
        description: "",
      },
    },
    {
      id: "n-video-svc",
      type: "diagram",
      parentId: "g-core",
      extent: "parent",
      position: { x: PAD_X, y: PAD_Y },
      data: {
        label: "Video Service",
        category: "microservice",
        subtype: "ms-service",
        icon: "IconPlayerPlay",
        description: "Stream URL resolution & metadata",
      },
    },
    {
      id: "n-search",
      type: "diagram",
      parentId: "g-core",
      extent: "parent",
      position: { x: PAD_X, y: PAD_Y + NODE_H + ROW_GAP },
      data: {
        label: "Search Service",
        category: "microservice",
        subtype: "ms-service",
        icon: "IconSearch",
        description: "Video, channel, playlist search",
      },
    },
    {
      id: "n-recommend",
      type: "diagram",
      parentId: "g-core",
      extent: "parent",
      position: { x: PAD_X, y: PAD_Y + (NODE_H + ROW_GAP) * 2 },
      data: {
        label: "Recommendation Engine",
        category: "microservice",
        subtype: "ms-service",
        icon: "IconBrain",
        description: "ML-based content ranking",
      },
    },
    {
      id: "n-comment",
      type: "diagram",
      parentId: "g-core",
      extent: "parent",
      position: { x: PAD_X, y: PAD_Y + (NODE_H + ROW_GAP) * 3 },
      data: {
        label: "Comment Service",
        category: "microservice",
        subtype: "ms-service",
        icon: "IconMessage",
        description: "Comments, likes, community posts",
      },
    },
    {
      id: "n-analytics",
      type: "diagram",
      parentId: "g-core",
      extent: "parent",
      position: { x: PAD_X, y: PAD_Y + (NODE_H + ROW_GAP) * 4 },
      data: {
        label: "Analytics Service",
        category: "microservice",
        subtype: "ms-service",
        icon: "IconChartBar",
        description: "Views, watch time, ad metrics",
      },
    },

    // ── GROUP: Data Layer ─────────────────────────────────────────────────
    {
      id: "g-data",
      type: "group",
      position: { x: G_DATA_X, y: ROW1_Y },
      style: {
        width: G_DATA_W,
        height: groupH(5),
        ...groupStyle("#854F0B", "rgba(133,79,11,0.04)"),
      },
      data: {
        label: "Data Layer",
        category: "database",
        subtype: "component",
        icon: "IconDatabase",
        description: "",
      },
    },
    {
      id: "n-bigtable",
      type: "diagram",
      parentId: "g-data",
      extent: "parent",
      position: { x: PAD_X, y: PAD_Y },
      data: {
        label: "Cloud Bigtable",
        category: "cloud",
        subtype: "gcp-bigtable",
        icon: "IconDatabase",
        description: "Video metadata at massive scale",
      },
    },
    {
      id: "n-spanner",
      type: "diagram",
      parentId: "g-data",
      extent: "parent",
      position: { x: PAD_X, y: PAD_Y + NODE_H + ROW_GAP },
      data: {
        label: "Cloud Spanner",
        category: "cloud",
        subtype: "gcp-cloud-spanner",
        icon: "IconDatabase",
        description: "Globally consistent relational DB",
      },
    },
    {
      id: "n-elastic",
      type: "diagram",
      parentId: "g-data",
      extent: "parent",
      position: { x: PAD_X, y: PAD_Y + (NODE_H + ROW_GAP) * 2 },
      data: {
        label: "Elasticsearch",
        category: "database",
        subtype: "db-elasticsearch",
        icon: "IconSearch",
        description: "Full-text video & channel search",
      },
    },
    {
      id: "n-redis",
      type: "diagram",
      parentId: "g-data",
      extent: "parent",
      position: { x: PAD_X, y: PAD_Y + (NODE_H + ROW_GAP) * 3 },
      data: {
        label: "Memorystore (Redis)",
        category: "cloud",
        subtype: "gcp-memorystore",
        icon: "IconCpu",
        description: "Hot video cache & session store",
      },
    },
    {
      id: "n-bigquery",
      type: "diagram",
      parentId: "g-data",
      extent: "parent",
      position: { x: PAD_X, y: PAD_Y + (NODE_H + ROW_GAP) * 4 },
      data: {
        label: "BigQuery",
        category: "cloud",
        subtype: "gcp-bigquery",
        icon: "IconDatabaseExport",
        description: "Analytics warehouse for ads & insights",
      },
    },

    // ── GROUP: Upload & Transcoding Pipeline (bottom) ─────────────────────
    {
      id: "g-upload",
      type: "group",
      position: { x: G_UPLOAD_X, y: ROW2_Y },
      style: {
        width: G_UPLOAD_W,
        height: groupH(1),
        ...groupStyle("#3B6D11", "rgba(59,109,17,0.04)"),
      },
      data: {
        label: "Upload & Transcoding Pipeline",
        category: "cloud",
        subtype: "component",
        icon: "IconVideo",
        description: "",
      },
    },
    {
      id: "n-gcs-raw",
      type: "diagram",
      parentId: "g-upload",
      extent: "parent",
      position: { x: PAD_X, y: PAD_Y },
      data: {
        label: "GCS (Raw Upload)",
        category: "cloud",
        subtype: "gcp-storage",
        icon: "IconBucket",
        description: "Raw video ingest from creators",
      },
    },
    {
      id: "n-transcode",
      type: "diagram",
      parentId: "g-upload",
      extent: "parent",
      position: { x: PAD_X + NODE_W + 24, y: PAD_Y },
      data: {
        label: "Transcoder (Dataflow)",
        category: "cloud",
        subtype: "gcp-dataflow",
        icon: "IconStack2",
        description: "Encode to 360p → 8K + HDR + AV1",
      },
    },

    // ── Standalone: GCS Encoded + CDN ─────────────────────────────────────
    {
      id: "n-gcs-out",
      type: "diagram",
      position: { x: G_DATA_X, y: ROW2_Y + groupH(1) / 2 - NODE_H / 2 },
      data: {
        label: "GCS (Encoded)",
        category: "cloud",
        subtype: "gcp-storage",
        icon: "IconBucket",
        description: "Transcoded segments per bitrate",
      },
    },
    {
      id: "n-cdn",
      type: "diagram",
      position: { x: G_CDN_X, y: ROW2_Y + groupH(1) / 2 - NODE_H / 2 },
      data: {
        label: "Google CDN / Edge PoPs",
        category: "cloud",
        subtype: "gcp-cloud-cdn",
        icon: "IconWorld",
        description: "Adaptive bitrate delivery globally",
      },
    },

    // ── Standalone: Pub/Sub Event Bus ─────────────────────────────────────
    {
      id: "n-pubsub",
      type: "diagram",
      position: { x: G_CORE_X, y: ROW2_Y - NODE_H - 80 },
      data: {
        label: "Pub/Sub",
        category: "cloud",
        subtype: "gcp-pubsub",
        icon: "IconActivity",
        description: "Async events between all services",
      },
    },

    // ── Standalone: Vertex AI ─────────────────────────────────────────────
    {
      id: "n-vertex",
      type: "diagram",
      position: { x: G_DATA_X, y: ROW2_Y - NODE_H - 80 },
      data: {
        label: "Vertex AI",
        category: "cloud",
        subtype: "gcp-vertex-ai",
        icon: "IconBrain",
        description: "Trains recommendation & ad models",
      },
    },
  ] as unknown as DiagramNode[],

  edges: [
    // Clients → LB
    {
      id: "e-bro-lb",
      source: "n-browser",
      target: "n-lb",
      type: "smoothstep",
      animated: true,
      data: { label: "HTTPS" },
    },
    {
      id: "e-and-lb",
      source: "n-android",
      target: "n-lb",
      type: "smoothstep",
      animated: true,
    },
    {
      id: "e-ios-lb",
      source: "n-ios",
      target: "n-lb",
      type: "smoothstep",
      animated: true,
    },
    {
      id: "e-tv-lb",
      source: "n-tv",
      target: "n-lb",
      type: "smoothstep",
      animated: true,
    },

    // LB → API GW → Core
    { id: "e-lb-gw", source: "n-lb", target: "n-apigw", type: "smoothstep" },
    {
      id: "e-gw-vid",
      source: "n-apigw",
      target: "n-video-svc",
      type: "smoothstep",
    },
    {
      id: "e-gw-srch",
      source: "n-apigw",
      target: "n-search",
      type: "smoothstep",
    },
    {
      id: "e-gw-rec",
      source: "n-apigw",
      target: "n-recommend",
      type: "smoothstep",
    },
    {
      id: "e-gw-cmt",
      source: "n-apigw",
      target: "n-comment",
      type: "smoothstep",
    },

    // Core → Data
    {
      id: "e-vid-bt",
      source: "n-video-svc",
      target: "n-bigtable",
      type: "smoothstep",
    },
    {
      id: "e-vid-red",
      source: "n-video-svc",
      target: "n-redis",
      type: "smoothstep",
    },
    {
      id: "e-srch-el",
      source: "n-search",
      target: "n-elastic",
      type: "smoothstep",
    },
    {
      id: "e-rec-span",
      source: "n-recommend",
      target: "n-spanner",
      type: "smoothstep",
    },
    {
      id: "e-cmt-span",
      source: "n-comment",
      target: "n-spanner",
      type: "smoothstep",
    },
    {
      id: "e-ana-bq",
      source: "n-analytics",
      target: "n-bigquery",
      type: "smoothstep",
    },

    // Pub/Sub
    {
      id: "e-vid-pub",
      source: "n-video-svc",
      target: "n-pubsub",
      type: "smoothstep",
      data: { label: "events" },
    },
    {
      id: "e-pub-ana",
      source: "n-pubsub",
      target: "n-analytics",
      type: "smoothstep",
    },
    {
      id: "e-pub-vtx",
      source: "n-pubsub",
      target: "n-vertex",
      type: "smoothstep",
    },

    // Vertex AI → Recommendation
    {
      id: "e-vtx-rec",
      source: "n-vertex",
      target: "n-recommend",
      type: "smoothstep",
      data: { label: "model updates" },
    },

    // Upload pipeline
    {
      id: "e-gw-gcs",
      source: "n-apigw",
      target: "n-gcs-raw",
      type: "smoothstep",
      data: { label: "upload" },
    },
    {
      id: "e-raw-enc",
      source: "n-gcs-raw",
      target: "n-transcode",
      type: "smoothstep",
      animated: true,
    },
    {
      id: "e-enc-out",
      source: "n-transcode",
      target: "n-gcs-out",
      type: "smoothstep",
      animated: true,
    },

    // GCS → CDN → Clients
    {
      id: "e-out-cdn",
      source: "n-gcs-out",
      target: "n-cdn",
      type: "smoothstep",
      data: { label: "push segments" },
    },
    {
      id: "e-cdn-bro",
      source: "n-cdn",
      target: "n-browser",
      type: "smoothstep",
      animated: true,
      data: { label: "ABR stream" },
    },
    {
      id: "e-cdn-and",
      source: "n-cdn",
      target: "n-android",
      type: "smoothstep",
      animated: true,
    },
    {
      id: "e-cdn-ios",
      source: "n-cdn",
      target: "n-ios",
      type: "smoothstep",
      animated: true,
    },
    {
      id: "e-cdn-tv",
      source: "n-cdn",
      target: "n-tv",
      type: "smoothstep",
      animated: true,
    },

    // Video service → CDN (playback URL)
    {
      id: "e-vid-cdn",
      source: "n-video-svc",
      target: "n-cdn",
      type: "smoothstep",
      data: { label: "signed URL" },
    },
  ] as DiagramEdge[],
};

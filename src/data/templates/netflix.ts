import type { DiagramNode, DiagramEdge } from "../../types/diagram";

// ─── Layout constants ──────────────────────────────────────────────────────
// Node: 170w × 80h  |  Group padding: 40px sides, 50px top, 40px bottom
// Column gap: 220px |  Row gap: 24px inside groups

const NODE_W = 170;
const NODE_H = 80;
const PAD_X = 40;
const PAD_Y = 50; // top (room for group label)
const PAD_B = 40;
const ROW_GAP = 20;
const COL_GAP = 220;

// ─── Group sizing helpers ──────────────────────────────────────────────────
function groupH(rows: number) {
  return PAD_Y + rows * NODE_H + (rows - 1) * ROW_GAP + PAD_B;
}
function groupW(cols: number) {
  return PAD_X + cols * NODE_W + (cols - 1) * 24 + PAD_X;
}

// ─── Column X positions ────────────────────────────────────────────────────
// Col 0: Clients  Col 1: Gateway  Col 2: Core Services  Col 3: Data  Col 4: Encoding
const G_CLIENTS_X = 0;
const G_CLIENTS_W = groupW(1);

const NODE_ZUUL_X = G_CLIENTS_W + COL_GAP;
const NODE_EUREKA_X = NODE_ZUUL_X;

const G_CORE_X = NODE_ZUUL_X + NODE_W + COL_GAP;
const G_CORE_W = groupW(1);

const G_DATA_X = G_CORE_X + G_CORE_W + COL_GAP;
const G_DATA_W = groupW(1);

const G_ENCODE_X = G_CORE_X;
const G_CDN_X = G_CLIENTS_X;

// ─── Row Y positions ──────────────────────────────────────────────────────
const ROW1_Y = 0; // Clients group top
const ROW2_Y = ROW1_Y + groupH(3) + 200; // Encoding pipeline below
const CDN_Y = ROW2_Y; // CDN sits at same level as encoding, left side

// ─── Shared group style builder ───────────────────────────────────────────
function groupStyle(color: string, bg: string): React.CSSProperties {
  return {
    backgroundColor: bg,
    border: `1.5px dashed ${color}`,
    borderRadius: 16,
  };
}

export const NETFLIX_TEMPLATE: {
  id: string;
  name: string;
  description: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
} = {
  id: "netflix-architecture",
  name: "Netflix Architecture",
  description:
    "Video streaming at global scale — Zuul gateway, Eureka discovery, Open Connect CDN, and the encoding pipeline.",

  nodes: [
    // ── GROUP: Client Applications ────────────────────────────────────────
    {
      id: "g-clients",
      type: "group",
      position: { x: G_CLIENTS_X, y: ROW1_Y },
      style: {
        width: groupW(1),
        height: groupH(3),
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
      id: "n-web",
      type: "diagram",
      parentId: "g-clients",
      extent: "parent",
      position: { x: PAD_X, y: PAD_Y },
      data: {
        label: "Web App (React)",
        category: "frontend",
        subtype: "fe-spa",
        icon: "IconBrowser",
        description: "Primary browser experience",
      },
    },
    {
      id: "n-mobile",
      type: "diagram",
      parentId: "g-clients",
      extent: "parent",
      position: { x: PAD_X, y: PAD_Y + NODE_H + ROW_GAP },
      data: {
        label: "Mobile App",
        category: "frontend",
        subtype: "fe-mobile-cross",
        icon: "IconDeviceMobile",
        description: "iOS & Android (React Native)",
      },
    },
    {
      id: "n-tv",
      type: "diagram",
      parentId: "g-clients",
      extent: "parent",
      position: { x: PAD_X, y: PAD_Y + (NODE_H + ROW_GAP) * 2 },
      data: {
        label: "Smart TV App",
        category: "frontend",
        subtype: "fe-tv",
        icon: "IconDeviceTv",
        description: "Living room streaming",
      },
    },

    // ── Standalone: Zuul API Gateway ──────────────────────────────────────
    {
      id: "n-zuul",
      type: "diagram",
      position: {
        x: NODE_ZUUL_X,
        y: ROW1_Y + groupH(3) / 2 - NODE_H - ROW_GAP / 2,
      },
      data: {
        label: "Zuul Gateway",
        category: "microservice",
        subtype: "ms-api-gateway",
        icon: "IconApi",
        description: "Dynamic routing, auth, rate limiting",
      },
    },

    // ── Standalone: Eureka Service Discovery ──────────────────────────────
    {
      id: "n-eureka",
      type: "diagram",
      position: { x: NODE_EUREKA_X, y: ROW1_Y + groupH(3) / 2 + ROW_GAP / 2 },
      data: {
        label: "Eureka Discovery",
        category: "microservice",
        subtype: "ms-discovery",
        icon: "IconCompass",
        description: "Service registry for all nodes",
      },
    },

    // ── GROUP: Core Services ──────────────────────────────────────────────
    {
      id: "g-core",
      type: "group",
      position: { x: G_CORE_X, y: ROW1_Y },
      style: {
        width: G_CORE_W,
        height: groupH(4),
        ...groupStyle("#185FA5", "rgba(24,95,165,0.04)"),
      },
      data: {
        label: "Core Microservices",
        category: "microservice",
        subtype: "component",
        icon: "IconBox",
        description: "",
      },
    },
    {
      id: "n-catalog",
      type: "diagram",
      parentId: "g-core",
      extent: "parent",
      position: { x: PAD_X, y: PAD_Y },
      data: {
        label: "Catalog Service",
        category: "microservice",
        subtype: "ms-service",
        icon: "IconMovie",
        description: "Content metadata & recommendations",
      },
    },
    {
      id: "n-user",
      type: "diagram",
      parentId: "g-core",
      extent: "parent",
      position: { x: PAD_X, y: PAD_Y + NODE_H + ROW_GAP },
      data: {
        label: "User Service",
        category: "microservice",
        subtype: "ms-service",
        icon: "IconUser",
        description: "Profiles, preferences, history",
      },
    },
    {
      id: "n-billing",
      type: "diagram",
      parentId: "g-core",
      extent: "parent",
      position: { x: PAD_X, y: PAD_Y + (NODE_H + ROW_GAP) * 2 },
      data: {
        label: "Billing Service",
        category: "microservice",
        subtype: "ms-service",
        icon: "IconCreditCard",
        description: "Subscription and payment processing",
      },
    },
    {
      id: "n-playback",
      type: "diagram",
      parentId: "g-core",
      extent: "parent",
      position: { x: PAD_X, y: PAD_Y + (NODE_H + ROW_GAP) * 3 },
      data: {
        label: "Playback Service",
        category: "microservice",
        subtype: "ms-service",
        icon: "IconPlayerPlay",
        description: "DRM, stream URL generation",
      },
    },

    // ── GROUP: Data Layer ─────────────────────────────────────────────────
    {
      id: "g-data",
      type: "group",
      position: { x: G_DATA_X, y: ROW1_Y },
      style: {
        width: G_DATA_W,
        height: groupH(4),
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
      id: "n-cassandra",
      type: "diagram",
      parentId: "g-data",
      extent: "parent",
      position: { x: PAD_X, y: PAD_Y },
      data: {
        label: "Cassandra",
        category: "database",
        subtype: "db-cassandra",
        icon: "IconStack",
        description: "User activity & viewing history",
      },
    },
    {
      id: "n-mysql",
      type: "diagram",
      parentId: "g-data",
      extent: "parent",
      position: { x: PAD_X, y: PAD_Y + NODE_H + ROW_GAP },
      data: {
        label: "MySQL (RDS)",
        category: "database",
        subtype: "db-mysql",
        icon: "IconDatabase",
        description: "Billing and subscription records",
      },
    },
    {
      id: "n-redis",
      type: "diagram",
      parentId: "g-data",
      extent: "parent",
      position: { x: PAD_X, y: PAD_Y + (NODE_H + ROW_GAP) * 2 },
      data: {
        label: "Redis Cache",
        category: "database",
        subtype: "db-redis",
        icon: "IconCpu",
        description: "Session cache & rate limiting",
      },
    },
    {
      id: "n-elastic",
      type: "diagram",
      parentId: "g-data",
      extent: "parent",
      position: { x: PAD_X, y: PAD_Y + (NODE_H + ROW_GAP) * 3 },
      data: {
        label: "Elasticsearch",
        category: "database",
        subtype: "db-elasticsearch",
        icon: "IconSearch",
        description: "Content search & discovery",
      },
    },

    // ── GROUP: Encoding Pipeline (bottom row) ─────────────────────────────
    {
      id: "g-encode",
      type: "group",
      position: { x: G_ENCODE_X, y: ROW2_Y },
      style: {
        width: groupW(3),
        height: groupH(1),
        ...groupStyle("#3B6D11", "rgba(59,109,17,0.04)"),
      },
      data: {
        label: "Video Encoding Pipeline",
        category: "cloud",
        subtype: "component",
        icon: "IconVideo",
        description: "",
      },
    },
    {
      id: "n-s3-raw",
      type: "diagram",
      parentId: "g-encode",
      extent: "parent",
      position: { x: PAD_X, y: PAD_Y },
      data: {
        label: "S3 (Raw Upload)",
        category: "cloud",
        subtype: "aws-s3",
        icon: "IconBucket",
        description: "Ingest raw studio content",
      },
    },
    {
      id: "n-encoder",
      type: "diagram",
      parentId: "g-encode",
      extent: "parent",
      position: { x: PAD_X + NODE_W + 24, y: PAD_Y },
      data: {
        label: "Encoding Workers",
        category: "cloud",
        subtype: "aws-batch",
        icon: "IconStack2",
        description: "Transcode to 1080p, 4K, HDR",
      },
    },
    {
      id: "n-s3-out",
      type: "diagram",
      parentId: "g-encode",
      extent: "parent",
      position: { x: PAD_X + (NODE_W + 24) * 2, y: PAD_Y },
      data: {
        label: "S3 (Encoded)",
        category: "cloud",
        subtype: "aws-s3",
        icon: "IconBucket",
        description: "Transcoded video assets per bitrate",
      },
    },

    // ── Standalone: Open Connect CDN ──────────────────────────────────────
    {
      id: "n-cdn",
      type: "diagram",
      position: { x: G_CDN_X, y: CDN_Y + groupH(1) / 2 - NODE_H / 2 },
      data: {
        label: "Open Connect (CDN)",
        category: "cloud",
        subtype: "aws-cloudfront",
        icon: "IconWorld",
        description: "Netflix's global ISP-embedded cache",
      },
    },

    // ── Standalone: Kafka Event Bus ───────────────────────────────────────
    {
      id: "n-kafka",
      type: "diagram",
      position: { x: G_CORE_X, y: ROW2_Y - NODE_H - 80 },
      data: {
        label: "Kafka Event Bus",
        category: "database",
        subtype: "db-kafka",
        icon: "IconChartLine",
        description: "Async events between all services",
      },
    },

    // ── Standalone: Observability ─────────────────────────────────────────
    {
      id: "n-atlas",
      type: "diagram",
      position: { x: G_DATA_X, y: ROW2_Y - NODE_H - 80 },
      data: {
        label: "Atlas (Metrics)",
        category: "microservice",
        subtype: "obs-metrics",
        icon: "IconChartHistogram",
        description: "Netflix's in-house metrics platform",
      },
    },
  ] as unknown as DiagramNode[],

  edges: [
    // Clients → Zuul
    {
      id: "e-web-zuul",
      source: "n-web",
      target: "n-zuul",
      type: "smoothstep",
      animated: true,
      data: { label: "HTTPS" },
    },
    {
      id: "e-mob-zuul",
      source: "n-mobile",
      target: "n-zuul",
      type: "smoothstep",
      animated: true,
    },
    {
      id: "e-tv-zuul",
      source: "n-tv",
      target: "n-zuul",
      type: "smoothstep",
      animated: true,
    },

    // Zuul → Core Services
    {
      id: "e-zuul-cat",
      source: "n-zuul",
      target: "n-catalog",
      type: "smoothstep",
    },
    {
      id: "e-zuul-usr",
      source: "n-zuul",
      target: "n-user",
      type: "smoothstep",
    },
    {
      id: "e-zuul-bill",
      source: "n-zuul",
      target: "n-billing",
      type: "smoothstep",
    },
    {
      id: "e-zuul-play",
      source: "n-zuul",
      target: "n-playback",
      type: "smoothstep",
    },

    // Eureka ↔ Zuul (discovery)
    {
      id: "e-eureka-zuul",
      source: "n-eureka",
      target: "n-zuul",
      type: "smoothstep",
      data: { label: "register" },
    },

    // Core → Data
    {
      id: "e-cat-cass",
      source: "n-catalog",
      target: "n-cassandra",
      type: "smoothstep",
    },
    {
      id: "e-usr-cass",
      source: "n-user",
      target: "n-cassandra",
      type: "smoothstep",
    },
    {
      id: "e-bill-mysql",
      source: "n-billing",
      target: "n-mysql",
      type: "smoothstep",
    },
    {
      id: "e-cat-redis",
      source: "n-catalog",
      target: "n-redis",
      type: "smoothstep",
    },
    {
      id: "e-cat-elastic",
      source: "n-catalog",
      target: "n-elastic",
      type: "smoothstep",
    },

    // Core → Kafka
    {
      id: "e-usr-kafka",
      source: "n-user",
      target: "n-kafka",
      type: "smoothstep",
      data: { label: "events" },
    },
    {
      id: "e-play-kafka",
      source: "n-playback",
      target: "n-kafka",
      type: "smoothstep",
      data: { label: "events" },
    },

    // Kafka → Atlas
    {
      id: "e-kafka-atlas",
      source: "n-kafka",
      target: "n-atlas",
      type: "smoothstep",
    },

    // Encoding pipeline
    {
      id: "e-s3r-enc",
      source: "n-s3-raw",
      target: "n-encoder",
      type: "smoothstep",
      animated: true,
    },
    {
      id: "e-enc-s3o",
      source: "n-encoder",
      target: "n-s3-out",
      type: "smoothstep",
      animated: true,
    },

    // S3 → CDN → Clients
    {
      id: "e-s3o-cdn",
      source: "n-s3-out",
      target: "n-cdn",
      type: "smoothstep",
      data: { label: "push cache" },
    },
    {
      id: "e-cdn-web",
      source: "n-cdn",
      target: "n-web",
      type: "smoothstep",
      animated: true,
      data: { label: "stream" },
    },
    {
      id: "e-cdn-mob",
      source: "n-cdn",
      target: "n-mobile",
      type: "smoothstep",
      animated: true,
      data: { label: "stream" },
    },
    {
      id: "e-cdn-tv",
      source: "n-cdn",
      target: "n-tv",
      type: "smoothstep",
      animated: true,
      data: { label: "stream" },
    },

    // Playback → CDN (URL generation)
    {
      id: "e-play-cdn",
      source: "n-playback",
      target: "n-cdn",
      type: "smoothstep",
      data: { label: "signed URL" },
    },
  ] as DiagramEdge[],
};

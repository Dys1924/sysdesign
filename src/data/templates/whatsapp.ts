import type { DiagramNode, DiagramEdge } from "../../types/diagram";

//  Layout constants
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

//  Column X positions ─
const G_CLIENTS_X = 0;
const G_CLIENTS_W = groupW(1);

const G_GATEWAY_X = G_CLIENTS_W + COL_GAP;
const G_GATEWAY_W = groupW(1);

const G_CORE_X = G_GATEWAY_X + G_GATEWAY_W + COL_GAP;
const G_CORE_W = groupW(1);

const G_DATA_X = G_CORE_X + G_CORE_W + COL_GAP;
const G_DATA_W = groupW(1);

const G_INFRA_X = G_CORE_X;
const G_INFRA_W = groupW(2);

//  Row Y positions
const ROW1_Y = 0;
const ROW2_Y = ROW1_Y + groupH(4) + 180;

export const WHATSAPP_TEMPLATE: {
  id: string;
  name: string;
  description: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
} = {
  id: "whatsapp-architecture",
  name: "WhatsApp Architecture",
  description:
    "Real-time messaging at 2B+ users — XMPP protocol, Erlang chat servers, Mnesia storage, and end-to-end encryption.",

  nodes: [
    // ── GROUP: Clients ─
    {
      id: "g-clients",
      type: "group",
      position: { x: G_CLIENTS_X, y: ROW1_Y },
      style: {
        width: G_CLIENTS_W,
        height: groupH(3),
        ...groupStyle("#993556", "rgba(153,53,86,0.04)"),
      },
      data: {
        label: "Client Apps",
        category: "frontend",
        subtype: "component",
        icon: "IconDevices",
        description: "",
      },
    },
    {
      id: "n-android",
      type: "diagram",
      parentId: "g-clients",
      extent: "parent",
      position: { x: PAD_X, y: PAD_Y },
      data: {
        label: "Android App",
        category: "frontend",
        subtype: "fe-mobile-android",
        icon: "IconBrandAndroid",
        description: "Native Android client",
      },
    },
    {
      id: "n-ios",
      type: "diagram",
      parentId: "g-clients",
      extent: "parent",
      position: { x: PAD_X, y: PAD_Y + NODE_H + ROW_GAP },
      data: {
        label: "iOS App",
        category: "frontend",
        subtype: "fe-mobile-ios",
        icon: "IconBrandApple",
        description: "Native iOS client",
      },
    },
    {
      id: "n-web",
      type: "diagram",
      parentId: "g-clients",
      extent: "parent",
      position: { x: PAD_X, y: PAD_Y + (NODE_H + ROW_GAP) * 2 },
      data: {
        label: "WhatsApp Web",
        category: "frontend",
        subtype: "fe-webapp",
        icon: "IconBrowser",
        description: "Browser client via WebSocket",
      },
    },

    // ── GROUP: Gateway Layer ─
    {
      id: "g-gateway",
      type: "group",
      position: { x: G_GATEWAY_X, y: ROW1_Y },
      style: {
        width: G_GATEWAY_W,
        height: groupH(4),
        ...groupStyle("#185FA5", "rgba(24,95,165,0.04)"),
      },
      data: {
        label: "Gateway Layer",
        category: "microservice",
        subtype: "component",
        icon: "IconApi",
        description: "",
      },
    },
    {
      id: "n-lb",
      type: "diagram",
      parentId: "g-gateway",
      extent: "parent",
      position: { x: PAD_X, y: PAD_Y },
      data: {
        label: "Load Balancer",
        category: "microservice",
        subtype: "ms-load-balancer",
        icon: "IconArrowsSplit2",
        description: "Distributes connections globally",
      },
    },
    {
      id: "n-xmpp",
      type: "diagram",
      parentId: "g-gateway",
      extent: "parent",
      position: { x: PAD_X, y: PAD_Y + NODE_H + ROW_GAP },
      data: {
        label: "XMPP Gateway",
        category: "microservice",
        subtype: "ms-api-gateway",
        icon: "IconApi",
        description: "Chat protocol entry point",
      },
    },
    {
      id: "n-auth",
      type: "diagram",
      parentId: "g-gateway",
      extent: "parent",
      position: { x: PAD_X, y: PAD_Y + (NODE_H + ROW_GAP) * 2 },
      data: {
        label: "Auth Service",
        category: "microservice",
        subtype: "ms-auth-service",
        icon: "IconLock",
        description: "Phone number + OTP verification",
      },
    },
    {
      id: "n-presence",
      type: "diagram",
      parentId: "g-gateway",
      extent: "parent",
      position: { x: PAD_X, y: PAD_Y + (NODE_H + ROW_GAP) * 3 },
      data: {
        label: "Presence Service",
        category: "microservice",
        subtype: "ms-service",
        icon: "IconCircleDot",
        description: "Online, typing, last seen",
      },
    },

    // ── GROUP: Core Services ─
    {
      id: "g-core",
      type: "group",
      position: { x: G_CORE_X, y: ROW1_Y },
      style: {
        width: G_CORE_W,
        height: groupH(4),
        ...groupStyle("#3B6D11", "rgba(59,109,17,0.04)"),
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
      id: "n-chat",
      type: "diagram",
      parentId: "g-core",
      extent: "parent",
      position: { x: PAD_X, y: PAD_Y },
      data: {
        label: "Chat Server (Erlang)",
        category: "microservice",
        subtype: "ms-service",
        icon: "IconMessageCircle",
        description: "High concurrency message routing",
      },
    },
    {
      id: "n-group",
      type: "diagram",
      parentId: "g-core",
      extent: "parent",
      position: { x: PAD_X, y: PAD_Y + NODE_H + ROW_GAP },
      data: {
        label: "Group Service",
        category: "microservice",
        subtype: "ms-service",
        icon: "IconUsersGroup",
        description: "Group membership & broadcasting",
      },
    },
    {
      id: "n-media",
      type: "diagram",
      parentId: "g-core",
      extent: "parent",
      position: { x: PAD_X, y: PAD_Y + (NODE_H + ROW_GAP) * 2 },
      data: {
        label: "Media Service",
        category: "microservice",
        subtype: "ms-service",
        icon: "IconPhoto",
        description: "Image, video, audio upload/delivery",
      },
    },
    {
      id: "n-notif",
      type: "diagram",
      parentId: "g-core",
      extent: "parent",
      position: { x: PAD_X, y: PAD_Y + (NODE_H + ROW_GAP) * 3 },
      data: {
        label: "Push Notification",
        category: "microservice",
        subtype: "ms-service",
        icon: "IconBellRinging",
        description: "APNs, FCM offline delivery",
      },
    },

    // ── GROUP: Data Layer ─
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
      id: "n-mnesia",
      type: "diagram",
      parentId: "g-data",
      extent: "parent",
      position: { x: PAD_X, y: PAD_Y },
      data: {
        label: "Mnesia (Erlang DB)",
        category: "database",
        subtype: "db-cassandra",
        icon: "IconStack",
        description: "In-memory message queue store",
      },
    },
    {
      id: "n-cassandra",
      type: "diagram",
      parentId: "g-data",
      extent: "parent",
      position: { x: PAD_X, y: PAD_Y + NODE_H + ROW_GAP },
      data: {
        label: "Cassandra",
        category: "database",
        subtype: "db-cassandra",
        icon: "IconDatabase",
        description: "Message history at scale",
      },
    },
    {
      id: "n-redis",
      type: "diagram",
      parentId: "g-data",
      extent: "parent",
      position: { x: PAD_X, y: PAD_Y + (NODE_H + ROW_GAP) * 2 },
      data: {
        label: "Redis",
        category: "database",
        subtype: "db-redis",
        icon: "IconCpu",
        description: "Session cache & presence state",
      },
    },
    {
      id: "n-blob",
      type: "diagram",
      parentId: "g-data",
      extent: "parent",
      position: { x: PAD_X, y: PAD_Y + (NODE_H + ROW_GAP) * 3 },
      data: {
        label: "Blob Storage",
        category: "cloud",
        subtype: "aws-s3",
        icon: "IconBucket",
        description: "Media file storage (encrypted)",
      },
    },

    // ── GROUP: Infrastructure (bottom row) ──
    {
      id: "g-infra",
      type: "group",
      position: { x: G_INFRA_X, y: ROW2_Y },
      style: {
        width: G_INFRA_W,
        height: groupH(1),
        ...groupStyle("#534AB7", "rgba(83,74,183,0.04)"),
      },
      data: {
        label: "Infrastructure & Observability",
        category: "microservice",
        subtype: "component",
        icon: "IconServer",
        description: "",
      },
    },
    {
      id: "n-kafka",
      type: "diagram",
      parentId: "g-infra",
      extent: "parent",
      position: { x: PAD_X, y: PAD_Y },
      data: {
        label: "Kafka",
        category: "database",
        subtype: "db-kafka",
        icon: "IconChartLine",
        description: "Async event streaming between services",
      },
    },
    {
      id: "n-monitor",
      type: "diagram",
      parentId: "g-infra",
      extent: "parent",
      position: { x: PAD_X + NODE_W + 24, y: PAD_Y },
      data: {
        label: "Monitoring (Grafana)",
        category: "microservice",
        subtype: "obs-metrics",
        icon: "IconChartHistogram",
        description: "Metrics, alerts, dashboards",
      },
    },

    // ── Standalone: E2E Encryption ─
    {
      id: "n-e2e",
      type: "diagram",
      position: { x: G_GATEWAY_X, y: ROW2_Y + groupH(1) / 2 - NODE_H / 2 },
      data: {
        label: "E2E Encryption (Signal)",
        category: "security",
        subtype: "sec-ssl",
        icon: "IconShieldLock",
        description: "Signal protocol for all messages",
      },
    },
  ] as unknown as DiagramNode[],

  edges: [
    // Clients → Load Balancer
    {
      id: "e-and-lb",
      source: "n-android",
      target: "n-lb",
      type: "smoothstep",
      animated: true,
      data: { label: "WSS" },
    },
    {
      id: "e-ios-lb",
      source: "n-ios",
      target: "n-lb",
      type: "smoothstep",
      animated: true,
    },
    {
      id: "e-web-lb",
      source: "n-web",
      target: "n-lb",
      type: "smoothstep",
      animated: true,
    },

    // Gateway internals
    { id: "e-lb-xmpp", source: "n-lb", target: "n-xmpp", type: "smoothstep" },
    { id: "e-lb-auth", source: "n-lb", target: "n-auth", type: "smoothstep" },
    {
      id: "e-xmpp-pres",
      source: "n-xmpp",
      target: "n-presence",
      type: "smoothstep",
    },

    // Gateway → Core
    {
      id: "e-xmpp-chat",
      source: "n-xmpp",
      target: "n-chat",
      type: "smoothstep",
      animated: true,
      data: { label: "XMPP" },
    },
    {
      id: "e-xmpp-grp",
      source: "n-xmpp",
      target: "n-group",
      type: "smoothstep",
    },
    {
      id: "e-xmpp-med",
      source: "n-xmpp",
      target: "n-media",
      type: "smoothstep",
    },

    // Core → Data
    {
      id: "e-chat-mne",
      source: "n-chat",
      target: "n-mnesia",
      type: "smoothstep",
    },
    {
      id: "e-chat-cass",
      source: "n-chat",
      target: "n-cassandra",
      type: "smoothstep",
    },
    {
      id: "e-pres-red",
      source: "n-presence",
      target: "n-redis",
      type: "smoothstep",
    },
    {
      id: "e-med-blob",
      source: "n-media",
      target: "n-blob",
      type: "smoothstep",
    },

    // Notifications
    {
      id: "e-chat-notif",
      source: "n-chat",
      target: "n-notif",
      type: "smoothstep",
      data: { label: "offline" },
    },

    // Kafka
    {
      id: "e-chat-kaf",
      source: "n-chat",
      target: "n-kafka",
      type: "smoothstep",
      data: { label: "events" },
    },
    {
      id: "e-grp-kaf",
      source: "n-group",
      target: "n-kafka",
      type: "smoothstep",
    },
    {
      id: "e-kaf-mon",
      source: "n-kafka",
      target: "n-monitor",
      type: "smoothstep",
    },

    // E2E Encryption
    {
      id: "e-e2e-xmpp",
      source: "n-e2e",
      target: "n-xmpp",
      type: "smoothstep",
      data: { label: "encrypt/decrypt" },
    },
    { id: "e-e2e-chat", source: "n-e2e", target: "n-chat", type: "smoothstep" },
  ] as DiagramEdge[],
};

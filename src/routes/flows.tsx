import { createFileRoute } from "@tanstack/react-router";
import { IconHierarchy } from "@tabler/icons-react";
import ComingSoon from "../components/layout/ComingSoon";

export const Route = createFileRoute("/flows")({
  component: FlowsPage,
});

function FlowsPage() {
  return (
    <ComingSoon
      title="Dynamic Flow Architect"
      description="Advanced sequence modeling and entity relationship visualization are in progress. Our upcoming flow engine will support real-time traffic simulation and latency analysis."
      icon={IconHierarchy}
    />
  );
}

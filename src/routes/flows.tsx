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
      description="Sequence diagrams, data flows, event storming, CI/CD pipelines and more — advanced flow types are currently in development."
      icon={IconHierarchy}
    />
  );
}

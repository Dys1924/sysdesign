import { createFileRoute } from "@tanstack/react-router";
import { IconPuzzle } from "@tabler/icons-react";
import ComingSoon from "../components/layout/ComingSoon";

export const Route = createFileRoute("/integrations")({
  component: IntegrationsPage,
});

function IntegrationsPage() {
  return (
    <ComingSoon
      title="Integrations Hub"
      description="Connect SysDesign to your existing infrastructure stack. GitHub, Supabase, AWS, Kubernetes and more — currently being optimized."
      icon={IconPuzzle}
    />
  );
}

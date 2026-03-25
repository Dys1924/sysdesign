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
      description="Connect SysDesign to your existing infrastructure stack. Terraform, CloudFormation, and Pulumi sync are currently being optimized for high-performance enterprise architectures."
      icon={IconPuzzle}
    />
  );
}

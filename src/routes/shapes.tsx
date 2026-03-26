import { createFileRoute } from "@tanstack/react-router";
import { IconShape } from "@tabler/icons-react";
import ComingSoon from "../components/layout/ComingSoon";

export const Route = createFileRoute("/shapes")({
  component: ShapesPage,
});

function ShapesPage() {
  return (
    <ComingSoon
      title="Infinite Geometry Library"
      description="Process, decision, swimlane, queue shapes and more — the full technical shape library is currently being built."
      icon={IconShape}
    />
  );
}

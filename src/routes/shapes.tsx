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
      description="Expand your design possibilities with our upcoming library of polymorphic shapes and architectural icons. Optimized for SVG high-fidelity exports and custom branding."
      icon={IconShape}
    />
  );
}

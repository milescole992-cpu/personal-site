import {
  Archive,
  BookOpenText,
  BrainCircuit,
  Compass,
  HardHat,
  Layers3,
  Rocket,
  Route,
  Video,
  Workflow,
  Wrench,
} from "lucide-react";

const iconMap = {
  Archive,
  BookOpenText,
  BrainCircuit,
  Compass,
  HardHat,
  Layers3,
  Rocket,
  Route,
  Video,
  Workflow,
  Wrench,
};

export function IconBadge({ name }: { name?: string | null }) {
  const Icon = iconMap[(name || "BrainCircuit") as keyof typeof iconMap] || BrainCircuit;

  return <Icon size={19} />;
}

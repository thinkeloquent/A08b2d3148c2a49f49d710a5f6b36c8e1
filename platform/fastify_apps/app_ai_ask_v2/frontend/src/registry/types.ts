export type PanelRegion = "left" | "main" | "right";

export interface RegionSlot {
  id: string;
  component: React.ComponentType;
  order: number;
}

export interface PromptRegistryEntry {
  id: string;
  title: string;
  sub: string;
  regions: Partial<Record<PanelRegion, RegionSlot[]>>;
}

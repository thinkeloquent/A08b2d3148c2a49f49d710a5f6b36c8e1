import type { RegionSlot } from "./types";

const RegionRenderer = ({ slots }: { slots?: RegionSlot[] }) => {
  if (!slots || slots.length === 0) return null;
  const sorted = [...slots].sort((a, b) => a.order - b.order);
  return (
    <>
      {sorted.map((slot) => (
        <slot.component key={slot.id} />
      ))}
    </>
  );
};

export { RegionRenderer };

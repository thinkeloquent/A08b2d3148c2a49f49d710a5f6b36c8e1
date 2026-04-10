export interface ServiceDef {
  id: string;
  label: string;
  Icon: React.FC<{ s?: number }>;
  borderAccent: string;
  bgClass: string;
  textClass: string;
  desc: string;
}

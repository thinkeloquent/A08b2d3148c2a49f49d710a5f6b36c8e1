import { InstanceDataView } from '../components/dataview';

interface Props {
  instanceId: string;
  tab?: string;
  onTabChange?: (tab: string) => void;
  onBack: () => void;
}

export function InstanceDetailPage({ instanceId, tab, onTabChange, onBack }: Props) {
  return (
    <InstanceDataView
      instanceId={instanceId}
      initialTab={tab}
      onTabChange={onTabChange}
      onBack={onBack}
    />
  );
}

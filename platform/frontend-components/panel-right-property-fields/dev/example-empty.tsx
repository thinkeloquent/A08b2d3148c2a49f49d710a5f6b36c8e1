import { PanelRightPropertyFields } from '../src';

export default function ExampleEmpty() {
  return (
    <div className="flex h-screen bg-slate-100 font-['DM_Sans']">
      <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
        Main content area
      </div>
      <PanelRightPropertyFields
        title="Fields"
        groups={[]}
        searchPlaceholder="No fields available"
      />
    </div>
  );
}

import type { BaseBlockProps } from '../../src';

export const UpgradeCard = (_props: BaseBlockProps) => (
  <div className="rounded-2xl p-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 50%, #BFDBFE 100%)' }}>
    <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20" style={{ backgroundColor: '#3B82F6' }} />
    <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full opacity-10" style={{ backgroundColor: '#2563EB' }} />
    <p className="text-[15px] font-bold text-gray-800 mb-1.5 relative">Upgrade</p>
    <div className="w-16 h-1.5 rounded-full bg-white/60 mb-2.5 overflow-hidden relative">
      <div className="w-2/3 h-full rounded-full" style={{ backgroundColor: '#3B82F6' }} />
    </div>
    <p className="text-xs text-gray-500 mb-3 relative leading-relaxed">
      Your free subscription plan<br />expire in <span className="font-bold text-gray-700">18 Days</span>
    </p>
    <button className="px-4 py-2 rounded-xl text-white text-xs font-semibold transition-all hover:opacity-90 shadow-sm relative" style={{ backgroundColor: '#2563EB' }}>
      Upgrade Plan
    </button>
  </div>
);

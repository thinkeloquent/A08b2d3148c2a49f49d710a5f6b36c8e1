import { SERVICES } from "@/services/data";
import { ServiceCard } from "@/services/ServiceCard";

const ServicesPanel = () => (
  <div className="px-3 pt-4 flex-1 overflow-y-auto pb-4">
    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Services</p>
    <div className="space-y-2">
      {SERVICES.map((svc) => <ServiceCard key={svc.id} svc={svc} />)}
    </div>
  </div>
);

export { ServicesPanel };

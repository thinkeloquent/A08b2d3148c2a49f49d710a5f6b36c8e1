import { useLocation } from "react-router-dom";
import { Home, ChevronRight } from "lucide-react";

export function Header() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3">
      <nav className="flex items-center gap-1 text-sm text-gray-500" data-test-id="nav-92afbd1c">
        <Home size={14} data-test-id="home-d4632bfd" />
        {segments.length === 0 ?
        <span className="text-gray-900 font-medium ml-1">Dashboard</span> :

        segments.map((seg, i) =>
        <span key={seg} className="flex items-center gap-1">
              <ChevronRight size={14} />
              <span
            className={
            i === segments.length - 1 ?
            "text-gray-900 font-medium capitalize" :
            "capitalize"
            }>

                {seg}
              </span>
            </span>
        )
        }
      </nav>
    </header>);

}
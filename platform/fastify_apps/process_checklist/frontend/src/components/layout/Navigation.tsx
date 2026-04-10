import { Link, NavLink } from "react-router-dom";
import { buttonClasses } from "../ui/Button";

export function Navigation() {
  return (
    <header className="relative mx-auto w-full max-w-6xl px-6 sm:px-8 lg:px-10">
      <div className="flex items-center justify-between gap-8 rounded-lg border border-neutral-200 bg-white px-6 py-3 shadow-sm" data-test-id="div-8ba452ac">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm font-semibold text-neutral-900 transition hover:text-neutral-700">

          <span className="inline-flex size-2 rounded-full bg-emerald-500" />
          Process Checklist
        </Link>
        <nav className="flex items-center gap-2">
          <NavLink
            to="/templates"
            className={({ isActive }) =>
            buttonClasses({
              size: "sm",
              variant: isActive ? "secondary" : "ghost"
            })
            } data-test-id="navlink-b64b2a56">

            Templates
          </NavLink>
          <NavLink
            to="/checklists"
            className={({ isActive }) =>
            buttonClasses({
              size: "sm",
              variant: isActive ? "secondary" : "ghost"
            })
            } data-test-id="navlink-f7bf5a92">

            Checklists
          </NavLink>
        </nav>
      </div>
    </header>);

}
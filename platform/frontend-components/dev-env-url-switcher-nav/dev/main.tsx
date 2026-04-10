import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { DevEnvUrlSwitcher } from '@internal/dev-env-url-switcher';
import './styles.css';
import { DevEnvUrlSwitcherNav } from '../src';

const OBJECT_LINKS = [
  { url: '/organizations', name: 'Organizations' },
  { url: '/team-members', name: 'Team Members' },
  { url: '/services', name: 'Services' },
  { url: '/minimal', name: 'Minimal' },
];

const TUPLE_LINKS: [string, string][] = [
  ['/dashboard', 'Dashboard'],
  ['/settings', 'Settings'],
  ['/users', 'Users'],
];

const EXAMPLES = [
  { name: 'Object Links', path: '/' },
  { name: 'Tuple Links', path: '/tuples' },
  { name: 'With Label', path: '/with-label' },
  { name: 'No Active', path: '/no-active' },
];

function ObjectLinksExample() {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <div>
      <DevEnvUrlSwitcherNav
        links={OBJECT_LINKS}
        activeUrl={location.pathname}
        onNavigate={(url) => navigate(url)}
        label="Examples:"
      />
      <div className="p-6 text-sm text-gray-500">
        Active: <code>{location.pathname}</code> — click a nav item to change route
      </div>
    </div>
  );
}

function TupleLinksExample() {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <div>
      <DevEnvUrlSwitcherNav
        links={TUPLE_LINKS}
        activeUrl={location.pathname}
        onNavigate={(url) => navigate(url)}
        label="Pages:"
      />
      <div className="p-6 text-sm text-gray-500">
        Using <code>[[url, name]]</code> tuple format
      </div>
    </div>
  );
}

function WithLabelExample() {
  const navigate = useNavigate();
  return (
    <div>
      <DevEnvUrlSwitcherNav
        links={OBJECT_LINKS}
        activeUrl="/organizations"
        onNavigate={(url) => navigate(url)}
        label="Navigate:"
        labelIcon={<span className="text-gray-400">&#9776;</span>}
      />
      <div className="p-6 text-sm text-gray-500">With label icon and text</div>
    </div>
  );
}

function NoActiveExample() {
  const navigate = useNavigate();
  return (
    <div>
      <DevEnvUrlSwitcherNav
        links={OBJECT_LINKS}
        onNavigate={(url) => navigate(url)}
      />
      <div className="p-6 text-sm text-gray-500">No active item, no label</div>
    </div>
  );
}

function DevNav() {
  const navigate = useNavigate();
  return (
    <DevEnvUrlSwitcher
      links={EXAMPLES.map((e) => ({ name: e.name, url: e.path }))}
      onNavigate={(url) => navigate(url)}
      triggerLabel="Examples"
      title="Component Examples"
    />
  );
}

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <DevNav />
    <Routes>
      <Route path="/" element={<ObjectLinksExample />} />
      <Route path="/tuples" element={<TupleLinksExample />} />
      <Route path="/with-label" element={<WithLabelExample />} />
      <Route path="/no-active" element={<NoActiveExample />} />
      {/* Allow sub-routes for nav item clicks within examples */}
      <Route path="/*" element={<ObjectLinksExample />} />
    </Routes>
  </BrowserRouter>,
);

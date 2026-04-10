import { createRoot } from 'react-dom/client';
import './styles.css';
import { FigmaHierarchicalNodeNavigator } from '../src';
import type { TreeNode } from '../src';

const SAMPLE_TREE: TreeNode[] = [
  {
    id: 'app',
    name: 'App',
    type: 'frame',
    color: '#6366f1',
    children: [
      {
        id: 'nav',
        name: 'Navigation',
        type: 'frame',
        color: '#8b5cf6',
        children: [
          { id: 'logo', name: 'Logo', type: 'component', color: '#a78bfa' },
          {
            id: 'menu',
            name: 'Menu Items',
            type: 'frame',
            color: '#8b5cf6',
            children: [
              { id: 'm1', name: 'Home', type: 'file', color: '#c4b5fd' },
              { id: 'm2', name: 'Products', type: 'file', color: '#c4b5fd' },
              { id: 'm3', name: 'About', type: 'file', color: '#c4b5fd' },
            ],
          },
          {
            id: 'avatar',
            name: 'User Avatar',
            type: 'circle',
            color: '#a78bfa',
          },
        ],
      },
      {
        id: 'hero',
        name: 'Hero Section',
        type: 'frame',
        color: '#3b82f6',
        children: [
          { id: 'headline', name: 'Headline', type: 'file', color: '#93c5fd' },
          { id: 'subtext', name: 'Subtext', type: 'file', color: '#93c5fd' },
          {
            id: 'cta',
            name: 'CTA Button',
            type: 'component',
            color: '#60a5fa',
          },
          {
            id: 'heroImg',
            name: 'Hero Image',
            type: 'frame',
            color: '#3b82f6',
            children: [
              {
                id: 'img1',
                name: 'Background',
                type: 'file',
                color: '#93c5fd',
              },
              {
                id: 'img2',
                name: 'Overlay',
                type: 'file',
                color: '#93c5fd',
              },
            ],
          },
        ],
      },
      {
        id: 'features',
        name: 'Features Grid',
        type: 'frame',
        color: '#0ea5e9',
        children: [
          {
            id: 'f1',
            name: 'Feature Card 1',
            type: 'component',
            color: '#38bdf8',
            children: [
              { id: 'f1i', name: 'Icon', type: 'circle', color: '#7dd3fc' },
              { id: 'f1t', name: 'Title', type: 'file', color: '#7dd3fc' },
              {
                id: 'f1d',
                name: 'Description',
                type: 'file',
                color: '#7dd3fc',
              },
            ],
          },
          {
            id: 'f2',
            name: 'Feature Card 2',
            type: 'component',
            color: '#38bdf8',
            children: [
              { id: 'f2i', name: 'Icon', type: 'circle', color: '#7dd3fc' },
              { id: 'f2t', name: 'Title', type: 'file', color: '#7dd3fc' },
              {
                id: 'f2d',
                name: 'Description',
                type: 'file',
                color: '#7dd3fc',
              },
            ],
          },
          {
            id: 'f3',
            name: 'Feature Card 3',
            type: 'component',
            color: '#38bdf8',
            children: [
              { id: 'f3i', name: 'Icon', type: 'circle', color: '#7dd3fc' },
              { id: 'f3t', name: 'Title', type: 'file', color: '#7dd3fc' },
              {
                id: 'f3d',
                name: 'Description',
                type: 'file',
                color: '#7dd3fc',
              },
            ],
          },
        ],
      },
      {
        id: 'footer',
        name: 'Footer',
        type: 'frame',
        color: '#64748b',
        children: [
          { id: 'copy', name: 'Copyright', type: 'file', color: '#94a3b8' },
          { id: 'links', name: 'Links', type: 'component', color: '#94a3b8' },
        ],
      },
    ],
  },
];

createRoot(document.getElementById('root')!).render(
  <FigmaHierarchicalNodeNavigator
    nodes={SAMPLE_TREE}
    onSelectNode={(id) => console.log('Selected:', id)}
    onVisibilityChange={(id, hidden) =>
      console.log('Visibility:', id, hidden ? 'hidden' : 'visible')
    }
  />,
);

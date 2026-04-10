import type { RepoInfo } from '@/types';

export const MOCK_REPOS: Record<string, RepoInfo> = {
  'microsoft/vscode': {
    name: 'vscode',
    owner: 'microsoft',
    stars: 162000,
    forks: 28500,
    description: 'Visual Studio Code - Open Source IDE',
    tree: {
      src: {
        type: 'dir',
        lastCommit: 'Refactor editor layout engine',
        author: 'jrieken',
        hash: 'a3f2c91',
        date: '2 days ago',
        items: {
          'vs': {
            type: 'dir',
            lastCommit: 'Update workbench services',
            author: 'bpasero',
            hash: 'e7d4b12',
            date: '3 days ago',
            items: {
              'editor': {
                type: 'dir',
                lastCommit: 'Fix cursor blinking in zen mode',
                author: 'alexdima',
                hash: 'c1a9e34',
                date: '1 day ago',
                items: {
                  'editor.main.ts': { type: 'file', size: 45200, lang: 'TypeScript', loc: 1247, modified: '1 day ago', author: 'alexdima', commit: 'c1a9e34', message: 'Fix cursor blinking in zen mode' },
                  'editorWidget.ts': { type: 'file', size: 18700, lang: 'TypeScript', loc: 534, modified: '3 days ago', author: 'jrieken', commit: 'b2f8e71', message: 'Refactor widget lifecycle hooks' },
                },
              },
              'workbench': {
                type: 'dir',
                lastCommit: 'Add sidebar collapse animation',
                author: 'bpasero',
                hash: 'f5c3d28',
                date: '4 days ago',
                items: {
                  'workbench.ts': { type: 'file', size: 32100, lang: 'TypeScript', loc: 891, modified: '4 days ago', author: 'bpasero', commit: 'f5c3d28', message: 'Add sidebar collapse animation' },
                  'layout.ts': { type: 'file', size: 21400, lang: 'TypeScript', loc: 623, modified: '5 days ago', author: 'bpasero', commit: 'd4e1a93', message: 'Grid layout system overhaul' },
                },
              },
            },
          },
        },
      },
      extensions: {
        type: 'dir',
        lastCommit: 'Update built-in extension APIs',
        author: 'mjbvz',
        hash: 'd8e2f45',
        date: '1 week ago',
        items: {
          'typescript-language-features': {
            type: 'dir',
            lastCommit: 'Bump TS server to 5.4',
            author: 'mjbvz',
            hash: 'a1b2c3d',
            date: '1 week ago',
            items: {
              'package.json': { type: 'file', size: 4200, lang: 'JSON', loc: 142, modified: '1 week ago', author: 'mjbvz', commit: 'a1b2c3d', message: 'Bump TS server to 5.4' },
              'tsconfig.json': { type: 'file', size: 890, lang: 'JSON', loc: 28, modified: '2 weeks ago', author: 'mjbvz', commit: '9e8d7c6', message: 'Enable strict null checks' },
            },
          },
          'markdown-language-features': {
            type: 'dir',
            lastCommit: 'Fix preview scroll sync',
            author: 'mjbvz',
            hash: 'b4c5d6e',
            date: '5 days ago',
            items: {
              'preview.ts': { type: 'file', size: 8900, lang: 'TypeScript', loc: 267, modified: '5 days ago', author: 'mjbvz', commit: 'b4c5d6e', message: 'Fix preview scroll sync' },
            },
          },
        },
      },
      '.vscode': {
        type: 'dir',
        lastCommit: 'Update recommended extensions',
        author: 'jrieken',
        hash: 'c9d0e12',
        date: '2 weeks ago',
        items: {
          'settings.json': { type: 'file', size: 2100, lang: 'JSON', loc: 67, modified: '2 weeks ago', author: 'jrieken', commit: 'c9d0e12', message: 'Update recommended extensions' },
          'launch.json': { type: 'file', size: 3400, lang: 'JSON', loc: 98, modified: '3 weeks ago', author: 'bpasero', commit: 'a8b7c6d', message: 'Add attach to process config' },
        },
      },
      'package.json': { type: 'file', size: 12800, lang: 'JSON', loc: 389, modified: '3 days ago', author: 'deepak1556', commit: 'e4f5a67', message: 'Bump electron to v28.2.1' },
      'README.md': { type: 'file', size: 8900, lang: 'Markdown', loc: 234, modified: '1 week ago', author: 'gregvanl', commit: 'f6g7h89', message: 'Update contribution guidelines' },
      'tsconfig.json': { type: 'file', size: 1200, lang: 'JSON', loc: 38, modified: '2 weeks ago', author: 'jrieken', commit: 'i0j1k23', message: 'Enable incremental compilation' },
    },
  },
  'vercel/next.js': {
    name: 'next.js',
    owner: 'vercel',
    stars: 125000,
    forks: 26700,
    description: 'The React Framework for the Web',
    tree: {
      packages: {
        type: 'dir',
        lastCommit: 'Optimize server components bundling',
        author: 'timneutkens',
        hash: 'x1y2z34',
        date: '1 day ago',
        items: {
          next: {
            type: 'dir',
            lastCommit: 'Fix hydration mismatch warning',
            author: 'shuding',
            hash: 'p4q5r67',
            date: '12 hours ago',
            items: {
              'src': {
                type: 'dir',
                lastCommit: 'Streaming SSR improvements',
                author: 'feedthejim',
                hash: 's7t8u90',
                date: '1 day ago',
                items: {
                  'server.ts': { type: 'file', size: 67300, lang: 'TypeScript', loc: 1893, modified: '1 day ago', author: 'feedthejim', commit: 's7t8u90', message: 'Streaming SSR improvements' },
                  'client.ts': { type: 'file', size: 23400, lang: 'TypeScript', loc: 678, modified: '2 days ago', author: 'shuding', commit: 'v1w2x34', message: 'Fix client-side navigation edge case' },
                },
              },
              'package.json': { type: 'file', size: 5600, lang: 'JSON', loc: 187, modified: '3 days ago', author: 'timneutkens', commit: 'y5z6a78', message: 'Release 14.1.1' },
            },
          },
          'next-swc': {
            type: 'dir',
            lastCommit: 'Update SWC transform plugins',
            author: 'kdy1',
            hash: 'b8c9d01',
            date: '3 days ago',
            items: {
              'crates': {
                type: 'dir',
                lastCommit: 'Optimize tree-shaking pass',
                author: 'kdy1',
                hash: 'e2f3g45',
                date: '3 days ago',
                items: {
                  'core.rs': { type: 'file', size: 34500, lang: 'TypeScript', loc: 978, modified: '3 days ago', author: 'kdy1', commit: 'e2f3g45', message: 'Optimize tree-shaking pass' },
                },
              },
            },
          },
        },
      },
      docs: {
        type: 'dir',
        lastCommit: 'Add App Router migration guide',
        author: 'leerob',
        hash: 'h6i7j89',
        date: '2 days ago',
        items: {
          'getting-started.md': { type: 'file', size: 15600, lang: 'Markdown', loc: 423, modified: '2 days ago', author: 'leerob', commit: 'h6i7j89', message: 'Add App Router migration guide' },
          'api-reference.md': { type: 'file', size: 28900, lang: 'Markdown', loc: 812, modified: '4 days ago', author: 'leerob', commit: 'k0l1m23', message: 'Document new metadata API' },
        },
      },
      'package.json': { type: 'file', size: 3200, lang: 'JSON', loc: 98, modified: '1 day ago', author: 'timneutkens', commit: 'n4o5p67', message: 'Update workspace dependencies' },
      'turbo.json': { type: 'file', size: 1800, lang: 'JSON', loc: 52, modified: '1 week ago', author: 'timneutkens', commit: 'q8r9s01', message: 'Configure remote caching' },
      'README.md': { type: 'file', size: 6700, lang: 'Markdown', loc: 178, modified: '3 days ago', author: 'leerob', commit: 't2u3v45', message: 'Update badges and links' },
    },
  },
  'facebook/react': {
    name: 'react',
    owner: 'facebook',
    stars: 227000,
    forks: 46300,
    description: 'A JavaScript library for building user interfaces',
    tree: {
      packages: {
        type: 'dir',
        lastCommit: 'Implement use() hook for promises',
        author: 'acdlite',
        hash: 'w6x7y89',
        date: '6 hours ago',
        items: {
          react: {
            type: 'dir',
            lastCommit: 'Add React.use() to public API',
            author: 'acdlite',
            hash: 'z0a1b23',
            date: '6 hours ago',
            items: {
              'index.js': { type: 'file', size: 4500, lang: 'JavaScript', loc: 134, modified: '6 hours ago', author: 'acdlite', commit: 'z0a1b23', message: 'Add React.use() to public API' },
              'React.js': { type: 'file', size: 12300, lang: 'JavaScript', loc: 367, modified: '1 day ago', author: 'gaearon', commit: 'c4d5e67', message: 'Cleanup legacy context warnings' },
            },
          },
          'react-dom': {
            type: 'dir',
            lastCommit: 'Fix batching in legacy mode',
            author: 'gaearon',
            hash: 'f8g9h01',
            date: '1 day ago',
            items: {
              'client.js': { type: 'file', size: 8900, lang: 'JavaScript', loc: 256, modified: '1 day ago', author: 'gaearon', commit: 'f8g9h01', message: 'Fix batching in legacy mode' },
              'server.js': { type: 'file', size: 15600, lang: 'JavaScript', loc: 445, modified: '2 days ago', author: 'gnoff', commit: 'i2j3k45', message: 'Streaming renderToPipeableStream fixes' },
            },
          },
          'react-reconciler': {
            type: 'dir',
            lastCommit: 'Optimize fiber tree traversal',
            author: 'acdlite',
            hash: 'l6m7n89',
            date: '2 days ago',
            items: {
              'ReactFiber.js': { type: 'file', size: 42100, lang: 'JavaScript', loc: 1234, modified: '2 days ago', author: 'acdlite', commit: 'l6m7n89', message: 'Optimize fiber tree traversal' },
              'ReactFiberHooks.js': { type: 'file', size: 58700, lang: 'JavaScript', loc: 1678, modified: '3 days ago', author: 'acdlite', commit: 'o0p1q23', message: 'Implement useMemo cache invalidation' },
            },
          },
        },
      },
      fixtures: {
        type: 'dir',
        lastCommit: 'Add concurrent mode test fixture',
        author: 'rickhanlonii',
        hash: 'r4s5t67',
        date: '1 week ago',
        items: {
          'dom': {
            type: 'dir',
            lastCommit: 'Update DOM fixture tests',
            author: 'rickhanlonii',
            hash: 'u8v9w01',
            date: '1 week ago',
            items: {
              'index.html': { type: 'file', size: 2300, lang: 'Markdown', loc: 67, modified: '1 week ago', author: 'rickhanlonii', commit: 'u8v9w01', message: 'Update DOM fixture tests' },
            },
          },
        },
      },
      'package.json': { type: 'file', size: 2800, lang: 'JSON', loc: 87, modified: '1 day ago', author: 'gaearon', commit: 'x2y3z45', message: 'Update workspace config' },
      'README.md': { type: 'file', size: 5400, lang: 'Markdown', loc: 156, modified: '5 days ago', author: 'gaearon', commit: 'a6b7c89', message: 'Update quick start docs' },
      'LICENSE': { type: 'file', size: 1100, lang: 'Text', loc: 21, modified: '6 months ago', author: 'facebook-github-bot', commit: 'd0e1f23', message: 'Update license year' },
    },
  },
};

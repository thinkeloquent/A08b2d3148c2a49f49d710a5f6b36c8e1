import { useState, useEffect, useMemo, useCallback } from 'react';
import type { TreeNode, ApiRepo, GitHubRepoDetails, GitHubCommitInfo, GitHubTreeEntry, FileContentData } from '@/types';
import { parseGithubOwnerName } from '@/types';
import { MOCK_REPOS } from '@/data/mock-repos';
import {
  fetchRepoDetails, fetchContents, contentsToTreeNodes,
  fetchFileCommit, fetchGitTree, fetchFileContent,
  fetchBulkCommitDates, buildModeMap, fuzzyMatch,
  fetchVulnerabilityAlerts, GITHUB_BASE_URL,
} from '@/api/github';
import type { VulnerabilityAlerts } from '@/api/github';
import { TopBar } from '@/components/TopBar';
import { TabBar, type Tab } from '@/components/TabBar';
import { TreeSidebar } from '@/components/TreeSidebar';
import { Breadcrumb } from '@/components/Breadcrumb';
import { FileTable, type SortPreset } from '@/components/FileTable';
import { MetaPanel } from '@/components/MetaPanel';
import { FileHistoryTab } from '@/components/FileHistoryTab';
import { FileIntelligenceModal } from '@/components/FileIntelligenceModal';
import { ContentModal } from '@/components/ContentModal';

const BASE_TABS: Tab[] = [
  { id: 'files', label: 'File Listing' },
];

function repoKeyFromApi(repo: ApiRepo): string {
  const parsed = parseGithubOwnerName(repo.githubUrl);
  if (parsed) return `${parsed.owner}/${parsed.name}`;
  return repo.maintainer ? `${repo.maintainer}/${repo.name}` : repo.name;
}

export default function App() {
  const [apiRepos, setApiRepos] = useState<ApiRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [path, setPath] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<TreeNode | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);

  // Live API state
  const [currentDirEntries, setCurrentDirEntries] = useState<Record<string, TreeNode>>({});
  const [dirLoading, setDirLoading] = useState(false);
  const [repoDetails, setRepoDetails] = useState<GitHubRepoDetails | null>(null);
  const [useMock, setUseMock] = useState(false);

  // Git tree (for file modes)
  const [treeEntries, setTreeEntries] = useState<GitHubTreeEntry[]>([]);

  // Lazy commit info
  const [commitInfo, setCommitInfo] = useState<GitHubCommitInfo | null>(null);
  const [commitLoading, setCommitLoading] = useState(false);

  // File content modal
  const [fileContent, setFileContent] = useState<FileContentData | null>(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);

  // Search + sort
  const [searchQuery, setSearchQuery] = useState('');
  const [sortPreset, setSortPreset] = useState<SortPreset>('default');

  // Date-based sorting
  const [commitDates, setCommitDates] = useState<Record<string, string>>({});
  const [datesLoading, setDatesLoading] = useState(false);

  // Vulnerability alerts (repo-level)
  const [vulnAlerts, setVulnAlerts] = useState<VulnerabilityAlerts | null>(null);

  // Tabs
  const [activeTab, setActiveTab] = useState('files');
  const [historyFile, setHistoryFile] = useState<{ name: string; path: string } | null>(null);
  const [showIntelligenceModal, setShowIntelligenceModal] = useState(false);

  // Fetch repos from code-repositories API
  useEffect(() => {
    async function fetchRepos() {
      try {
        const res = await fetch('/api/code-repositories/repos?limit=100');
        const data = await res.json();
        const repos: ApiRepo[] = data.repositories ?? [];
        setApiRepos(repos);

        const hash = window.location.hash.slice(1);
        if (hash) {
          const parts = decodeURIComponent(hash).split('/').filter(Boolean);
          if (parts.length >= 2) {
            const rk = parts[0] + '/' + parts[1];
            const match = repos.find(r => repoKeyFromApi(r) === rk);
            if (match) {
              setSelectedRepo(rk);
              setPath(parts.slice(2));
            } else if (repos.length > 0) {
              setSelectedRepo(repoKeyFromApi(repos[0]));
            }
          }
        } else if (repos.length > 0) {
          setSelectedRepo(repoKeyFromApi(repos[0]));
        }
      } catch {
        const mockKeys = Object.keys(MOCK_REPOS);
        setApiRepos(mockKeys.map(k => {
          const r = MOCK_REPOS[k];
          return { id: k, name: r.name, description: r.description, githubUrl: `${GITHUB_BASE_URL}/${k}`, stars: r.stars, forks: r.forks, language: '', maintainer: r.owner };
        }));
        setSelectedRepo(mockKeys[0] ?? null);
      } finally {
        setLoading(false);
      }
    }
    fetchRepos();
  }, []);

  // Fetch repo details + recursive tree when repo changes
  useEffect(() => {
    if (!selectedRepo) {
      setRepoDetails(null);
      setTreeEntries([]);
      return;
    }
    const [owner, repo] = selectedRepo.split('/');
    if (!owner || !repo) return;

    setVulnAlerts(null);
    fetchRepoDetails(owner, repo)
      .then(details => {
        setRepoDetails(details);
        // Fetch recursive tree for file modes
        fetchGitTree(owner, repo, details.default_branch, true)
          .then(setTreeEntries)
          .catch(() => setTreeEntries([]));
      })
      .catch(() => {
        setRepoDetails(null);
        setTreeEntries([]);
      });
    fetchVulnerabilityAlerts(owner, repo)
      .then(setVulnAlerts)
      .catch(() => setVulnAlerts(null));
  }, [selectedRepo]);

  // Fetch contents when repo or path changes
  useEffect(() => {
    if (!selectedRepo) { setCurrentDirEntries({}); return; }
    const [owner, repo] = selectedRepo.split('/');
    if (!owner || !repo) return;

    setDirLoading(true);
    setUseMock(false);
    setSearchQuery('');
    setSortPreset('default');
    setCommitDates({});

    const currentPath = path.join('/');
    const modeMap = treeEntries.length > 0 ? buildModeMap(treeEntries, currentPath) : undefined;

    fetchContents(owner, repo, currentPath)
      .then(items => {
        setCurrentDirEntries(contentsToTreeNodes(items, modeMap));
        setDirLoading(false);
      })
      .catch(() => {
        const mockRepo = MOCK_REPOS[selectedRepo];
        if (mockRepo) {
          setUseMock(true);
          let n: Record<string, TreeNode> = mockRepo.tree;
          for (const seg of path) {
            const node = n[seg];
            if (node?.type === 'dir' && node.items) {
              n = node.items;
            } else { n = {}; break; }
          }
          setCurrentDirEntries(n);
        } else {
          setCurrentDirEntries({});
        }
        setDirLoading(false);
      });
  }, [selectedRepo, path, treeEntries]);

  // Fetch commit info when a file is selected
  useEffect(() => {
    if (!selectedRepo || !selectedName || !selectedItem || selectedItem.type !== 'file') {
      setCommitInfo(null);
      setFileContent(null);
      return;
    }
    const [owner, repo] = selectedRepo.split('/');
    if (!owner || !repo) return;

    const filePath = [...path, selectedName].join('/');
    setCommitLoading(true);
    setCommitInfo(null);

    fetchFileCommit(owner, repo, filePath)
      .then(info => { setCommitInfo(info); setCommitLoading(false); })
      .catch(() => setCommitLoading(false));
  }, [selectedRepo, path, selectedName, selectedItem]);

  // Fetch commit dates for all files in current directory
  useEffect(() => {
    if (!selectedRepo || useMock) return;
    if (Object.keys(commitDates).length > 0) return; // already fetched
    if (Object.keys(currentDirEntries).length === 0) return;

    const [owner, repo] = selectedRepo.split('/');
    if (!owner || !repo) return;

    const filePaths = Object.entries(currentDirEntries)
      .filter(([, node]) => node.type === 'file')
      .map(([name]) => [...path, name].join('/'));

    if (filePaths.length === 0) return;

    setDatesLoading(true);
    fetchBulkCommitDates(owner, repo, filePaths)
      .then(dates => {
        // Normalize keys to just filenames
        const normalized: Record<string, string> = {};
        for (const [fullPath, date] of Object.entries(dates)) {
          const name = fullPath.split('/').pop()!;
          normalized[name] = date;
        }
        setCommitDates(normalized);
        setDatesLoading(false);
      })
      .catch(() => setDatesLoading(false));
  }, [selectedRepo, currentDirEntries, path, useMock, commitDates]);

  // Sync hash
  useEffect(() => {
    if (selectedRepo) {
      const pathStr = [selectedRepo, ...path].join('/');
      window.location.hash = encodeURIComponent(pathStr);
    }
  }, [selectedRepo, path]);

  // Mock tree for sidebar
  const mockRepo = selectedRepo ? MOCK_REPOS[selectedRepo] : null;
  const mockTree = useMock && mockRepo ? mockRepo.tree : null;

  // Dynamic tabs
  const tabs: Tab[] = useMemo(() => {
    if (!historyFile) return BASE_TABS;
    return [...BASE_TABS, { id: 'history', label: `History: ${historyFile.name}`, closable: true }];
  }, [historyFile]);

  const handleViewHistory = useCallback(() => {
    if (!selectedName) return;
    const filePath = [...path, selectedName].join('/');
    setHistoryFile({ name: selectedName, path: filePath });
    setActiveTab('history');
  }, [selectedName, path]);

  const handleViewIntelligence = useCallback(() => {
    if (!selectedName) return;
    setShowIntelligenceModal(true);
  }, [selectedName]);

  const handleTabClose = useCallback((tabId: string) => {
    if (tabId === 'history') {
      setHistoryFile(null);
      if (activeTab === 'history') setActiveTab('files');
    }
  }, [activeTab]);

  // Filter + sort entries
  const filteredEntries: [string, TreeNode][] = useMemo(() => {
    let entries = Object.entries(currentDirEntries);

    if (searchQuery) {
      entries = entries
        .map(([name, node]) => ({ name, node, ...fuzzyMatch(searchQuery, name) }))
        .filter(e => e.match)
        .sort((a, b) => b.score - a.score)
        .map(e => [e.name, e.node] as [string, TreeNode]);
    }

    switch (sortPreset) {
      case 'largest':
        entries.sort(([, a], [, b]) => {
          const sa = a.type === 'file' ? a.size : -1;
          const sb = b.type === 'file' ? b.size : -1;
          return sb - sa;
        });
        break;
      case 'smallest':
        entries.sort(([, a], [, b]) => {
          const sa = a.type === 'file' ? a.size : Infinity;
          const sb = b.type === 'file' ? b.size : Infinity;
          return sa - sb;
        });
        break;
      case 'oldest':
        entries.sort(([nameA, a], [nameB, b]) => {
          const da = commitDates[nameA] ?? '';
          const db = commitDates[nameB] ?? '';
          if (da && db) return new Date(da).getTime() - new Date(db).getTime();
          if (da) return -1;
          if (db) return 1;
          if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
          return nameA.localeCompare(nameB);
        });
        break;
      case 'newest':
        entries.sort(([nameA, a], [nameB, b]) => {
          const da = commitDates[nameA] ?? '';
          const db = commitDates[nameB] ?? '';
          if (da && db) return new Date(db).getTime() - new Date(da).getTime();
          if (da) return -1;
          if (db) return 1;
          if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
          return nameA.localeCompare(nameB);
        });
        break;
      case 'name-asc':
        entries.sort(([a], [b]) => a.localeCompare(b));
        break;
      case 'name-desc':
        entries.sort(([a], [b]) => b.localeCompare(a));
        break;
      default:
        entries.sort(([nameA, a], [nameB, b]) => {
          if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
          return nameA.localeCompare(nameB);
        });
    }

    return entries;
  }, [currentDirEntries, searchQuery, sortPreset, commitDates]);

  const handleRowClick = (name: string, node: TreeNode) => {
    if (node.type === 'dir') {
      setPath(p => [...p, name]);
      setSelectedItem(null);
      setSelectedName(null);
    } else {
      setSelectedItem(node);
      setSelectedName(name);
    }
    // Clear dynamic tabs when selecting a different item
    if (historyFile) { setHistoryFile(null); }
    if (activeTab === 'history') setActiveTab('files');
    setShowIntelligenceModal(false);
  };

  const handleBreadcrumb = (idx: number) => {
    setPath(p => p.slice(0, idx));
    setSelectedItem(null);
    setSelectedName(null);
    if (historyFile) { setHistoryFile(null); }
    if (activeTab === 'history') setActiveTab('files');
    setShowIntelligenceModal(false);
  };

  const handleChangeRepo = (key: string) => {
    setSelectedRepo(key);
    setPath([]);
    setHistoryFile(null);
    setShowIntelligenceModal(false);
    setSelectedItem(null);
    setSelectedName(null);
  };

  const handleViewContent = useCallback(() => {
    if (!selectedRepo || !selectedName) return;
    const [owner, repo] = selectedRepo.split('/');
    if (!owner || !repo) return;

    const filePath = [...path, selectedName].join('/');
    setContentLoading(true);
    fetchFileContent(owner, repo, filePath)
      .then(data => {
        setFileContent(data);
        if (data) setShowContentModal(true);
        setContentLoading(false);
      })
      .catch(() => setContentLoading(false));
  }, [selectedRepo, path, selectedName]);

  const hasEntries = filteredEntries.length > 0 || dirLoading || Object.keys(currentDirEntries).length > 0;

  return (
    <div className="bg-[#f8f9fb] min-h-screen text-slate-700 flex flex-col">
      <TopBar apiRepos={apiRepos} selectedRepoKey={selectedRepo} onChangeRepo={handleChangeRepo} loading={loading} repoDetails={repoDetails} />
      <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} onTabClose={handleTabClose} />

      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 53px - 42px)' }}>
        {activeTab === 'files' && (
          <>
            {hasEntries ? (
              <>
                {mockTree && <TreeSidebar tree={mockTree} currentPath={path} onNavigate={setPath} />}
                <div className="flex-1 overflow-y-auto flex flex-col bg-[#f8f9fb]">
                  <Breadcrumb repoKey={selectedRepo ?? ''} path={path} onNavigate={handleBreadcrumb} />
                  {dirLoading ? (
                    <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                      Loading directory contents...
                    </div>
                  ) : (
                    <FileTable
                      entries={filteredEntries}
                      selectedName={selectedName}
                      onRowClick={handleRowClick}
                      searchQuery={searchQuery}
                      onSearchChange={setSearchQuery}
                      sortPreset={sortPreset}
                      onSortPreset={setSortPreset}
                      commitDates={commitDates}
                      datesLoading={datesLoading}
                    />
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                {loading ? 'Loading repositories...' : selectedRepo ? 'No file tree data available for this repository' : 'Select a repository to explore'}
              </div>
            )}

            {selectedItem && selectedName && (
              <MetaPanel
                item={selectedItem}
                name={selectedName}
                repoDetails={repoDetails}
                commitInfo={commitInfo}
                commitLoading={commitLoading}
                contentLoading={contentLoading}
                vulnAlerts={vulnAlerts}
                onViewContent={handleViewContent}
                onViewHistory={handleViewHistory}
                onViewIntelligence={handleViewIntelligence}
                onClose={() => { setSelectedItem(null); setSelectedName(null); setFileContent(null); }}
              />
            )}
          </>
        )}

        {activeTab === 'history' && historyFile && selectedRepo && (() => {
          const [owner, repo] = selectedRepo.split('/');
          if (!owner || !repo) return null;
          return (
            <FileHistoryTab
              owner={owner}
              repo={repo}
              filePath={historyFile.path}
              fileName={historyFile.name}
            />
          );
        })()}

      </div>

      {/* Intelligence modal */}
      {showIntelligenceModal && selectedRepo && selectedName && (() => {
        const [owner, repo] = selectedRepo.split('/');
        if (!owner || !repo) return null;
        const filePath = [...path, selectedName].join('/');
        return (
          <FileIntelligenceModal
            owner={owner}
            repo={repo}
            filePath={filePath}
            fileName={selectedName}
            onClose={() => setShowIntelligenceModal(false)}
          />
        );
      })()}

      {/* Content viewer modal */}
      {showContentModal && fileContent && selectedItem?.type === 'file' && selectedName && (
        <ContentModal
          name={selectedName}
          content={fileContent.content}
          size={fileContent.size}
          lang={selectedItem.lang}
          onClose={() => setShowContentModal(false)}
        />
      )}
    </div>
  );
}

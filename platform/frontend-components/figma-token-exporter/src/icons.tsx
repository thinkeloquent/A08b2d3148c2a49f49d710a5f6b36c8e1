import type { ReactNode } from 'react';

export const Icons: Record<string, ReactNode> = {
  chev: <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M3 1.5L7 5 3 8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  chevD: <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5L5 6.5 8 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  search: <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.2"/><path d="M8.5 8.5l3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  grid: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.1"/><rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.1"/><rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.1"/><rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.1"/></svg>,
  graph: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="3" cy="3" r="2" stroke="currentColor" strokeWidth="1.1"/><circle cx="11" cy="7" r="2" stroke="currentColor" strokeWidth="1.1"/><circle cx="3" cy="11" r="2" stroke="currentColor" strokeWidth="1.1"/><path d="M5 3.5l4 2.5M5 10.5l4-2.5" stroke="currentColor" strokeWidth="1.1"/></svg>,
  warn: <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1L1 10.5h10L6 1z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/><path d="M6 5v2.5M6 8.5v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  link: <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M4.5 6.5a2 2 0 003 0l1.5-1.5a2 2 0 00-3-3L5 3" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/><path d="M6.5 4.5a2 2 0 00-3 0L2 6a2 2 0 003 3l1-1" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>,
  copy: <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="4" y="4" width="6" height="6" rx=".8" stroke="currentColor" strokeWidth="1.1"/><path d="M8 4V2.5a.8.8 0 00-.8-.8H2.8a.8.8 0 00-.8.8V7a.8.8 0 00.8.8H4" stroke="currentColor" strokeWidth="1.1"/></svg>,
  check: <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  close: <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  arrow: <svg width="14" height="8" viewBox="0 0 14 8" fill="none"><path d="M0 4h12M10 1l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

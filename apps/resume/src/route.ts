// Hash routes: #/ (resumes), #/new, #/resume/<id>, #/applications, #/applications/new, #/welcome.
import { useEffect, useState } from 'react';

export type Route = { page: 'resumes'; creating: boolean } | { page: 'editor'; id: string } | { page: 'applications'; adding: boolean } | { page: 'welcome' };

export function parse(hash: string): Route {
  const path = hash.replace(/^#/, '') || '/';
  const editor = /^\/resume\/([^/]+)$/.exec(path);
  if (editor) return { page: 'editor', id: decodeURIComponent(editor[1]) };
  if (path === '/welcome') return { page: 'welcome' };
  if (path.startsWith('/applications')) return { page: 'applications', adding: path === '/applications/new' };
  return { page: 'resumes', creating: path === '/new' };
}

export const go = (path: string) => {
  location.hash = path;
};

export function useRoute() {
  const [route, setRoute] = useState(() => parse(location.hash));
  useEffect(() => {
    const on = () => setRoute(parse(location.hash));
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

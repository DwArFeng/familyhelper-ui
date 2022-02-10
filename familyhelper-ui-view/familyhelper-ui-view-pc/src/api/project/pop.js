import { get } from '@/util/http';

export function exists(key) {
  return get('project', `pop/${key}/exists/`, {});
}

export function inspect(key) {
  return get('project', `pop/${key}/`, {});
}

export function inspectDisp(key) {
  return get('project', `pop/${key}/disp/`, {});
}

export function childForProject(projectKey, page, rows) {
  return get('project', `project/${projectKey}/pop/`, {
    page,
    rows,
  });
}

export function childForProjectDisp(projectKey, page, rows) {
  return get('project', `project/${projectKey}/pop/disp/`, {
    page,
    rows,
  });
}

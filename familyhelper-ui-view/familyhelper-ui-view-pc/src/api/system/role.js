import {
  get,
} from '@/util/http';

export function exists(key) {
  return get('system', `role/${key}/exists/`, {});
}

export function inspect(key) {
  return get('system', `role/${key}/`, {});
}

export function all(page, rows) {
  return get('system', 'role/all/', {
    page,
    rows,
  });
}

export function childForAccount(accountKey, page, rows) {
  return get('system', `account/${accountKey}/role/`, {
    page,
    rows,
  });
}

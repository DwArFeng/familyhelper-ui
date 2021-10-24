import {
  get, post,
} from '@/util/http';

export function exists(key) {
  return get('finance', `account-book/${key}/exists/`, {});
}

export function inspect(key) {
  return get('finance', `account-book/${key}/`, {});
}

export function all(page, rows) {
  return get('finance', 'account-book/all/', {
    page,
    rows,
  });
}

export function allPermitted(page, rows) {
  return get('finance', 'account-book/all-permitted/disp/', {
    page,
    rows,
  });
}

export function allOwned(page, rows) {
  return get('finance', 'account-book/all-owned/disp/', {
    page,
    rows,
  });
}

export function create(name, remark) {
  return post('finance', 'account-book/create', {
    name,
    remark,
  });
}

export function update(key, name, remark) {
  return post('finance', `account-book/${key}/update`, {
    name,
    remark,
  });
}

export function remove(key) {
  return post('finance', `account-book/${key}/remove`, {});
}

export function recordCommit(key) {
  return post('finance', `account-book/${key}/record-commit`, {});
}

export function rollbackAll(key) {
  return post('finance', `account-book/${key}/rollback-all`, {});
}

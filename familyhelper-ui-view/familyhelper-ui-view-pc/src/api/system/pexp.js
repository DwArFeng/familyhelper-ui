import {
  del, get, patch, post,
} from '@/util/http';

export function exists(key) {
  return get('system', `pexp/${key}/exists/`, {});
}

export function inspect(key) {
  return get('system', `pexp/${key}/`, {});
}

export function insert(key, roleKey, content, remark) {
  let finalKey = { long_id: key };
  let finalRoleKey = { string_id: roleKey };
  if (key === '') {
    finalKey = null;
  }
  if (roleKey === '') {
    finalRoleKey = null;
  }
  return post('system', 'pexp/', {
    key: finalKey,
    role_key: finalRoleKey,
    content,
    remark,
  });
}

export function remove(key) {
  return del('system', `pexp/${key}/`, {});
}

export function update(key, roleKey, content, remark) {
  let finalRoleKey = { string_id: roleKey };
  if (roleKey === '') {
    finalRoleKey = null;
  }
  return patch('system', 'pexp/', {
    key: {
      long_id: key,
    },
    role_key: finalRoleKey,
    content,
    remark,
  });
}

export function childForRole(roleKey, page, rows) {
  return get('system', `role/${roleKey}/pexp/`, {
    page,
    rows,
  });
}

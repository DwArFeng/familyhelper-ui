import {
  get, post,
} from '@/util/http';

export function exists(key) {
  return get('system', `account/${key}/exists/`, {});
}

export function inspect(key) {
  return get('system', `account/${key}/`, {});
}

export function resetRoleRelation(key, roleKeys) {
  return post('system', `account/${key}/reset-role-relation`, roleKeys);
}

export function all(page, rows) {
  return get('system', 'account/all/', {
    page,
    rows,
  });
}

export function childForRole(roleKey, page, rows) {
  return get('system', `role/${roleKey}/account/`, {
    page,
    rows,
  });
}

export function childForProfileGuest(profileKey, page, rows) {
  return get('system', `profile/${profileKey}/account/guest/`, {
    page,
    rows,
  });
}

export function inspectDisp(key) {
  return get('system', `account/${key}/disp/`, {});
}

export function register(key, displayName, enabled, remark, password) {
  return post('system', 'account/register', {
    account_key: {
      string_id: key,
    },
    display_name: displayName,
    enabled,
    remark,
    password,
  });
}

export function update(key, displayName, enabled, remark) {
  return post('system', 'account/update', {
    account_key: {
      string_id: key,
    },
    display_name: displayName,
    enabled,
    remark,
  });
}

export function remove(key) {
  return post('system', 'account/remove', {
    string_id: key,
  });
}

export function updatePassword(key, oldPassword, newPassword) {
  return post('system', 'account/update-password', {
    account_key: {
      string_id: key,
    },
    old_password: oldPassword,
    new_password: newPassword,
  });
}

export function resetPassword(key, newPassword) {
  return post('system', 'account/reset-password', {
    account_key: {
      string_id: key,
    },
    new_password: newPassword,
  });
}

export function invalid(key) {
  return post('system', 'account/invalid', {
    string_id: key,
  });
}

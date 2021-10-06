import { get, post } from '@/util/http';

export function login(accountId, password) {
  return post('system', 'login', {
    account_id: accountId,
    password,
  });
}

export function postpone() {
  return post('system', 'postpone', {});
}

export function myLoginState() {
  return get('system', 'my-login-state', {});
}

export function logout() {
  return post('system', 'logout', {});
}

export function myPermissions() {
  return get('system', 'my-permissions', {});
}

import {get} from '@/util/http';

export function exists(key) {
    return get('system', `login-state/${key}/exists/`, {});
}

export function inspect(key) {
    return get('system', `login-state/${key}/`, {});
}

export function all(page, rows) {
    return get('system', 'login-state/all/', {
        page,
        rows,
    });
}

export function childForAccount(accountId, page, rows) {
    return get('system', `account/${accountId}/login-state`, {
        page,
        rows,
    });
}

export function childForAccountTypeEqualsDynamic(accountId, page, rows) {
    return get('system', `account/${accountId}/login-state/type-equals-dynamic`, {
        page,
        rows,
    });
}

export function childForAccountTypeEqualsStatic(accountId, page, rows) {
    return get('system', `account/${accountId}/login-state/type-equals-static`, {
        page,
        rows,
    });
}

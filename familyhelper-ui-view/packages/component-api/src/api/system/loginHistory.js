// noinspection NpmUsedModulesInstalled,JSUnusedGlobalSymbols

import {get} from '@/util/http';

export function exists(key) {
    return get('system', `login-history/${key}/exists/`, {});
}

export function inspect(key) {
    return get('system', `login-history//${key}/`, {});
}

export function all(page, rows) {
    return get('system', 'login-history/all/', {
        page,
        rows,
    });
}

export function accountIdEquals(pattern, page, rows) {
    return get('system', 'login-history/account-id-equals/', {
        pattern,
        page,
        rows,
    });
}

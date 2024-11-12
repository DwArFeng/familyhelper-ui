// noinspection NpmUsedModulesInstalled,JSUnusedGlobalSymbols

import {get} from '@/util/http';

export function exists(key) {
    return get('system', `derive-history/${key}/exists/`, {});
}

export function inspect(key) {
    return get('system', `derive-history//${key}/`, {});
}

export function all(page, rows) {
    return get('system', 'derive-history/all/', {
        page,
        rows,
    });
}

export function accountIdEquals(pattern, page, rows) {
    return get('system', 'derive-history/account-id-equals/', {
        pattern,
        page,
        rows,
    });
}

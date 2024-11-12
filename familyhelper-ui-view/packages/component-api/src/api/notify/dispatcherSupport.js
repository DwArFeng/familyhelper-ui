// noinspection NpmUsedModulesInstalled,JSUnusedGlobalSymbols

import {get} from '@/util/http';

export function exists(key) {
    return get('notify', `dispatcher-support/${key}/exists/`, {});
}

export function inspect(key) {
    return get('notify', `dispatcher-support/${key}/`, {});
}

export function all(page, rows) {
    return get('notify', 'dispatcher-support/all/', {
        page,
        rows,
    });
}

export function idLike(pattern, page, rows) {
    return get('notify', 'dispatcher-support/id-like/', {
        pattern,
        page,
        rows,
    });
}

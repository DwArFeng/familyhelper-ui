// noinspection NpmUsedModulesInstalled,JSUnusedGlobalSymbols

import { get } from '@/util/http';

export function exists(key) {
    return get('settingrepo', `formatter-support/${key}/exists/`, {});
}

export function inspect(key) {
    return get('settingrepo', `formatter-support/${key}/`, {});
}

export function all(page, rows) {
    return get('settingrepo', 'formatter-support/all/', {
        page,
        rows,
    });
}

export function idLike(pattern, page, rows) {
    return get('settingrepo', 'formatter-support/id-like/', {
        pattern,
        page,
        rows,
    });
}

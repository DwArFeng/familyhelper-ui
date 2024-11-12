// noinspection NpmUsedModulesInstalled,JSUnusedGlobalSymbols

import {get, post} from '@/util/http';

export function exists(key) {
    return get('settingrepo', `setting-node/${key}/exists/`, {});
}

export function inspect(key) {
    return get('settingrepo', `setting-node/${key}/`, {});
}

export function all(page, rows) {
    return get('settingrepo', 'setting-node/all/', {
        page,
        rows,
    });
}

export function idLike(pattern, page, rows) {
    return get('settingrepo', 'setting-node/id-like/', {
        pattern,
        page,
        rows,
    });
}

export function reachable(page, rows) {
    return get('settingrepo', 'setting-node/reachable/', {
        page,
        rows,
    });
}

export function idLikeReachable(pattern, page, rows) {
    return get('settingrepo', 'setting-node/id-like-reachable/', {
        pattern,
        page,
        rows,
    });
}

export function operateInspect(category, args) {
    return post('settingrepo', 'setting-node/inspect/', {
        category,
        args
    });
}

export function operateInit(category, args, type, remark) {
    return post('settingrepo', 'setting-node/init/', {
        category,
        args,
        type,
        remark
    });
}

export function operateRemove(category, args) {
    return post('settingrepo', 'setting-node/remove/', {
        category,
        args
    });
}

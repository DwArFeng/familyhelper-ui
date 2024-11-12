// noinspection NpmUsedModulesInstalled,JSUnusedGlobalSymbols

import {
    del, get, patch, post,
} from '@/util/http';

export function exists(key) {
    return get('notify', `router-info/${key}/exists/`, {});
}

export function inspect(key) {
    return get('notify', `router-info/${key}/`, {});
}

export function insert(key, label, type, param, remark) {
    let finalKey = {long_id: key};
    if (key === '') {
        finalKey = null;
    }
    return post('notify', 'router-info/', {
        key: finalKey,
        label,
        type,
        param,
        remark,
    });
}

export function remove(key) {
    return del('notify', `router-info/${key}/`, {});
}

export function update(key, label, type, param, remark) {
    return patch('notify', 'router-info/', {
        key: {
            long_id: key,
        },
        label,
        type,
        param,
        remark,
    });
}

export function all(page, rows) {
    return get('notify', 'router-info/all/', {
        page,
        rows,
    });
}

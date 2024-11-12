// noinspection NpmUsedModulesInstalled,JSUnusedGlobalSymbols

import {
    del, get, patch, post,
} from '@/util/http';

export function exists(key) {
    return get('assets', `item-type-indicator/${key}/exists/`, {});
}

export function inspect(key) {
    return get('assets', `item-type-indicator/${key}/`, {});
}

export function insert(key, label, remark) {
    let finalKey = {string_id: key};
    if (key === '') {
        finalKey = null;
    }
    return post('assets', 'item-type-indicator/', {
        key: finalKey,
        label,
        remark,
    });
}

export function remove(key) {
    return del('assets', `item-type-indicator/${key}/`, {});
}

export function update(key, label, remark) {
    return patch('assets', 'item-type-indicator/', {
        key: {
            string_id: key,
        },
        label,
        remark,
    });
}

export function all(page, rows) {
    return get('assets', 'item-type-indicator/all/', {
        page,
        rows,
    });
}

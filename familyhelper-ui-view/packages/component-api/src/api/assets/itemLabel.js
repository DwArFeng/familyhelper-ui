// noinspection NpmUsedModulesInstalled,JSUnusedGlobalSymbols

import {
    del, get, patch, post,
} from '@/util/http';

export function exists(key) {
    return get('assets', `item-label/${key}/exists/`, {});
}

export function inspect(key) {
    return get('assets', `item-label/${key}/`, {});
}

export function insert(key, label, remark) {
    let finalKey = {string_id: key};
    if (key === '') {
        finalKey = null;
    }
    return post('assets', 'item-label/', {
        key: finalKey,
        label,
        remark,
    });
}

export function remove(key) {
    return del('assets', `item-label/${key}/`, {});
}

export function update(key, label, remark) {
    return patch('assets', 'item-label/', {
        key: {
            string_id: key,
        },
        label,
        remark,
    });
}

export function allExists(keys) {
    return post('assets', 'item-label/all-exists/', keys);
}

export function all(page, rows) {
    return get('assets', 'item-label/all/', {
        page,
        rows,
    });
}

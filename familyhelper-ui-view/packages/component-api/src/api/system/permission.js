// noinspection NpmUsedModulesInstalled,JSUnusedGlobalSymbols

import {
    del, get, patch, post,
} from '@/util/http';

export function exists(key) {
    return get('system', `permission/${key}/exists/`, {});
}

export function inspect(key) {
    return get('system', `permission/${key}/`, {});
}

export function insert(key, groupKey, name, remark) {
    let finalKey = {string_id: key};
    let finalGroupKey = {string_id: groupKey};
    if (key === '') {
        finalKey = null;
    }
    if (groupKey === '') {
        finalGroupKey = null;
    }
    return post('system', 'permission/', {
        key: finalKey,
        group_key: finalGroupKey,
        name,
        remark,
    });
}

export function remove(key) {
    return del('system', `permission/${key}/`, {});
}

export function update(key, groupKey, name, remark) {
    let finalGroupKey = {string_id: groupKey};
    if (groupKey === '') {
        finalGroupKey = null;
    }
    return patch('system', 'permission/', {
        key: {
            string_id: key,
        },
        group_key: finalGroupKey,
        name,
        remark,
    });
}

export function all(page, rows) {
    return get('system', 'permission/all/', {
        page,
        rows,
    });
}

export function idLike(pattern, page, rows) {
    return get('system', 'permission/id-like/', {
        pattern,
        page,
        rows,
    });
}

export function childForGroup(key, page, rows) {
    return get('system', `permission-group/${key}/permission`, {
        page,
        rows,
    });
}

export function lookupForUser(userId) {
    return post('system', 'permission/lookup-for-user', {
        string_id: userId,
    });
}

// noinspection NpmUsedModulesInstalled,JSUnusedGlobalSymbols

import {del, get, patch, post,} from '@/util/http';

export function exists(key) {
    return get('project', `memo-remind-driver-info/${key}/exists/`, {});
}

export function inspect(key) {
    return get('project', `memo-remind-driver-info/${key}/`, {});
}

export function insert(key, memoKey, enabled, type, param, message, remark) {
    let finalKey = {long_id: key};
    if (key === '') {
        finalKey = null;
    }
    let finalMemoKey = {long_id: memoKey};
    if (memoKey === '') {
        finalMemoKey = null;
    }
    return post('project', 'memo-remind-driver-info/', {
        key: finalKey,
        memo_key: finalMemoKey,
        enabled,
        type,
        param,
        message,
        remark,
    });
}

export function remove(key) {
    return del('project', `memo-remind-driver-info/${key}/`, {});
}

export function update(key, memoKey, enabled, type, param, message, remark) {
    let finalMemoKey = {long_id: memoKey};
    if (memoKey === '') {
        finalMemoKey = null;
    }
    return patch('project', 'memo-remind-driver-info/', {
        key: {
            long_id: key,
        },
        memo_key: finalMemoKey,
        enabled,
        type,
        param,
        message,
        remark,
    });
}

export function childForMemo(memoKey, page, rows) {
    return get('project', `memo/${memoKey}/memo-remind-driver-info/`, {
        page,
        rows,
    });
}

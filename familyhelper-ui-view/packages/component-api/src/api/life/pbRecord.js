// noinspection NpmUsedModulesInstalled,JSUnusedGlobalSymbols

import {get, post,} from '@/util/http';

export function exists(key) {
    return get('life', `pb-record/${key}/exists/`, {});
}

export function inspect(key) {
    return get('life', `pb-record/${key}/`, {});
}

export function all(page, rows) {
    return get('life', 'pb-record/all/', {
        page,
        rows,
    });
}

export function childForPbItemRecordedDateAsc(pbItemKey, page, rows) {
    return get('life', `pb-item/${pbItemKey}/pb-record/recorded-date-asc`, {
        page,
        rows,
    });
}

export function childForPbItemRecordedDateDesc(pbItemKey, page, rows) {
    return get('life', `pb-item/${pbItemKey}/pb-record/recorded-date-desc`, {
        page,
        rows,
    });
}

export function create(itemKey, value, remark) {
    return post('life', 'pb-record/create', {
        item_key: {
            long_id:itemKey
        },
        value,
        remark,
    });
}

export function update(key, value, remark) {
    return post('life', 'pb-record/update', {
        key: {
            long_id: key,
        },
        value,
        remark,
    });
}

export function remove(key) {
    return post('life', 'pb-record/remove', {
        long_id: key,
    });
}

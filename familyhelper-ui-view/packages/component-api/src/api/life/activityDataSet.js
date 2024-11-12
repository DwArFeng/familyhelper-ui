// noinspection NpmUsedModulesInstalled,JSUnusedGlobalSymbols

import {
    get, post,
} from '@/util/http';

export function exists(key) {
    return get('life', `activity-data-set/${key}/exists/`, {});
}

export function inspect(key) {
    return get('life', `activity-data-set/${key}/`, {});
}

export function all(page, rows) {
    return get('life', 'activity-data-set/all/', {
        page,
        rows,
    });
}

export function allPermitted(page, rows) {
    return get('life', 'activity-data-set/all-permitted/', {
        page,
        rows,
    });
}

export function allOwned(page, rows) {
    return get('life', 'activity-data-set/all-owned/', {
        page,
        rows,
    });
}

export function inspectDisp(key) {
    return get('life', `activity-data-set/${key}/disp/`, {});
}

export function allPermittedDisp(page, rows) {
    return get('life', 'activity-data-set/all-permitted/disp/', {
        page,
        rows,
    });
}

export function allOwnedDisp(page, rows) {
    return get('life', 'activity-data-set/all-owned/disp/', {
        page,
        rows,
    });
}

export function create(name, remark) {
    return post('life', 'activity-data-set/create', {
        name,
        remark,
    });
}

export function update(key, name, remark) {
    return post('life', 'activity-data-set/update', {
        activity_data_set_key: {
            long_id: key,
        },
        name,
        remark,
    });
}

export function remove(key) {
    return post('life', 'activity-data-set/remove', {
        long_id: key,
    });
}

export function upsertPermission(pbSetKey, userKey, permissionLevel) {
    return post('life', 'activity-data-set/upsert-permission', {
        activity_data_set_key: {
            long_id: pbSetKey,
        },
        user_key: {
            string_id: userKey,
        },
        permission_level: permissionLevel,
    });
}

export function removePermission(pbSetKey, userKey) {
    return post('life', 'activity-data-set/remove-permission', {
        activity_data_set_key: {
            long_id: pbSetKey,
        },
        user_key: {
            string_id: userKey,
        },
    });
}

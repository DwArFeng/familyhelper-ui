import {
    get, post,
} from '@/util/http';

export function exists(key) {
    return get('life', `pb-set/${key}/exists/`, {});
}

export function inspect(key) {
    return get('life', `pb-set/${key}/`, {});
}

export function all(page, rows) {
    return get('life', 'pb-set/all/', {
        page,
        rows,
    });
}

export function allPermitted(page, rows) {
    return get('life', 'pb-set/all-permitted/', {
        page,
        rows,
    });
}

export function allOwned(page, rows) {
    return get('life', 'pb-set/all-owned/', {
        page,
        rows,
    });
}

export function inspectDisp(key) {
    return get('life', `pb-set/${key}/disp/`, {});
}

export function allPermittedDisp(page, rows) {
    return get('life', 'pb-set/all-permitted/disp/', {
        page,
        rows,
    });
}

export function allOwnedDisp(page, rows) {
    return get('life', 'pb-set/all-owned/disp/', {
        page,
        rows,
    });
}

export function create(name, remark) {
    return post('life', 'pb-set/create', {
        name,
        remark,
    });
}

export function update(key, name, remark) {
    return post('life', 'pb-set/update', {
        pb_set_key: {
            long_id: key,
        },
        name,
        remark,
    });
}

export function remove(key) {
    return post('life', 'pb-set/remove', {
        long_id: key,
    });
}

export function upsertPermission(pbSetKey, userKey, permissionLevel) {
    return post('life', 'pb-set/upsert-permission', {
        pb_set_key: {
            long_id: pbSetKey,
        },
        user_key: {
            string_id: userKey,
        },
        permission_level: permissionLevel,
    });
}

export function removePermission(pbSetKey, userKey) {
    return post('life', 'pb-set/remove-permission', {
        pb_set_key: {
            long_id: pbSetKey,
        },
        user_key: {
            string_id: userKey,
        },
    });
}

export function recordCommit(key) {
    return post('life', 'pb-set/record-commit', {
        long_id: key,
    });
}

export function rollbackAll(key) {
    return post('life', 'pb-set/rollback-all', {
        long_id: key,
    });
}

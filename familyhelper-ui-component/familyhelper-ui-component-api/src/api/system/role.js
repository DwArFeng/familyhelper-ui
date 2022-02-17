import {
    del, get, patch, post,
} from '@/util/http';

export function exists(key) {
    return get('system', `role/${key}/exists/`, {});
}

export function inspect(key) {
    return get('system', `role/${key}/`, {});
}

export function insert(key, name, enabled, remark) {
    return post('system', 'role/', {
        key: {
            string_id: key,
        },
        name,
        enabled,
        remark,
    });
}

export function remove(key) {
    return del('system', `role/${key}/`, {});
}

export function update(key, name, enabled, remark) {
    return patch('system', 'role/', {
        key: {
            string_id: key,
        },
        name,
        enabled,
        remark,
    });
}

export function all(page, rows) {
    return get('system', 'role/all/', {
        page,
        rows,
    });
}

export function childForAccount(accountKey, page, rows) {
    return get('system', `account/${accountKey}/role/`, {
        page,
        rows,
    });
}

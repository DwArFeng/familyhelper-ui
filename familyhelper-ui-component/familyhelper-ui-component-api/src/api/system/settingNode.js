import {
    del, get, patch, post,
} from '@/util/http';

export function exists(key) {
    return get('system', `setting-node/${key}/exists/`, {});
}

export function inspect(key) {
    return get('system', `setting-node/${key}/`, {});
}

export function insert(key, value, remark) {
    return post('system', 'setting-node/', {
        key: {
            string_id: key,
        },
        value,
        remark,
    });
}

export function remove(key) {
    return del('system', `setting-node/${key}/`, {});
}

export function update(key, value, remark) {
    return patch('system', 'setting-node/', {
        key: {
            string_id: key,
        },
        value,
        remark,
    });
}

export function all(page, rows) {
    return get('system', 'setting-node/all/', {
        page,
        rows,
    });
}

export function idLike(pattern, page, rows) {
    return get('system', 'setting-node/id-like/', {
        pattern,
        page,
        rows,
    });
}

import {
    del, get, patch, post,
} from '@/util/http';

export function exists(key) {
    return get('settingrepo', `setting-node/${key}/exists/`, {});
}

export function inspect(key) {
    return get('settingrepo', `setting-node/${key}/`, {});
}

export function insert(key, value, remark) {
    return post('settingrepo', 'setting-node/', {
        key: {
            string_id: key,
        },
        value,
        remark,
    });
}

export function remove(key) {
    return del('settingrepo', `setting-node/${key}/`, {});
}

export function update(key, value, remark) {
    return patch('settingrepo', 'setting-node/', {
        key: {
            string_id: key,
        },
        value,
        remark,
    });
}

export function all(page, rows) {
    return get('settingrepo', 'setting-node/all/', {
        page,
        rows,
    });
}

export function idLike(pattern, page, rows) {
    return get('settingrepo', 'setting-node/id-like/', {
        pattern,
        page,
        rows,
    });
}

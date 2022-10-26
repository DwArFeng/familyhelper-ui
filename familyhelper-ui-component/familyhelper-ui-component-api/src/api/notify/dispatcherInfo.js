import {
    del, get, patch, post,
} from '@/util/http';

export function exists(key) {
    return get('notify', `dispatcher-info/${key}/exists/`, {});
}

export function inspect(key) {
    return get('notify', `dispatcher-info/${key}/`, {});
}

export function insert(key, label, type, param, remark) {
    let finalKey = {string_id: key};
    if (key === '') {
        finalKey = null;
    }
    return post('notify', 'dispatcher-info/', {
        key: finalKey,
        label,
        type,
        param,
        remark,
    });
}

export function remove(key) {
    return del('notify', `dispatcher-info/${key}/`, {});
}

export function update(key, label, type, param, remark) {
    return patch('notify', 'dispatcher-info/', {
        key: {
            string_id: key,
        },
        label,
        type,
        param,
        remark,
    });
}

export function all(page, rows) {
    return get('notify', 'dispatcher-info/all/', {
        page,
        rows,
    });
}

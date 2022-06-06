import {
    del, get, patch, post,
} from '@/util/http';

export function exists(key) {
    return get('notify', `sender-info/${key}/exists/`, {});
}

export function inspect(key) {
    return get('notify', `sender-info/${key}/`, {});
}

export function insert(key, label, type, param, remark) {
    let finalKey = {long_id: key};
    if (key === '') {
        finalKey = null;
    }
    return post('notify', 'sender-info/', {
        key: finalKey,
        label,
        type,
        param,
        remark,
    });
}

export function remove(key) {
    return del('notify', `sender-info/${key}/`, {});
}

export function update(key, label, type, param, remark) {
    return patch('notify', 'sender-info/', {
        key: {
            long_id: key,
        },
        label,
        type,
        param,
        remark,
    });
}

export function all(page, rows) {
    return get('notify', 'sender-info/all/', {
        page,
        rows,
    });
}

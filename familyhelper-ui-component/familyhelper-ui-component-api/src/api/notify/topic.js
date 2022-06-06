import {
    del, get, patch, post,
} from '@/util/http';

export function exists(key) {
    return get('notify', `topic/${key}/exists/`, {});
}

export function inspect(key) {
    return get('notify', `topic/${key}/`, {});
}

export function insert(key, label, remark) {
    return post('notify', 'topic/', {
        key: {
            string_id: key,
        },
        label,
        remark,
    });
}

export function remove(key) {
    return del('notify', `topic/${key}/`, {});
}

export function update(key, label, remark) {
    return patch('notify', 'topic/', {
        key: {
            string_id: key,
        },
        label,
        remark,
    });
}

export function all(page, rows) {
    return get('notify', 'topic/all/', {
        page,
        rows,
    });
}

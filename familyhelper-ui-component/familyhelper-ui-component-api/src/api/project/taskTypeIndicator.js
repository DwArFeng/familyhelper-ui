import {
    del, get, patch, post,
} from '@/util/http';

export function exists(key) {
    return get('project', `task-type-indicator/${key}/exists/`, {});
}

export function inspect(key) {
    return get('project', `task-type-indicator/${key}/`, {});
}

export function insert(key, label, remark) {
    let finalKey = {string_id: key};
    if (key === '') {
        finalKey = null;
    }
    return post('project', 'task-type-indicator/', {
        key: finalKey,
        label,
        remark,
    });
}

export function remove(key) {
    return del('project', `task-type-indicator/${key}/`, {});
}

export function update(key, label, remark) {
    return patch('project', 'task-type-indicator/', {
        key: {
            string_id: key,
        },
        label,
        remark,
    });
}

export function all(page, rows) {
    return get('project', 'task-type-indicator/all/', {
        page,
        rows,
    });
}

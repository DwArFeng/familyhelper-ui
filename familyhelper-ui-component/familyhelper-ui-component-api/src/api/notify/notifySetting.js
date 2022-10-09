import {del, get, patch, post,} from '@/util/http';

export function exists(key) {
    return get('notify', `notify-setting/${key}/exists/`, {});
}

export function inspect(key) {
    return get('notify', `notify-setting/${key}/`, {});
}

export function insert(key, label, enabled, requiredPermission, remark,) {
    let finalKey = {long_id: key};
    if (key === '') {
        finalKey = null;
    }
    return post('notify', 'notify-setting/', {
        key: finalKey,
        label,
        enabled,
        required_permission: requiredPermission,
        remark,
    });
}

export function remove(key) {
    return del('notify', `notify-setting/${key}/`, {});
}

export function update(key, label, enabled, requiredPermission, remark) {
    return patch('notify', 'notify-setting/', {
        key: {
            long_id: key,
        },
        label,
        enabled,
        required_permission: requiredPermission,
        remark,
    });
}

export function all(page, rows) {
    return get('notify', 'notify-setting/all/', {
        page,
        rows,
    });
}

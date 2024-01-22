import {get, post,} from '@/util/http';

export function exists(key) {
    return get('life', `activity/${key}/exists/`, {});
}

export function inspect(key) {
    return get('life', `activity/${key}/`, {});
}

export function all(page, rows) {
    return get('life', 'activity/all/', {
        page,
        rows,
    });
}

export function allPermitted(page, rows) {
    return get('life', 'activity/all-permitted/', {
        page,
        rows,
    });
}

export function allOwned(page, rows) {
    return get('life', 'activity/all-owned/', {
        page,
        rows,
    });
}

export function inspectDisp(key) {
    return get('life', `activity/${key}/disp/`, {});
}

export function allPermittedDisp(page, rows) {
    return get('life', 'activity/all-permitted/disp/', {
        page,
        rows,
    });
}

export function allOwnedDisp(page, rows) {
    return get('life', 'activity/all-owned/disp/', {
        page,
        rows,
    });
}

export function create(activityType, name, score, remark, startDate, endDate) {
    return post('life', 'activity/create', {
        activity_type: activityType,
        name,
        score,
        remark,
        start_date: startDate,
        end_date: endDate,
    });
}

export function update(key, activityType, name, score, remark, startDate, endDate) {
    return post('life', 'activity/update', {
        activity_key: {
            long_id: key,
        },
        activity_type: activityType,
        name,
        score,
        remark,
        start_date: startDate,
        end_date: endDate,
    });
}

export function remove(key) {
    return post('life', 'activity/remove', {
        long_id: key,
    });
}

export function upsertPermission(activityKey, userKey, permissionLevel) {
    return post('life', 'activity/upsert-permission', {
        activity_key: {
            long_id: activityKey,
        },
        user_key: {
            string_id: userKey,
        },
        permission_level: permissionLevel,
    });
}

export function removePermission(activityKey, userKey) {
    return post('life', 'activity/remove-permission', {
        activity_key: {
            long_id: activityKey,
        },
        user_key: {
            string_id: userKey,
        },
    });
}

export function lock(activityKey) {
    return post('life', 'activity/lock', {
        long_id: activityKey,
    });
}

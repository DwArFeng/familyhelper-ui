import {get, post,} from '@/util/http';

export function exists(activityKey, userKey) {
    return get('life', `activity-participant/${activityKey}%26${userKey}/exists/`, {});
}

export function inspect(activityKey, userKey) {
    return get('life', `activity-participant/${key}/`, {});
}

export function inspectDisp(activityKey, userKey) {
    return get('life', `activity-participant/${key}/disp/`, {});
}

export function childForActivity(activityKey, page, rows) {
    return get('life', `activity/${activityKey}/activity-participant/`, {
        page,
        rows,
    });
}

export function childForActivityDisp(activityKey, page, rows) {
    return get('life', `activity/${activityKey}/activity-participant/disp/`, {
        page,
        rows,
    });
}

export function create(activityKey, userKey, remark) {
    return post('life', 'activity-participant/create', {
        activity_key: {
            long_id: activityKey,
        },
        user_key: {
            string_id: userKey,
        },
        remark,
    });
}

export function update(activityKey, userKey, remark) {
    return post('life', 'activity-participant/update', {
        key: {
            activity_long_id: activityKey,
            user_string_id: userKey,
        },
        remark,
    });
}

export function remove(activityKey, userKey) {
    return post('life', 'activity-participant/remove', {
        key: {
            activity_long_id: activityKey,
            user_string_id: userKey,
        },
    });
}

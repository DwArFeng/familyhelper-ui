import {get, post,} from '@/util/http';

export function exists(activityTemplateKey, userKey) {
    return get('life', `activity-template-participant/${activityTemplateKey}%26${userKey}/exists/`, {});
}

export function inspect(activityTemplateKey, userKey) {
    return get('life', `activity-template-participant/${key}/`, {});
}

export function inspectDisp(activityTemplateKey, userKey) {
    return get('life', `activity-template-participant/${key}/disp/`, {});
}

export function childForActivityTemplate(activityTemplateKey, page, rows) {
    return get('life', `activity-template/${activityTemplateKey}/activity-template-participant/`, {
        page,
        rows,
    });
}

export function childForActivityTemplateDisp(activityTemplateKey, page, rows) {
    return get('life', `activity-template/${activityTemplateKey}/activity-template-participant/disp/`, {
        page,
        rows,
    });
}

export function create(activityTemplateKey, userKey, remark) {
    return post('life', 'activity-template-participant/create', {
        activity_template_key: {
            long_id: activityTemplateKey,
        },
        user_key: {
            string_id: userKey,
        },
        remark,
    });
}

export function update(activityTemplateKey, userKey, remark) {
    return post('life', 'activity-template-participant/update', {
        key: {
            activity_template_long_id: activityTemplateKey,
            user_string_id: userKey,
        },
        remark,
    });
}

export function remove(activityTemplateKey, userKey) {
    return post('life', 'activity-template-participant/remove', {
        key: {
            activity_template_long_id: activityTemplateKey,
            user_string_id: userKey,
        },
    });
}

import {del, get, patch, post,} from '@/util/http';

export function exists(key) {
    return get('life', `activity-template-driver-info/${key}/exists/`, {});
}

export function inspect(key) {
    return get('life', `activity-template-driver-info/${key}/`, {});
}

export function insert(
    key, activityTemplateKey, enabled, type, param, remindFlag, generateFlag, remark, remindScopeType
) {
    let finalKey = {long_id: key};
    if (key === '') {
        finalKey = null;
    }
    let finalActivityTemplateKey = {long_id: activityTemplateKey};
    if (activityTemplateKey === '') {
        finalActivityTemplateKey = null;
    }
    return post('life', 'activity-template-driver-info/', {
        key: finalKey,
        activity_template_key: finalActivityTemplateKey,
        enabled,
        type,
        param,
        remind_flag: remindFlag,
        generate_flag: generateFlag,
        remark,
        remind_scope_type: remindScopeType,
    });
}

export function remove(key) {
    return del('life', `activity-template-driver-info/${key}/`, {});
}

export function update(
    key, activityTemplateKey, enabled, type, param, remindFlag, generateFlag, remark, remindScopeType
) {
    let finalActivityTemplateKey = {long_id: activityTemplateKey};
    if (activityTemplateKey === '') {
        finalActivityTemplateKey = null;
    }
    return patch('life', 'activity-template-driver-info/', {
        key: {
            long_id: key,
        },
        activity_template_key: finalActivityTemplateKey,
        enabled,
        type,
        param,
        remind_flag: remindFlag,
        generate_flag: generateFlag,
        remark,
        remind_scope_type: remindScopeType,
    });
}

export function childForActivityTemplate(activityTemplateKey, page, rows) {
    return get('life', `activity-template/${activityTemplateKey}/activity-template-driver-info/`, {
        page,
        rows,
    });
}

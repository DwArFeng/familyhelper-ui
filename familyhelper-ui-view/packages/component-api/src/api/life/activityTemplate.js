// noinspection NpmUsedModulesInstalled,JSUnusedGlobalSymbols

import {get, post,} from '@/util/http';

export function exists(key) {
    return get('life', `activity-template/${key}/exists/`, {});
}

export function inspect(key) {
    return get('life', `activity-template/${key}/`, {});
}

export function all(page, rows) {
    return get('life', 'activity-template/all/', {
        page,
        rows,
    });
}

export function allPermitted(page, rows) {
    return get('life', 'activity-template/all-permitted/', {
        page,
        rows,
    });
}

export function allOwned(page, rows) {
    return get('life', 'activity-template/all-owned/', {
        page,
        rows,
    });
}

export function inspectDisp(key) {
    return get('life', `activity-template/${key}/disp/`, {});
}

export function allPermittedDisp(page, rows) {
    return get('life', 'activity-template/all-permitted/disp/', {
        page,
        rows,
    });
}

export function allOwnedDisp(page, rows) {
    return get('life', 'activity-template/all-owned/disp/', {
        page,
        rows,
    });
}

export function create(
    activityType, name, remark, activityNameTemplate, activityRemarkTemplate, activityStartDateTemplate,
    activityEndDateTemplate, baselineDate,
) {
    return post('life', 'activity-template/create', {
        activity_type: activityType,
        name,
        remark,
        activity_name_template: activityNameTemplate,
        activity_remark_template: activityRemarkTemplate,
        activity_start_date_template: activityStartDateTemplate,
        activity_end_date_template: activityEndDateTemplate,
        baseline_date: baselineDate,
    });
}

export function update(
    key, activityType, name, remark, activityNameTemplate, activityRemarkTemplate, activityStartDateTemplate,
    activityEndDateTemplate, baselineDate,
) {
    return post('life', 'activity-template/update', {
        activity_template_key: {
            long_id: key,
        },
        activity_type: activityType,
        name,
        remark,
        activity_name_template: activityNameTemplate,
        activity_remark_template: activityRemarkTemplate,
        activity_start_date_template: activityStartDateTemplate,
        activity_end_date_template: activityEndDateTemplate,
        baseline_date: baselineDate,
    });
}

export function remove(key) {
    return post('life', 'activity-template/remove', {
        long_id: key,
    });
}

export function upsertPermission(activityTemplateKey, userKey, permissionLevel) {
    return post('life', 'activity-template/upsert-permission', {
        activity_template_key: {
            long_id: activityTemplateKey,
        },
        user_key: {
            string_id: userKey,
        },
        permission_level: permissionLevel,
    });
}

export function removePermission(activityTemplateKey, userKey) {
    return post('life', 'activity-template/remove-permission', {
        activity_template_key: {
            long_id: activityTemplateKey,
        },
        user_key: {
            string_id: userKey,
        },
    });
}

export function upsertActivityPermission(activityTemplateKey, userKey, permissionLevel) {
    return post('life', 'activity-template/upsert-activity-permission', {
        activity_template_key: {
            long_id: activityTemplateKey,
        },
        user_key: {
            string_id: userKey,
        },
        permission_level: permissionLevel,
    });
}

export function removeActivityPermission(activityTemplateKey, userKey) {
    return post('life', 'activity-template/remove-activity-permission', {
        activity_template_key: {
            long_id: activityTemplateKey,
        },
        user_key: {
            string_id: userKey,
        },
    });
}

export function createActivity(activityTemplateKey) {
    return post('life', 'activity-template/create-activity', {
        activity_template_key: {
            long_id: activityTemplateKey,
        },
    });
}

export function createActivityForTest(activityTemplateKey) {
    return post('life', 'activity-template/create-activity-for-test', {
        activity_template_key: {
            long_id: activityTemplateKey,
        },
    });
}

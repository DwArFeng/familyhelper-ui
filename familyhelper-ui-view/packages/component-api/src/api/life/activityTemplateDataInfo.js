// noinspection NpmUsedModulesInstalled,JSUnusedGlobalSymbols

import {get, post,} from '@/util/http';

export function exists(key) {
    return get('life', `activity-template-data-info/${key}/exists/`, {});
}

export function inspect(key) {
    return get('life', `activity-template-data-info/${key}/`, {});
}

export function childForActivityTemplate(itemKey, page, rows) {
    return get('life', `activity-template/${itemKey}/activity-template-data-info/`, {
        page,
        rows,
    });
}

export function childForActivityTemplateDisp(itemKey, page, rows) {
    return get('life', `activity-template/${itemKey}/activity-template-data-info/disp/`, {
        page,
        rows,
    });
}

export function create(activityTemplateKey, activityDataItemKey, remark, initialValue) {
    return post('life', 'activity-template-data-info/create/', {
        activity_template_key: {
            long_id: activityTemplateKey,
        },
        activity_data_item_key: {
            long_id: activityDataItemKey,
        },
        remark,
        initial_value: initialValue,
    });
}

export function update(key, remark, initialValue) {
    return post('life', 'activity-template-data-info/update/', {
        key: {
            long_id: key,
        },
        remark,
        initial_value: initialValue,
    });
}

export function remove(key) {
    return post('life', 'activity-template-data-info/remove/', {
        long_id: key,
    });
}

import {get} from '@/util/http';

export function exists(key) {
    return get('life', `poat/${key}/exists/`, {});
}

export function inspect(key) {
    return get('life', `poat/${key}/`, {});
}

export function inspectDisp(key) {
    return get('life', `poat/${key}/disp/`, {});
}

export function childForActivityTemplate(activityTemplateKey, page, rows) {
    return get('life', `activity-template/${activityTemplateKey}/poat/`, {
        page,
        rows,
    });
}

export function childForActivityTemplateDisp(activityTemplateKey, page, rows) {
    return get('life', `activity-template/${activityTemplateKey}/poat/disp/`, {
        page,
        rows,
    });
}

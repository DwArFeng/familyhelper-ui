// noinspection NpmUsedModulesInstalled,JSUnusedGlobalSymbols

import {get} from '@/util/http';

export function exists(key) {
    return get('life', `poatac/${key}/exists/`, {});
}

export function inspect(key) {
    return get('life', `poatac/${key}/`, {});
}

export function inspectDisp(key) {
    return get('life', `poatac/${key}/disp/`, {});
}

export function childForActivityTemplate(activityTemplateKey, page, rows) {
    return get('life', `activity-template/${activityTemplateKey}/poatac/`, {
        page,
        rows,
    });
}

export function childForActivityTemplateDisp(activityTemplateKey, page, rows) {
    return get('life', `activity-template/${activityTemplateKey}/poatac/disp/`, {
        page,
        rows,
    });
}

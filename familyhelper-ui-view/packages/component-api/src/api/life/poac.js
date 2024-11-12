// noinspection NpmUsedModulesInstalled,JSUnusedGlobalSymbols

import {get} from '@/util/http';

export function exists(key) {
    return get('life', `poac/${key}/exists/`, {});
}

export function inspect(key) {
    return get('life', `poac/${key}/`, {});
}

export function inspectDisp(key) {
    return get('life', `poac/${key}/disp/`, {});
}

export function childForActivity(activityKey, page, rows) {
    return get('life', `activity/${activityKey}/poac/`, {
        page,
        rows,
    });
}

export function childForActivityDisp(activityKey, page, rows) {
    return get('life', `activity/${activityKey}/poac/disp/`, {
        page,
        rows,
    });
}

// noinspection NpmUsedModulesInstalled,JSUnusedGlobalSymbols

import {get} from '@/util/http';

export function exists(key) {
    return get('life', `poad/${key}/exists/`, {});
}

export function inspect(key) {
    return get('life', `poad/${key}/`, {});
}

export function inspectDisp(key) {
    return get('life', `poad/${key}/disp/`, {});
}

export function childForActivityDataSet(activityDataSetKey, page, rows) {
    return get('life', `activity-data-set/${activityDataSetKey}/poad/`, {
        page,
        rows,
    });
}

export function childForActivityDataSetDisp(activityDataSetKey, page, rows) {
    return get('life', `activity-data-set/${activityDataSetKey}/poad/disp/`, {
        page,
        rows,
    });
}

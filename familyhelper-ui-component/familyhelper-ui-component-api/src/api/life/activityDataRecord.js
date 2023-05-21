import {get,} from '@/util/http';

export function exists(key) {
    return get('life', `activity-data-record/${key}/exists/`, {});
}

export function inspect(key) {
    return get('life', `activity-data-record/${key}/`, {});
}

export function all(page, rows) {
    return get('life', 'activity-data-record/all/', {
        page,
        rows,
    });
}

export function childForItemRecordedDateAsc(activityDataItemKey, page, rows) {
    return get('life', `activity-data-item/${activityDataItemKey}/activity-data-record/recorded-date-asc/`, {
        page,
        rows,
    });
}

export function childForItemRecordedDateDesc(activityDataItemKey, page, rows) {
    return get('life', `activity-data-item/${activityDataItemKey}/activity-data-record/recorded-date-desc/`, {
        page,
        rows,
    });
}

export function inspectDisp(key) {
    return get('life', `activity-data-record/${key}/disp/`, {});
}

export function allDisp(page, rows) {
    return get('life', 'activity-data-record/all/disp/', {
        page,
        rows,
    });
}

export function childForItemRecordedDateAscDisp(activityDataItemKey, page, rows) {
    return get('life', `activity-data-item/${activityDataItemKey}/activity-data-record/recorded-date-asc/disp/`, {
        page,
        rows,
    });
}

export function childForItemRecordedDateDescDisp(activityDataItemKey, page, rows) {
    return get('life', `activity-data-item/${activityDataItemKey}/activity-data-record/recorded-date-desc/disp/`, {
        page,
        rows,
    });
}

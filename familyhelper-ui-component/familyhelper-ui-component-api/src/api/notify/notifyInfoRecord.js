import {del, get} from '@/util/http';

export function exists(notifyHistoryId, type, recordId) {
    return get('notify', `notify-info-record/${notifyHistoryId}%26${type}%26${recordId}/exists/`, {});
}

export function inspect(notifyHistoryId, type, recordId) {
    return get('notify', `notify-info-record/${notifyHistoryId}%26${type}%26${recordId}/`, {});
}

export function remove(notifyHistoryId, type, recordId) {
    return del('notify', `notify-info-record/${notifyHistoryId}%26${type}%26${recordId}/`, {});
}

export function childForNotifyHistory(notifyHistoryId, page, rows) {
    return get('notify', `notify-history/${notifyHistoryId}/notify-info-record/`, {
        page,
        rows,
    });
}

export function inspectDisp(notifyHistoryId, type, recordId) {
    return get('notify', `notify-info-record/${notifyHistoryId}%26${type}%26${recordId}/disp/`, {});
}

export function childForNotifySettingDisp(notifySettingId, page, rows) {
    return get('notify', `notify-history/${notifySettingId}/notify-info-record/disp/`, {
        page,
        rows,
    });
}

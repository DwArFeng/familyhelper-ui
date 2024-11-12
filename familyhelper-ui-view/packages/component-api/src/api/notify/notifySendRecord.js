// noinspection NpmUsedModulesInstalled,JSUnusedGlobalSymbols

import {del, get} from '@/util/http';

export function exists(notifyHistoryId, topicId, accountId) {
    return get('notify', `notify-send-record/${notifyHistoryId}%26${topicId}%26${accountId}/exists/`, {});
}

export function inspect(notifyHistoryId, topicId, accountId) {
    return get('notify', `notify-send-record/${notifyHistoryId}%26${topicId}%26${accountId}/`, {});
}

export function remove(notifyHistoryId, topicId, accountId) {
    return del('notify', `notify-send-record/${notifyHistoryId}%26${topicId}%26${accountId}/`, {});
}

export function childForNotifyHistory(notifyHistoryId, page, rows) {
    return get('notify', `notify-history/${notifyHistoryId}/notify-send-record/`, {
        page,
        rows,
    });
}

export function inspectDisp(notifyHistoryId, topicId, accountId) {
    return get('notify', `notify-send-record/${notifyHistoryId}%26${topicId}%26${accountId}/disp/`, {});
}

export function childForNotifySettingDisp(notifySettingId, page, rows) {
    return get('notify', `notify-history/${notifySettingId}/notify-send-record/disp/`, {
        page,
        rows,
    });
}

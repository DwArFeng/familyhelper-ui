import {del, get} from '@/util/http';

export function exists(key) {
    return get('notify', `notify-history/${key}/exists/`, {});
}

export function inspect(key) {
    return get('notify', `notify-history/${key}/`, {});
}

export function remove(key) {
    return del('notify', `notify-history/${key}/`, {});
}

export function all(page, rows) {
    return get('notify', 'notify-history/all/', {
        page,
        rows,
    });
}

export function childForNotifySetting(notifySettingId, page, rows) {
    return get('notify', `notify-setting/${notifySettingId}/notify-history/`, {
        page,
        rows,
    });
}

export function inspectDisp(key) {
    return get('notify', `notify-history/${key}/disp/`, {});
}

export function allDisp(page, rows) {
    return get('notify', 'notify-history/all/disp/', {
        page,
        rows,
    });
}

export function childForNotifySettingDisp(notifySettingId, page, rows) {
    return get('notify', `notify-setting/${notifySettingId}/notify-history/disp/`, {
        page,
        rows,
    });
}

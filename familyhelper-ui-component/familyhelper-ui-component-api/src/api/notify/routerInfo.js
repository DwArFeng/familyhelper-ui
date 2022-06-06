import {
    del, get, patch, post,
} from '@/util/http';

export function exists(key) {
    return get('notify', `router-info/${key}/exists/`, {});
}

export function inspect(key) {
    return get('notify', `router-info/${key}/`, {});
}

export function insert(key, notifySettingKey, label, type, param, remark) {
    let finalKey = {long_id: key};
    let finalNotifySettingKey = {long_id: notifySettingKey}
    if (key === '') {
        finalKey = null;
    }
    if (notifySettingKey === '') {
        finalNotifySettingKey = null;
    }
    return post('notify', 'router-info/', {
        key: finalKey,
        notify_setting_key: finalNotifySettingKey,
        label,
        type,
        param,
        remark,
    });
}

export function remove(key) {
    return del('notify', `router-info/${key}/`, {});
}

export function update(key, notifySettingKey, label, type, param, remark) {
    let finalNotifySettingKey = {long_id: notifySettingKey}
    if (notifySettingKey === '') {
        finalNotifySettingKey = null;
    }
    return patch('notify', 'router-info/', {
        key: {
            long_id: key,
        },
        notify_setting_key: finalNotifySettingKey,
        label,
        type,
        param,
        remark,
    });
}

export function all(page, rows) {
    return get('notify', 'router-info/all/', {
        page,
        rows,
    });
}

export function inspectDisp(key) {
    return get('notify', `router-info/${key}/disp/`, {});
}

export function allDisp(page, rows) {
    return get('notify', 'router-info/all/disp/', {
        page,
        rows,
    });
}

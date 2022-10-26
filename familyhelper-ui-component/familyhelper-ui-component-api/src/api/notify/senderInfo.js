import {
    del, get, patch, post,
} from '@/util/http';

export function exists(notifySettingKey, topicKey,) {
    return get('notify', `sender-info/${notifySettingKey}%26${topicKey}/exists/`, {});
}

export function inspect(notifySettingKey, topicKey,) {
    return get('notify', `sender-info/${notifySettingKey}%26${topicKey}/`, {});
}

export function insert(notifySettingKey, topicKey, label, type, param, remark) {
    return post('notify', 'sender-info/', {
        key: {
            notify_setting_id: notifySettingKey === '' ? null : notifySettingKey,
            topic_id: topicKey === '' ? null : topicKey,
        },
        label,
        type,
        param,
        remark,
    });
}

export function remove(notifySettingKey, topicKey,) {
    return del('notify', `sender-info/${notifySettingKey}%26${topicKey}/`, {});
}

export function update(notifySettingKey, topicKey, label, type, param, remark) {
    return patch('notify', 'sender-info/', {
        key: {
            notify_setting_id: notifySettingKey === '' ? null : notifySettingKey,
            topic_id: topicKey === '' ? null : topicKey,
        },
        label,
        type,
        param,
        remark,
    });
}

export function all(page, rows) {
    return get('notify', 'sender-info/all/', {
        page,
        rows,
    });
}

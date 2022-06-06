import {
    del, get, patch, post,
} from '@/util/http';

export function exists(notifySettingKey, topicKey) {
    return get('notify', `sender-relation/${notifySettingKey}%26${topicKey}/exists/`, {});
}

export function inspect(notifySettingKey, topicKey) {
    return get('notify', `sender-relation/${notifySettingKey}%26${topicKey}/`, {});
}

export function insert(notifySettingKey, topicKey, senderInfoKey, remark) {
    let finalSenderInfoKey = {long_id: senderInfoKey}
    if (senderInfoKey === '') {
        finalSenderInfoKey = null;
    }
    return post('notify', 'sender-relation/', {
        key: {
            notify_setting_id: notifySettingKey,
            topic_id: topicKey,
        },
        sender_info_key: finalSenderInfoKey,
        remark,
    });
}

export function remove(notifySettingKey, topicKey) {
    return del('notify', `sender-relation/${notifySettingKey}%26${topicKey}/`, {});
}

export function update(notifySettingKey, topicKey, senderInfoKey, remark) {
    let finalSenderInfoKey = {long_id: senderInfoKey}
    if (senderInfoKey === '') {
        finalSenderInfoKey = null;
    }
    return patch('notify', 'sender-relation/', {
        key: {
            notify_setting_id: notifySettingKey,
            topic_id: topicKey,
        },
        sender_info_key: finalSenderInfoKey,
        remark,
    });
}

export function all(page, rows) {
    return get('notify', 'sender-relation/all/', {
        page,
        rows,
    });
}

export function inspectDisp(notifySettingKey, topicKey) {
    return get('notify', `sender-relation/${notifySettingKey}%26${topicKey}/disp/`, {});
}

export function allDisp(page, rows) {
    return get('notify', 'sender-relation/all/disp/', {
        page,
        rows,
    });
}

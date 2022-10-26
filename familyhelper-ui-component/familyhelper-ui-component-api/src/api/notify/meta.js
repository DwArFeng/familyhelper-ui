import {
    del, get, patch, post,
} from '@/util/http';

export function exists(notifySettingKey, topicKey, userKey, metaKey) {
    return get('notify', `meta/${notifySettingKey}%26${topicKey}%26${userKey}%26${metaKey}/exists/`, {});
}

export function inspect(notifySettingKey, topicKey, userKey, metaKey) {
    return get('notify', `meta/${notifySettingKey}%26${topicKey}%26${userKey}%26${metaKey}/`, {});
}

export function insert(notifySettingKey, topicKey, userKey, metaKey, value, remark) {
    return post('notify', 'meta/', {
        key: {
            notify_setting_id: notifySettingKey === '' ? null : notifySettingKey,
            topic_id: topicKey === '' ? null : topicKey,
            user_id: userKey === '' ? null : userKey,
            meta_id: metaKey === '' ? null : metaKey,
        },
        value,
        remark,
    });
}

export function remove(notifySettingKey, topicKey, userKey, metaKey) {
    return del('notify', `meta/${notifySettingKey}%26${topicKey}%26${userKey}%26${metaKey}/`, {});
}

export function update(notifySettingKey, topicKey, userKey, metaKey, value, remark) {
    return patch('notify', 'meta/', {
        key: {
            notify_setting_id: notifySettingKey === '' ? null : notifySettingKey,
            topic_id: topicKey === '' ? null : topicKey,
            user_id: userKey === '' ? null : userKey,
            meta_id: metaKey === '' ? null : metaKey,
        },
        value,
        remark,
    });
}

export function all(page, rows) {
    return get('notify', 'meta/all/', {
        page,
        rows,
    });
}

export function childForNotifySettingTopicUser(notifySettingKey, topicKey, userKey, page, rows) {
    return get('notify', `notify-setting/${notifySettingKey}/topic/${topicKey}/user/${userKey}/meta/`, {
        page,
        rows,
    });
}

export function inspectDisp(notifySettingKey, topicKey, userKey, metaKey) {
    return get('notify', `meta/${notifySettingKey}%26${topicKey}%26${userKey}%26${metaKey}/disp/`, {});
}

export function allDisp(page, rows) {
    return get('notify', 'meta/all/disp/', {
        page,
        rows,
    });
}

export function childForNotifySettingTopicUserDisp(notifySettingKey, topicKey, userKey, page, rows) {
    return get('notify', `notify-setting/${notifySettingKey}/topic/${topicKey}/user/${userKey}/meta/disp/`, {
        page,
        rows,
    });
}


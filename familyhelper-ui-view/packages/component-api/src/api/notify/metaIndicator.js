// noinspection NpmUsedModulesInstalled,JSUnusedGlobalSymbols

import {
    del, get, patch, post,
} from '@/util/http';

export function exists(topicKey, metaKey) {
    return get('notify', `meta-indicator/${topicKey}%26${metaKey}/exists/`, {});
}

export function inspect(topicKey, metaKey) {
    return get('notify', `meta-indicator/${topicKey}%26${metaKey}/`, {});
}

export function insert(topicKey, metaKey, label, remark, defaultValue) {
    return post('notify', 'meta-indicator/', {
        key: {
            topic_id: topicKey === '' ? null : topicKey,
            meta_id: metaKey === '' ? null : metaKey,
        },
        label,
        remark,
        default_value: defaultValue
    });
}

export function remove(topicKey, metaKey) {
    return del('notify', `meta-indicator/${topicKey}%26${metaKey}/`, {});
}

export function update(topicKey, metaKey, label, remark, defaultValue) {
    return patch('notify', 'meta-indicator/', {
        key: {
            topic_id: topicKey === '' ? null : topicKey,
            meta_id: metaKey === '' ? null : metaKey,
        },
        label,
        remark,
        default_value: defaultValue
    });
}

export function all(page, rows) {
    return get('notify', 'meta-indicator/all/', {
        page,
        rows,
    });
}

export function childForTopic(topicKey, page, rows) {
    return get('notify', `topic/${topicKey}/meta-indicator/`, {
        page,
        rows,
    });
}

export function metaMissing(notifySettingId, topicId, userId) {
    return get('notify', 'meta-indicator/meta-missing/', {
        'notify-setting-id':notifySettingId,
        'topic-id': topicId,
        'user-id':userId,
    });
}

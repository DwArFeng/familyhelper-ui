// noinspection NpmUsedModulesInstalled,JSUnusedGlobalSymbols

import {get, getBlob, post, postFormData,} from '@/util/http';

export function exists(key) {
    return get('clannad', `message-attachment/${key}/exists/`, {});
}

export function inspect(key) {
    return get('clannad', `message-attachment/${key}/`, {});
}

export function childForMessage(messageKey, page, rows) {
    return get('clannad', `message/${messageKey}/message-attachment/default/`, {
        page,
        rows,
    });
}

export function childForMessageOriginNameAsc(messageKey, page, rows) {
    return get('clannad', `message/${messageKey}/message-attachment/origin-name-asc/`, {
        page,
        rows,
    });
}

export function childForMessageUploadDateDesc(messageKey, page, rows) {
    return get('clannad', `message/${messageKey}/message-attachment/upload-date-desc/`, {
        page,
        rows,
    });
}

export function download(key) {
    return getBlob('clannad', `message-attachment/${key}/download/`, {});
}

export function requestMessageAttachmentStreamVoucher(messageAttachmentKey) {
    return post('clannad', `message-attachment/${messageAttachmentKey}/request-message-attachment-stream-voucher/`, {});
}

export function upload(messageKey, formData) {
    return postFormData('clannad', `message/${messageKey}/message-attachment/upload/`, formData);
}

export function uploadStream(messageId, formData) {
    return postFormData('clannad', `message/${messageId}/message-attachment/upload-stream/`, formData);
}

export function update(messageAttachmentKey, formData) {
    return postFormData('clannad', `/message-attachment/${messageAttachmentKey}/update/`, formData);
}

export function updateStream(messageAttachmentId, formData) {
    return postFormData('clannad', `/message-attachment/${messageAttachmentId}/update-stream/`, formData);
}

export function remove(key) {
    return post('clannad', 'message-attachment/remove/', {
        long_id: key,
    });
}

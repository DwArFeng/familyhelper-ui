import {
    get, getBlob, post, postFormData,
} from '@/util/http';

export function exists(key) {
    return get('assets', `item-file/${key}/exists/`, {});
}

export function inspect(key) {
    return get('assets', `item-file/${key}/`, {});
}

export function childForItem(itemKey, page, rows) {
    return get('assets', `item/${itemKey}/item-file/default/`, {
        page,
        rows,
    });
}

export function childForItemInspectedDateDesc(itemKey, page, rows) {
    return get('assets', `item/${itemKey}/item-file/inspected-date-desc/`, {
        page,
        rows,
    });
}

export function childForItemModifiedDateDesc(itemKey, page, rows) {
    return get('assets', `item/${itemKey}/item-file/modified-date-desc/`, {
        page,
        rows,
    });
}

export function childForItemOriginNameAsc(itemKey, page, rows) {
    return get('assets', `item/${itemKey}/item-file/origin-name-asc/`, {
        page,
        rows,
    });
}

export function childForItemCreatedDateAsc(itemKey, page, rows) {
    return get('assets', `item/${itemKey}/item-file/created-date-asc/`, {
        page,
        rows,
    });
}

export function requestItemFileStreamVoucher(itemFileKey) {
    return post('assets', `item-file/${itemFileKey}/request-item-file-stream-voucher/`, {});
}

export function download(key) {
    return getBlob('assets', `item-file/${key}/download/`, {});
}

export function upload(itemKey, formData) {
    return postFormData('assets', `item/${itemKey}/item-file/upload/`, formData);
}

export function uploadStream(itemId, formData) {
    return postFormData('assets', `item/${itemId}/item-file/upload-stream/`, formData);
}

export function update(itemFileKey, formData) {
    return postFormData('assets', `/item-file/${itemFileKey}/update/`, formData);
}

export function updateStream(itemFileId, formData) {
    return postFormData('assets', `/item-file/${itemFileId}/update-stream/`, formData);
}

export function remove(key) {
    return post('assets', 'item-file/remove/', {
        long_id: key,
    });
}

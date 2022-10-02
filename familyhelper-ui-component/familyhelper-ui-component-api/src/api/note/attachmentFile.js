import {
    get, getBlob, post, postFormData,
} from '@/util/http';

export function exists(key) {
    return get('note', `attachment-file/${key}/exists/`, {});
}

export function inspect(key) {
    return get('note', `attachment-file/${key}/`, {});
}

export function childForNoteItem(attachmentKey, page, rows) {
    return get('note', `note-item/${attachmentKey}/attachment-file/default/`, {
        page,
        rows,
    });
}

export function childForNoteItemInspectedDateDesc(attachmentKey, page, rows) {
    return get('note', `note-item/${attachmentKey}/attachment-file/inspected-date-desc/`, {
        page,
        rows,
    });
}

export function childForNoteItemModifiedDateDesc(attachmentKey, page, rows) {
    return get('note', `note-item/${attachmentKey}/attachment-file/modified-date-desc/`, {
        page,
        rows,
    });
}

export function childForNoteItemOriginNameAsc(attachmentKey, page, rows) {
    return get('note', `note-item/${attachmentKey}/attachment-file/origin-name-asc/`, {
        page,
        rows,
    });
}

export function childForNoteItemCreatedDateAsc(attachmentKey, page, rows) {
    return get('note', `note-item/${attachmentKey}/attachment-file/created-date-asc/`, {
        page,
        rows,
    });
}

export function download(key) {
    return getBlob('note', `attachment-file/${key}/download/`, {});
}

export function upload(attachmentKey, formData) {
    return postFormData('note', `note-item/${attachmentKey}/attachment-file/upload/`, formData);
}

export function update(attachmentFileKey, formData) {
    return postFormData('note', `/attachment-file/${attachmentFileKey}/update/`, formData);
}

export function remove(key) {
    return post('note', 'attachment-file/remove/', {
        long_id: key,
    });
}

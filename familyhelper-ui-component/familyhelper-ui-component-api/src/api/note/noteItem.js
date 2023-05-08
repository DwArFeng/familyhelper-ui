import {get, getBlob, post, postFormData,} from '@/util/http';

export function exists(key) {
    return get('note', `note-item/${key}/exists/`, {});
}

export function inspect(key) {
    return get('note', `note-item/${key}/`, {});
}

export function all(page, rows) {
    return get('note', 'note-item/all/', {
        page,
        rows,
    });
}

export function childForNoteNode(noteNodeKey, page, rows) {
    return get('note', `note-node/${noteNodeKey}/note-item/`, {
        page,
        rows,
    });
}

export function childForNoteBookRoot(noteBookKey, page, rows) {
    return get('note', `note-book/${noteBookKey}/note-item/root/`, {
        page,
        rows,
    });
}

export function childForNoteBookNameLike(noteBookKey, pattern, page, rows) {
    return get('note', `note-book/${noteBookKey}/note-item/name-like/`, {
        pattern,
        page,
        rows,
    });
}

export function inspectDisp(key) {
    return get('note', `note-item/${key}/disp/`, {});
}

export function allDisp(page, rows) {
    return get('note', 'note-item/all/disp/', {
        page,
        rows,
    });
}

export function childForNoteNodeDisp(noteNodeKey, page, rows) {
    return get('note', `note-node/${noteNodeKey}/note-item/disp/`, {
        page,
        rows,
    });
}

export function childForNoteBookRootDisp(noteBookKey, page, rows) {
    return get('note', `note-book/${noteBookKey}/note-item/root/disp/`, {
        page,
        rows,
    });
}

export function childForNoteBookNameLikeDisp(noteBookKey, pattern, page, rows) {
    return get('note', `note-book/${noteBookKey}/note-item/name-like/disp/`, {
        pattern,
        page,
        rows,
    });
}

export function create(setKey, nodeKey, name, remark) {
    let finalNodeKey = {
        long_id: nodeKey
    }
    if (nodeKey === '') {
        finalNodeKey = null;
    }
    return post('note', 'note-item/create/', {
        book_key: {
            long_id: setKey
        },
        node_key: finalNodeKey,
        name,
        remark,
    });
}

export function update(key, nodeKey, name, remark) {
    let finalNodeKey = {
        long_id: nodeKey
    }
    if (nodeKey === '') {
        finalNodeKey = null;
    }
    return post('note', 'note-item/update/', {
        key: {
            long_id: key,
        },
        node_key: finalNodeKey,
        name,
        remark,
    });
}

export function remove(key) {
    return post('note', 'note-item/remove/', {
        long_id: key,
    });
}

export function downloadNoteFile(key) {
    return getBlob('note', `note-item/${key}/download-note-file/`, {});
}

export function uploadNoteFile(noteItemKey, formData) {
    return postFormData('note', `note-item/${noteItemKey}/upload-note-file/`, formData);
}

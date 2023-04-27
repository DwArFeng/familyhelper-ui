import {get, post,} from '@/util/http';

export function exists(key) {
    return get('note', `note-node/${key}/exists/`, {});
}

export function inspect(key) {
    return get('note', `note-node/${key}/`, {});
}

export function all(page, rows) {
    return get('note', 'note-node/all/', {
        page,
        rows,
    });
}

export function childForNoteBook(noteBookKey, page, rows) {
    return get('note', `note-book/${noteBookKey}/note-node/`, {
        page,
        rows,
    });
}

export function childForNoteBookRoot(noteBookKey, page, rows) {
    return get('note', `note-book/${noteBookKey}/note-node/root/`, {
        page,
        rows,
    });
}

export function childForParent(parentKey, page, rows) {
    return get('note', `note-node/${parentKey}/child/`, {
        page,
        rows,
    });
}

export function childForNoteBookNameLike(noteBookKey, pattern, page, rows) {
    return get('note', `note-book/${noteBookKey}/note-node/name-like/`, {
        pattern,
        page,
        rows,
    });
}

export function inspectDisp(key) {
    return get('note', `note-node/${key}/disp/`, {});
}

export function allDisp(page, rows) {
    return get('note', 'note-node/all/disp/', {
        page,
        rows,
    });
}

export function childForNoteBookDisp(noteBookKey, page, rows) {
    return get('note', `note-book/${noteBookKey}/note-node/disp/`, {
        page,
        rows,
    });
}

export function childForNoteBookRootDisp(noteBookKey, page, rows) {
    return get('note', `note-book/${noteBookKey}/note-node/root/disp/`, {
        page,
        rows,
    });
}

export function childForParentDisp(parentKey, page, rows) {
    return get('note', `note-node/${parentKey}/child/disp/`, {
        page,
        rows,
    });
}

export function childForNoteBookNameLikeDisp(noteBookKey, pattern, page, rows) {
    return get('note', `note-book/${noteBookKey}/note-node/name-like/disp/`, {
        pattern,
        page,
        rows,
    });
}

export function create(setKey, parentKey, name, remark) {
    let finalParentKey = {
        long_id: parentKey,
    };
    if (parentKey === '') {
        finalParentKey = null;
    }
    return post('note', 'note-node/create/', {
        book_key: {
            long_id: setKey,
        },
        parent_key: finalParentKey,
        name,
        remark,
    });
}

export function update(key, parentKey, name, remark) {
    let finalParentKey = {
        long_id: parentKey,
    };
    if (parentKey === '') {
        finalParentKey = null;
    }
    return post('note', 'note-node/update/', {
        key: {
            long_id: key,
        },
        parent_key: finalParentKey,
        name,
        remark,
    });
}

export function remove(key) {
    return post('note', 'note-node/remove/', {
        long_id: key,
    });
}

export function pathFromRoot(key) {
    return get('note', `note-node/${key}/path-from-root/`, {});
}

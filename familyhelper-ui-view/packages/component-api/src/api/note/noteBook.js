// noinspection NpmUsedModulesInstalled,JSUnusedGlobalSymbols

import {
    get, post,
} from '@/util/http';

export function exists(key) {
    return get('note', `note-book/${key}/exists/`, {});
}

export function inspect(key) {
    return get('note', `note-book/${key}/`, {});
}

export function all(page, rows) {
    return get('note', 'note-book/all/', {
        page,
        rows,
    });
}

export function allPermitted(page, rows) {
    return get('note', 'note-book/all-permitted/', {
        page,
        rows,
    });
}

export function allOwned(page, rows) {
    return get('note', 'note-book/all-owned/', {
        page,
        rows,
    });
}

export function inspectDisp(key) {
    return get('note', `note-book/${key}/disp/`, {});
}

export function allPermittedDisp(page, rows) {
    return get('note', 'note-book/all-permitted/disp/', {
        page,
        rows,
    });
}

export function allOwnedDisp(page, rows) {
    return get('note', 'note-book/all-owned/disp/', {
        page,
        rows,
    });
}

export function create(name, remark) {
    return post('note', 'note-book/create', {
        name,
        remark,
    });
}

export function update(key, name, remark) {
    return post('note', 'note-book/update', {
        note_book_key: {
            long_id: key,
        },
        name,
        remark,
    });
}

export function remove(key) {
    return post('note', 'note-book/remove', {
        long_id: key,
    });
}

export function upsertPermission(noteBookKey, userKey, permissionLevel) {
    return post('note', 'note-book/upsert-permission', {
        note_book_key: {
            long_id: noteBookKey,
        },
        user_key: {
            string_id: userKey,
        },
        permission_level: permissionLevel,
    });
}

export function removePermission(noteBookKey, userKey) {
    return post('note', 'note-book/remove-permission', {
        note_book_key: {
            long_id: noteBookKey,
        },
        user_key: {
            string_id: userKey,
        },
    });
}

// noinspection NpmUsedModulesInstalled,JSUnusedGlobalSymbols

import {get, post,} from '@/util/http';

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

export function userOwned(page, rows) {
    return get('note', 'note-book/user-owned/', {
        page,
        rows,
    });
}

export function userPermittedWithConditionDisplay(pattern, onlyFavored, page, rows) {
    return get('note', 'note-book/user-permitted-with-condition-display/', {
        pattern,
        "only-favored": onlyFavored,
        page,
        rows,
    });
}

export function userOwnedWithConditionDisplay(pattern, onlyFavored, page, rows) {
    return get('note', 'note-book/user-owned-with-condition-display/', {
        pattern,
        "only-favored": onlyFavored,
        page,
        rows,
    });
}

export function inspectDisp(key) {
    return get('note', `note-book/${key}/disp/`, {});
}

export function allDisp(page, rows) {
    return get('note', 'note-book/all/disp/', {
        page,
        rows,
    });
}

export function userOwnedDisp(page, rows) {
    return get('note', 'note-book/user-owned/disp/', {
        page,
        rows,
    });
}

export function userPermittedWithConditionDisplayDisp(pattern, onlyFavored, page, rows) {
    return get('note', 'note-book/user-permitted-with-condition-display/disp/', {
        pattern,
        "only-favored": onlyFavored,
        page,
        rows,
    });
}

export function userOwnedWithConditionDisplayDisp(pattern, onlyFavored, page, rows) {
    return get('note', 'note-book/user-owned-with-condition-display/disp/', {
        pattern,
        "only-favored": onlyFavored,
        page,
        rows,
    });
}

export function create(name, remark, favorite) {
    return post('note', 'note-book/create', {
        name,
        remark,
        favorite,
    });
}

export function update(key, name, remark, favorite) {
    return post('note', 'note-book/update', {
        note_book_key: {
            long_id: key,
        },
        name,
        remark,
        favorite,
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

export function changeFavored(noteBookKey){
    return post('note', 'note-book/change-favored', {
        note_book_key: {
            long_id: noteBookKey,
        },
    });
}

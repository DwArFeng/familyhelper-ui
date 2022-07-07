import {
    get, post,
} from '@/util/http';

export function exists(key) {
    return get('clannad', `certificate/${key}/exists/`, {});
}

export function inspect(key) {
    return get('clannad', `certificate/${key}/`, {});
}

export function all(page, rows) {
    return get('clannad', 'certificate/all/', {
        page,
        rows,
    });
}

export function allPermitted(page, rows) {
    return get('clannad', 'certificate/all-permitted/', {
        page,
        rows,
    });
}

export function allOwned(page, rows) {
    return get('clannad', 'certificate/all-owned/', {
        page,
        rows,
    });
}

export function inspectDisp(key) {
    return get('clannad', `certificate/${key}/disp/`, {});
}

export function allPermittedDisp(page, rows) {
    return get('clannad', 'certificate/all-permitted/disp/', {
        page,
        rows,
    });
}

export function allOwnedDisp(page, rows) {
    return get('clannad', 'certificate/all-owned/disp/', {
        page,
        rows,
    });
}

export function create(name, remark) {
    return post('clannad', 'certificate/create', {
        name,
        remark,
    });
}

export function update(key, name, remark) {
    return post('clannad', 'certificate/update', {
        account_book_key: {
            long_id: key,
        },
        name,
        remark,
    });
}

export function remove(key) {
    return post('clannad', 'certificate/remove', {
        long_id: key,
    });
}

export function upsertPermission(accountBookKey, userKey, permissionLevel) {
    return post('clannad', 'certificate/upsert-permission', {
        account_book_key: {
            long_id: accountBookKey,
        },
        user_key: {
            string_id: userKey,
        },
        permission_level: permissionLevel,
    });
}

export function removePermission(accountBookKey, userKey) {
    return post('clannad', 'certificate/remove-permission', {
        account_book_key: {
            long_id: accountBookKey,
        },
        user_key: {
            string_id: userKey,
        },
    });
}

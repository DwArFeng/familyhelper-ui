import {
    get, post,
} from '@/util/http';

export function exists(key) {
    return get('finance', `account-book/${key}/exists/`, {});
}

export function inspect(key) {
    return get('finance', `account-book/${key}/`, {});
}

export function all(page, rows) {
    return get('finance', 'account-book/all/', {
        page,
        rows,
    });
}

export function allPermitted(page, rows) {
    return get('finance', 'account-book/all-permitted/', {
        page,
        rows,
    });
}

export function allOwned(page, rows) {
    return get('finance', 'account-book/all-owned/', {
        page,
        rows,
    });
}

export function inspectDisp(key) {
    return get('finance', `account-book/${key}/disp/`, {});
}

export function allPermittedDisp(page, rows) {
    return get('finance', 'account-book/all-permitted/disp/', {
        page,
        rows,
    });
}

export function allOwnedDisp(page, rows) {
    return get('finance', 'account-book/all-owned/disp/', {
        page,
        rows,
    });
}

export function create(name, remark) {
    return post('finance', 'account-book/create', {
        name,
        remark,
    });
}

export function update(key, name, remark) {
    return post('finance', 'account-book/update', {
        account_book_key: {
            long_id: key,
        },
        name,
        remark,
    });
}

export function remove(key) {
    return post('finance', 'account-book/remove', {
        long_id: key,
    });
}

export function upsertPermission(accountBookKey, userKey, permissionLevel) {
    return post('finance', 'account-book/upsert-permission', {
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
    return post('finance', 'account-book/remove-permission', {
        account_book_key: {
            long_id: accountBookKey,
        },
        user_key: {
            string_id: userKey,
        },
    });
}

export function recordCommit(key) {
    return post('finance', 'account-book/record-commit', {
        long_id: key,
    });
}

export function rollbackAll(key) {
    return post('finance', 'account-book/rollback-all', {
        long_id: key,
    });
}

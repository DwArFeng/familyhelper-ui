// noinspection NpmUsedModulesInstalled,JSUnusedGlobalSymbols

import {del, get, patch, post,} from '@/util/http';

export function exists(key) {
    return get('finance', `remind-driver-info/${key}/exists/`, {});
}

export function inspect(key) {
    return get('finance', `remind-driver-info/${key}/`, {});
}

export function insert(key, accountBookKey, enabled, type, param, remindScopeType, remark) {
    let finalKey = {long_id: key};
    if (key === '') {
        finalKey = null;
    }
    let finalAccountBookKey = {long_id: accountBookKey};
    if (accountBookKey === '') {
        finalAccountBookKey = null;
    }
    return post('finance', 'remind-driver-info/', {
        key: finalKey,
        account_book_key: finalAccountBookKey,
        enabled,
        type,
        param,
        remind_scope_type:remindScopeType,
        remark,
    });
}

export function remove(key) {
    return del('finance', `remind-driver-info/${key}/`, {});
}

export function update(key, accountBookKey, enabled, type, param, remindScopeType, remark) {
    let finalAccountBookKey = {long_id: accountBookKey};
    if (accountBookKey === '') {
        finalAccountBookKey = null;
    }
    return patch('finance', 'remind-driver-info/', {
        key: {
            long_id: key,
        },
        account_book_key: finalAccountBookKey,
        enabled,
        type,
        param,
        remind_scope_type:remindScopeType,
        remark,
    });
}

export function childForAccountBook(accountBookKey, page, rows) {
    return get('finance', `account-book/${accountBookKey}/remind-driver-info/`, {
        page,
        rows,
    });
}

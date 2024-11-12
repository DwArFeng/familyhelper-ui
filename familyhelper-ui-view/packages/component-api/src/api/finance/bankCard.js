// noinspection NpmUsedModulesInstalled,JSUnusedGlobalSymbols

import {
    get, post,
} from '@/util/http';

export function exists(key) {
    return get('finance', `bank-card/${key}/exists/`, {});
}

export function inspect(key) {
    return get('finance', `bank-card/${key}/`, {});
}

export function all(page, rows) {
    return get('finance', 'bank-card/all/', {
        page,
        rows,
    });
}

export function childForAccountBook(accountBookKey, page, rows) {
    return get('finance', `account-book/${accountBookKey}/bank-card/`, {
        page,
        rows,
    });
}

export function inspectDisp(key) {
    return get('finance', `bank-card/${key}/disp/`, {});
}

export function allDisp(page, rows) {
    return get('finance', 'bank-card/all/disp/', {
        page,
        rows,
    });
}

export function childForAccountBookDisp(accountBookKey, page, rows) {
    return get('finance', `account-book/${accountBookKey}/bank-card/disp/`, {
        page,
        rows,
    });
}

export function create(accountBookKey, name, cardType, remark) {
    return post('finance', 'bank-card/create', {
        account_book_key: {
            long_id: accountBookKey,
        },
        name,
        card_type: cardType,
        remark,
    });
}

export function update(key, name, cardType, remark) {
    return post('finance', 'bank-card/update', {
        bank_card_key: {
            long_id: key,
        },
        name,
        card_type: cardType,
        remark,
    });
}

export function remove(key) {
    return post('finance', 'bank-card/remove', {
        long_id: key,
    });
}

export function recordBalance(key, balance) {
    return post('finance', 'bank-card/record-balance', {
        bank_card_key: {
            long_id: key,
        },
        balance,
    });
}

export function rollbackBalance(key) {
    return post('finance', 'bank-card/rollback-balance', {
        long_id: key,
    });
}

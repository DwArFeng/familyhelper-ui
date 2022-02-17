import {get} from '@/util/http';

export function exists(key) {
    return get('finance', `total-balance-history/${key}/exists/`, {});
}

export function inspect(key) {
    return get('finance', `total-balance-history/${key}/`, {});
}

export function all(page, rows) {
    return get('finance', 'total-balance-history/all/', {
        page,
        rows,
    });
}

export function childForAccountBook(accountBookKey, page, rows) {
    return get('finance', `account-book/${accountBookKey}/total-balance-history/`, {
        page,
        rows,
    });
}

export function childForAccountBookDesc(accountBookKey, page, rows) {
    return get('finance', `account-book/${accountBookKey}/total-balance-history/desc`, {
        page,
        rows,
    });
}

import {get} from '@/util/http';

export function exists(key) {
    return get('finance', `poab/${key}/exists/`, {});
}

export function inspect(key) {
    return get('finance', `poab/${key}/`, {});
}

export function inspectDisp(key) {
    return get('finance', `poab/${key}/disp/`, {});
}

export function childForAccountBook(accountBookKey, page, rows) {
    return get('finance', `account-book/${accountBookKey}/poab/`, {
        page,
        rows,
    });
}

export function childForAccountBookDisp(accountBookKey, page, rows) {
    return get('finance', `account-book/${accountBookKey}/poab/disp/`, {
        page,
        rows,
    });
}

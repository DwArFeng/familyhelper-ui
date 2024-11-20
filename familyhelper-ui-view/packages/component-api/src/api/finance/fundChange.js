// noinspection NpmUsedModulesInstalled,JSUnusedGlobalSymbols

import {get, post,} from '@/util/http';

export function exists(key) {
    return get('finance', `fund-change/${key}/exists/`, {});
}

export function inspect(key) {
    return get('finance', `fund-change/${key}/`, {});
}

export function all(page, rows) {
    return get('finance', 'fund-change/all/', {
        page,
        rows,
    });
}

export function childForAccountBook(accountBookKey, page, rows) {
    return get('finance', `account-book/${accountBookKey}/fund-change/`, {
        page,
        rows,
    });
}

export function childForAccountBookDesc(accountBookKey, page, rows) {
    return get('finance', `account-book/${accountBookKey}/fund-change/desc`, {
        page,
        rows,
    });
}

export function childForAccountBookTypeEquals(accountBookKey, pattern, page, rows) {
    return get('finance', `account-book/${accountBookKey}/fund-change/type-equals`, {
        pattern,
        page,
        rows,
    });
}

export function childForAccountBookTypeEqualsDesc(accountBookKey, pattern, page, rows) {
    return get('finance', `account-book/${accountBookKey}/fund-change/type-equals-desc`, {
        pattern,
        page,
        rows,
    });
}

export function inspectDisp(key) {
    return get('finance', `fund-change/${key}/disp/`, {});
}

export function allDisp(page, rows) {
    return get('finance', 'fund-change/all/disp/', {
        page,
        rows,
    });
}

export function childForAccountBookDisp(accountBookKey, page, rows) {
    return get('finance', `account-book/${accountBookKey}/fund-change/disp/`, {
        page,
        rows,
    });
}

export function childForAccountBookDescDisp(accountBookKey, page, rows) {
    return get('finance', `account-book/${accountBookKey}/fund-change/desc/disp/`, {
        page,
        rows,
    });
}

export function childForAccountBookTypeEqualsDisp(accountBookKey, pattern, page, rows) {
    return get('finance', `account-book/${accountBookKey}/fund-change/type-equals/disp`, {
        pattern,
        page,
        rows,
    });
}

export function childForAccountBookTypeEqualsDescDisp(accountBookKey, pattern, page, rows) {
    return get('finance', `account-book/${accountBookKey}/fund-change/type-equals-desc/disp`, {
        pattern,
        page,
        rows,
    });
}

export function record(accountBookKey, delta, changeType, remark, happenedDate) {
    return post('finance', 'fund-change/record', {
        account_book_key: {
            long_id: accountBookKey,
        },
        delta,
        change_type: changeType,
        remark,
        happened_date: happenedDate,
    });
}

export function update(key, delta, changeType, remark, happenedDate) {
    return post('finance', 'fund-change/update', {
        fund_change_key: {
            long_id: key,
        },
        delta,
        change_type: changeType,
        remark,
        happened_date: happenedDate,
    });
}

export function remove(key) {
    return post('finance', 'fund-change/remove', {
        long_id: key,
    });
}

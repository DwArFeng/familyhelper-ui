import {get} from '@/util/http';

export function exists(key) {
    return get('finance', `bank-card-balance-history/${key}/exists/`, {});
}

export function inspect(key) {
    return get('finance', `bank-card-balance-history/${key}/`, {});
}

export function all(page, rows) {
    return get('finance', 'bank-card-balance-history/all/', {
        page,
        rows,
    });
}

export function childForBankCard(bankCardKey, page, rows) {
    return get('finance', `bank-card/${bankCardKey}/bank-card-balance-history/`, {
        page,
        rows,
    });
}

export function childForBankCardDesc(bankCardKey, page, rows) {
    return get('finance', `bank-card/${bankCardKey}/bank-card-balance-history/desc`, {
        page,
        rows,
    });
}

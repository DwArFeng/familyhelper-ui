// noinspection NpmUsedModulesInstalled,JSUnusedGlobalSymbols

import { post } from '@/util/http';

/**
 * @deprecated
 */
export function login(accountId, password) {
    return post('system', 'login/login', {
        account_key: {
            string_id: accountId,
        },
        password,
    });
}

export function dynamicLogin(accountId, password, remark){
    return post('system', 'login/dynamic-login', {
        account_key: {
            string_id: accountId,
        },
        password,
        remark,
    });
}

export function staticLogin(accountId, password, expireDate, remark){
    return post('system', 'login/static-login', {
        account_key: {
            string_id: accountId,
        },
        password,
        expire_date: expireDate,
        remark,
    });
}

export function postpone(loginStateId) {
    return post('system', 'login/postpone', {
        long_id: loginStateId,
    });
}

export function logout(loginStateId) {
    return post('system', 'login/logout', {
        long_id: loginStateId,
    });
}

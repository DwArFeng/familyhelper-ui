import {post} from '@/util/http';

export function login(accountId, password) {
    return post('system', 'login/login', {
        account_key: {
            string_id: accountId,
        },
        password,
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

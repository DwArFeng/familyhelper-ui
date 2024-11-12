// noinspection NpmUsedModulesInstalled,JSUnusedGlobalSymbols

import {get} from '@/util/http';

export function exists(loginHistoryId, recordId) {
    return get('system', `login-param-record/${loginHistoryId}%26${recordId}/exists/`, {});
}

export function inspect(loginHistoryId, recordId) {
    return get('system', `login-param-record/${loginHistoryId}%26${recordId}/`, {});
}

export function all(page, rows) {
    return get('system', 'login-param-record/all/', {
        page,
        rows,
    });
}

export function childForLoginHistory(loginHistoryKey, page, rows) {
    return get('system', `login-history/${loginHistoryKey}/login-param-record/`, {
        loginHistoryKey,
        page,
        rows,
    });
}

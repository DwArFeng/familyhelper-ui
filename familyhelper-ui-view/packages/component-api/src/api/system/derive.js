// noinspection NpmUsedModulesInstalled,JSUnusedGlobalSymbols

import {post} from '@/util/http';

export function dynamicDerive(loginStateId, remark) {
    return post('system', 'derive/dynamic-derive', {
        login_state_key: {
            long_id: loginStateId,
        },
        remark,
    });
}

export function staticDerive(loginStateId, expireDate, remark) {
    return post('system', 'derive/static-derive', {
        login_state_key: {
            long_id: loginStateId,
        },
        expire_date: expireDate,
        remark,
    });
}

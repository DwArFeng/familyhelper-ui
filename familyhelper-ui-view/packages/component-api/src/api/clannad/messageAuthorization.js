// noinspection NpmUsedModulesInstalled,JSUnusedGlobalSymbols

import {get, post} from '@/util/http';

export function exists(receiveUserId, authorizedSendUserId) {
    return get('clannad', `message-authorization/${receiveUserId}%26${authorizedSendUserId}/exists/`, {});
}

export function inspect(receiveUserId, authorizedSendUserId) {
    return get('clannad', `message-authorization/${receiveUserId}%26${authorizedSendUserId}/`, {});
}

export function all(page, rows) {
    return get('clannad', 'message-authorization/all/', {
        page,
        rows,
    });
}

export function childForReceiveAccount(accountId, page, rows) {
    return get('clannad', `account/receive/${accountId}/message-authorization/`, {
        page,
        rows,
    });
}

export function childForAuthorizedSendAccount(accountId, page, rows) {
    return get('clannad', `account/authorized-send/${accountId}/message-authorization/`, {
        page,
        rows,
    });
}

export function childForAuthorizedSendAccountIdLike(accountId, pattern, page,rows){
    return get('clannad', `account/authorized-send/${accountId}/message-authorization/id-like/`, {
        pattern,
        page,
        rows,
    });
}

export function inspectDisp(receiveUserId, authorizedSendUserId) {
    return get('clannad', `message-authorization/${receiveUserId}%26${authorizedSendUserId}/disp/`, {});
}

export function allDisp(page, rows) {
    return get('clannad', 'message-authorization/all/disp/', {
        page,
        rows,
    });
}

export function childForReceiveAccountDisp(accountId, page, rows) {
    return get('clannad', `account/receive/${accountId}/message-authorization/disp/`, {
        page,
        rows,
    });
}

export function childForAuthorizedSendAccountDisp(accountId, page, rows) {
    return get('clannad', `account/authorized-send/${accountId}/message-authorization/disp/`, {
        page,
        rows,
    });
}

export function childForAuthorizedSendAccountIdLikeDisp(accountId, pattern, page,rows){
    return get('clannad', `account/authorized-send/${accountId}/message-authorization/id-like/disp/`, {
        pattern,
        page,
        rows,
    });
}

export function create(receiveUserId, authorizedSendUserId, enabled, remark) {
    return post('clannad', 'message-authorization/create', {
        key:{
            receive_user_id: receiveUserId,
            authorized_send_user_id: authorizedSendUserId,
        },
        enabled,
        remark,
    });
}

export function update(receiveUserId, authorizedSendUserId, enabled, remark) {
    return post('clannad', 'message-authorization/update', {
        key:{
            receive_user_id: receiveUserId,
            authorized_send_user_id: authorizedSendUserId,
        },
        enabled,
        remark,
    });
}

export function remove(receiveUserId, authorizedSendUserId) {
    return post('clannad', 'message-authorization/remove', {
        key:{
            receive_user_id: receiveUserId,
            authorized_send_user_id: authorizedSendUserId,
        },
    });
}


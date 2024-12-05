// noinspection NpmUsedModulesInstalled,JSUnusedGlobalSymbols

import {get, post} from '@/util/http';

export function exists(key) {
    return get('clannad', `message/${key}/exists/`, {});
}

export function inspect(key) {
    return get('clannad', `message/${key}/`, {});
}

export function all(page, rows) {
    return get('clannad', 'message/all/', {
        page,
        rows,
    });
}

export function childForSendAccount(accountId, page, rows) {
    return get('clannad', `account/send/${accountId}/message/`, {
        page,
        rows,
    });
}

export function childForReceiveAccount(accountId, page, rows) {
    return get('clannad', `account/receive/${accountId}/message/`, {
        page,
        rows,
    });
}

export function childForSendAccountDisplay(accountId, page, rows) {
    return get('clannad', `account/send/${accountId}/message/display/`, {
        page,
        rows,
    });
}

export function childForSendAccountStatusEqDisplay(accountId, status, page, rows) {
    return get('clannad', `account/send/${accountId}/message/display/status-eq/`, {
        status,
        page,
        rows,
    });
}

export function childForReceiveAccountDisplay(accountId, page, rows) {
    return get('clannad', `account/receive/${accountId}/message/display/`, {
        page,
        rows,
    });
}

export function inspectDisp(id) {
    return get('clannad', `message/${id}/disp/`, {});
}

export function allDisp(page, rows) {
    return get('clannad', 'message/all/disp/', {
        page,
        rows,
    });
}

export function childForSendAccountDisp(accountId, page, rows) {
    return get('clannad', `account/send/${accountId}/message/disp/`, {
        page,
        rows,
    });
}

export function childForReceiveAccountDisp(accountId, page, rows) {
    return get('clannad', `account/receive/${accountId}/message/disp/`, {
        page,
        rows,
    });
}

export function childForSendAccountDisplayDisp(accountId, page, rows) {
    return get('clannad', `account/send/${accountId}/message/display/disp/`, {
        page,
        rows,
    });
}

export function childForSendAccountStatusEqDisplayDisp(accountId, status, page, rows) {
    return get('clannad', `account/send/${accountId}/message/display/status-eq/disp/`, {
        status,
        page,
        rows,
    });
}

export function childForReceiveAccountDisplayDisp(accountId, page, rows) {
    return get('clannad', `account/receive/${accountId}/message/display/disp/`, {
        page,
        rows,
    });
}

export function create(receiveUserKey, subject, remark) {
    let final_receive_user_key = null;
    if (receiveUserKey) {
        final_receive_user_key = {
            string_id: receiveUserKey,
        }
    }
    return post('clannad', 'message/create/', {
        receive_user_key: final_receive_user_key,
        subject,
        remark,
    });
}

export function update(messageKey, receiveUserKey, subject, remark,) {
    let final_receive_user_key = null;
    if (receiveUserKey) {
        final_receive_user_key = {
            string_id: receiveUserKey,
        }
    }
    return post('clannad', 'message/update/', {
        message_key: {
            long_id: messageKey,
        },
        receive_user_key: final_receive_user_key,
        subject,
        remark,
    });
}

export function remove(messageKey) {
    return post('clannad', 'message/remove/', {
        message_key: {
            long_id: messageKey,
        },
    });
}

export function markSent(messageKey) {
    return post('clannad', 'message/mark-sent/', {
        message_key: {
            long_id: messageKey,
        },
    });
}

export function markReceived(messageKey) {
    return post('clannad', 'message/mark-received/', {
        message_key: {
            long_id: messageKey,
        },
    });
}

export function markReceiveUserHide(messageKey) {
    return post('clannad', 'message/mark-receive-user-hide/', {
        message_key: {
            long_id: messageKey,
        },
    });
}


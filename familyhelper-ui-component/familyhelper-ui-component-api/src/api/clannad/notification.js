import {
    get, post, del
} from '@/util/http';

export function exists(key) {
    return get('clannad', `notification/${key}/exists/`, {});
}

export function inspect(key) {
    return get('clannad', `notification/${key}/`, {});
}

export function remove(key) {
    return del('clannad', `notification/${key}/`, {});
}

export function all(page, rows) {
    return get('clannad', 'notification/all/', {
        page,
        rows,
    });
}

export function childForUser(userKey, page, rows) {
    return get('clannad', `user/${userKey}/notification/`, {
        page,
        rows,
    });
}

export function childForUserUnread(userKey, page, rows) {
    return get('clannad', `user/${userKey}/notification/unread/`, {
        page,
        rows,
    });
}

export function create(userKey, message, remark) {
    return post('clannad', 'notification/create', {
        user_key: {
            string_id: userKey,
        },
        message,
        remark,
    });
}

export function read(key) {
    return post('clannad', 'notification/read', {
        long_id: key
    });
}

export function readAll(userKey) {
    return post('clannad', 'notification/read-all', {
        string_id: userKey
    });
}

export function removeAll(userKey) {
    return post('clannad', 'notification/remove-all', {
        string_id: userKey
    });
}

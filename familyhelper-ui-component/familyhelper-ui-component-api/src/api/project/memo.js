import {
    get, post,
} from '@/util/http';

export function exists(key) {
    return get('project', `memo/${key}/exists/`, {});
}

export function inspect(key) {
    return get('project', `memo/${key}/`, {});
}

export function all(page, rows) {
    return get('project', 'memo/all/', {
        page,
        rows,
    });
}

export function childForUser(userKey, page, rows) {
    return get('project', `user/${userKey}/memo/`, {
        page,
        rows,
    });
}

export function childForUserInProgress(userKey, page, rows) {
    return get('project', `user/${userKey}/memo/in-progress`, {
        page,
        rows,
    });
}

export function childForUserFinished(userKey, page, rows) {
    return get('project', `user/${userKey}/memo/finished`, {
        page,
        rows,
    });
}

export function create(userKey, profile, remark) {
    return post('project', 'memo/create', {
        user_key: {
            string_id: userKey,
        },
        profile,
        remark,
    });
}

export function update(memoKey, profile, remark) {
    return post('project', 'memo/update', {
        memo_key: {
            long_id: memoKey,
        },
        profile,
        remark,
    });
}

export function remove(key) {
    return post('project', 'memo/remove', {
        long_id: key,
    });
}

export function finish(key) {
    return post('project', 'memo/finish', {
        long_id: key,
    });
}

export function removeFinishedMemos() {
    return post('project', 'memo/remove-finished-memos', {});
}

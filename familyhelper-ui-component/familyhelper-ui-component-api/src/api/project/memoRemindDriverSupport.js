import {get} from '@/util/http';

export function exists(key) {
    return get('project', `memo-remind-driver-support/${key}/exists/`, {});
}

export function inspect(key) {
    return get('project', `memo-remind-driver-support/${key}/`, {});
}

export function all(page, rows) {
    return get('project', 'memo-remind-driver-support/all/', {
        page,
        rows,
    });
}

export function idLike(pattern, page, rows) {
    return get('project', 'memo-remind-driver-support/id-like/', {
        pattern,
        page,
        rows,
    });
}

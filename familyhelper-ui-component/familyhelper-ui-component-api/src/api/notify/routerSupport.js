import {get} from '@/util/http';

export function exists(key) {
    return get('notify', `router-support/${key}/exists/`, {});
}

export function inspect(key) {
    return get('notify', `router-support/${key}/`, {});
}

export function all(page, rows) {
    return get('notify', 'router-support/all/', {
        page,
        rows,
    });
}

export function idLike(pattern, page, rows) {
    return get('notify', 'router-support/id-like/', {
        pattern,
        page,
        rows,
    });
}

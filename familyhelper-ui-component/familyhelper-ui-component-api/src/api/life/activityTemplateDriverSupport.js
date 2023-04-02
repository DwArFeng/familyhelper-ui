import {get} from '@/util/http';

export function exists(key) {
    return get('life', `activity-template-driver-support/${key}/exists/`, {});
}

export function inspect(key) {
    return get('life', `activity-template-driver-support/${key}/`, {});
}

export function all(page, rows) {
    return get('life', 'activity-template-driver-support/all/', {
        page,
        rows,
    });
}

export function idLike(pattern, page, rows) {
    return get('life', 'activity-template-driver-support/id-like/', {
        pattern,
        page,
        rows,
    });
}

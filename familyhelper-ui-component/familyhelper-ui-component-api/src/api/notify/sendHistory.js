import {del, get} from '@/util/http';

export function exists(key) {
    return get('notify', `send-history/${key}/exists/`, {});
}

export function inspect(key) {
    return get('notify', `send-history/${key}/`, {});
}

export function remove(key) {
    return del('notify', `send-history/${key}/`, {});
}

export function all(page, rows) {
    return get('notify', 'send-history/all/', {
        page,
        rows,
    });
}

export function inspectDisp(key) {
    return get('notify', `send-history/${key}/disp`, {});
}

export function allDisp(page, rows) {
    return get('notify', 'send-history/all/disp', {
        page,
        rows,
    });
}

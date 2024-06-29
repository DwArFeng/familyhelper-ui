import {get, post} from '@/util/http';

export function exists(key) {
    return get('settingrepo', `text-node/${key}/exists/`, {});
}

export function inspect(key) {
    return get('settingrepo', `text-node/${key}/`, {});
}

export function all(page, rows) {
    return get('settingrepo', 'text-node/all/', {
        page,
        rows,
    });
}

export function operateInspect(category, args) {
    return post('settingrepo', 'text-node/inspect/', {
        category,
        args
    });
}

export function operatePut(category, args, value) {
    return post('settingrepo', 'text-node/put/', {
        category,
        args,
        value
    });
}

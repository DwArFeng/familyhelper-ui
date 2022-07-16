import {get} from '@/util/http';

export function exists(key) {
    return get('life', `popb/${key}/exists/`, {});
}

export function inspect(key) {
    return get('life', `popb/${key}/`, {});
}

export function inspectDisp(key) {
    return get('life', `popb/${key}/disp/`, {});
}

export function childForPbSet(pbSetKey, page, rows) {
    return get('life', `pb-set/${pbSetKey}/popb/`, {
        page,
        rows,
    });
}

export function childForPbSetDisp(pbSetKey, page, rows) {
    return get('life', `pb-set/${pbSetKey}/popb/disp/`, {
        page,
        rows,
    });
}

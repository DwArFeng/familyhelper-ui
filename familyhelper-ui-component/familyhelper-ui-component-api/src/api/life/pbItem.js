import {get, post,} from '@/util/http';

export function exists(key) {
    return get('life', `pb-item/${key}/exists/`, {});
}

export function inspect(key) {
    return get('life', `pb-item/${key}/`, {});
}

export function all(page, rows) {
    return get('life', 'pb-item/all/', {
        page,
        rows,
    });
}

export function childForPbNode(pbNodeKey, page, rows) {
    return get('life', `pb-node/${pbNodeKey}/pb-item/`, {
        page,
        rows,
    });
}

export function childForPbSetRoot(pbSetKey, page, rows) {
    return get('life', `pb-set/${pbSetKey}/pb-item/root/`, {
        page,
        rows,
    });
}

export function childForPbSetNameLike(pbSetKey, pattern, page, rows) {
    return get('life', `pb-set/${pbSetKey}/pb-item/name-like/`, {
        pattern,
        page,
        rows,
    });
}

export function inspectDisp(key) {
    return get('life', `pb-item/${key}/disp/`, {});
}

export function allDisp(page, rows) {
    return get('life', 'pb-item/all/disp/', {
        page,
        rows,
    });
}

export function childForPbNodeDisp(pbNodeKey, page, rows) {
    return get('life', `pb-node/${pbNodeKey}/pb-item/disp/`, {
        page,
        rows,
    });
}

export function childForPbSetRootDisp(pbSetKey, page, rows) {
    return get('life', `pb-set/${pbSetKey}/pb-item/root/disp`, {
        page,
        rows,
    });
}

export function childForPbSetNameLikeDisp(pbSetKey, pattern, page, rows) {
    return get('life', `pb-set/${pbSetKey}/pb-item/name-like/disp/`, {
        pattern,
        page,
        rows,
    });
}

export function create(setKey, nodeKey, name, unit, comparator, remark) {
    let finalNodeKey = {
        long_id: nodeKey
    }
    if (nodeKey === '') {
        finalNodeKey = null;
    }
    return post('life', 'pb-item/create', {
        set_key: {
            long_id: setKey
        },
        node_key: finalNodeKey,
        name,
        unit,
        comparator,
        remark,
    });
}

export function update(key, nodeKey, name, unit, comparator, remark) {
    let finalNodeKey = {
        long_id: nodeKey
    }
    if (nodeKey === '') {
        finalNodeKey = null;
    }
    return post('life', 'pb-item/update', {
        key: {
            long_id: key,
        },
        node_key: finalNodeKey,
        name,
        unit,
        comparator,
        remark,
    });
}

export function remove(key) {
    return post('life', 'pb-item/remove', {
        long_id: key,
    });
}

export function pathFromRoot(key) {
    return get('life', `pb-item/${key}/path-from-root/`, {});
}

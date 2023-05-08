import {get, post,} from '@/util/http';

export function exists(key) {
    return get('life', `pb-node/${key}/exists/`, {});
}

export function inspect(key) {
    return get('life', `pb-node/${key}/`, {});
}

export function all(page, rows) {
    return get('life', 'pb-node/all/', {
        page,
        rows,
    });
}

export function childForPbSet(pbSetKey, page, rows) {
    return get('life', `pb-set/${pbSetKey}/pb-node/`, {
        page,
        rows,
    });
}

export function childForPbSetRoot(pbSetKey, page, rows) {
    return get('life', `pb-set/${pbSetKey}/pb-node/root/`, {
        page,
        rows,
    });
}

export function childForParent(parentKey, page, rows) {
    return get('life', `pb-node/${parentKey}/child/`, {
        page,
        rows,
    });
}

export function childForPbSetNameLike(pbSetKey, pattern, page, rows) {
    return get('life', `pb-set/${pbSetKey}/pb-node/name-like/`, {
        pattern,
        page,
        rows,
    });
}

export function inspectDisp(key) {
    return get('life', `pb-node/${key}/disp/`, {});
}

export function allDisp(page, rows) {
    return get('life', 'pb-node/all/disp/', {
        page,
        rows,
    });
}

export function childForPbSetDisp(pbSetKey, page, rows) {
    return get('life', `pb-set/${pbSetKey}/pb-node/disp/`, {
        page,
        rows,
    });
}

export function childForPbSetRootDisp(pbSetKey, page, rows) {
    return get('life', `pb-set/${pbSetKey}/pb-node/root/disp`, {
        page,
        rows,
    });
}

export function childForParentDisp(parentKey, page, rows) {
    return get('life', `pb-node/${parentKey}/child/disp`, {
        page,
        rows,
    });
}

export function childForPbSetNameLikeDisp(pbSetKey, pattern, page, rows) {
    return get('life', `pb-set/${pbSetKey}/pb-node/name-like/disp/`, {
        pattern,
        page,
        rows,
    });
}

export function nodePathFromRoot(key) {
    return get('life', `pb-node/${key}/path-from-root/`, {});
}

export function nodePathFromRootDisp(key) {
    return get('life', `pb-node/${key}/path-from-root/disp/`, {});
}

export function itemPathFromRoot(key) {
    return get('life', `pb-item/${key}/path-from-root/`, {});
}

export function itemPathFromRootDisp(key) {
    return get('life', `pb-item/${key}/path-from-root/disp/`, {});
}

export function create(setKey, parentKey, name, remark) {
    let finalParentKey = {
        long_id: parentKey,
    };
    if (parentKey === '') {
        finalParentKey = null;
    }
    return post('life', 'pb-node/create', {
        set_key: {
            long_id: setKey,
        },
        parent_key: finalParentKey,
        name,
        remark,
    });
}

export function update(key, parentKey, name, remark) {
    let finalParentKey = {
        long_id: parentKey,
    };
    if (parentKey === '') {
        finalParentKey = null;
    }
    return post('life', 'pb-node/update', {
        key: {
            long_id: key,
        },
        parent_key: finalParentKey,
        name,
        remark,
    });
}

export function remove(key) {
    return post('life', 'pb-node/remove', {
        long_id: key,
    });
}

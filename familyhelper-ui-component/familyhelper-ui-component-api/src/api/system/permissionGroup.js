import {
    del, get, patch, post,
} from '@/util/http';

export function exists(key) {
    return get('system', `permission-group/${key}/exists`, {});
}

export function inspect(key) {
    return get('system', `permission-group/${key}`, {});
}

export function insert(key, parentKey, name, remark) {
    let finalKey = {string_id: key};
    let finalParentKey = {string_id: parentKey};
    if (key === '') {
        finalKey = null;
    }
    if (parentKey === '') {
        finalParentKey = null;
    }
    return post('system', 'permission-group/', {
        key: finalKey,
        parent_key: finalParentKey,
        name,
        remark,
    });
}

export function remove(key, nested) {
    return del('system', `permission-group/${key}/`, {
        nested,
    });
}

export function update(key, parentKey, name, remark) {
    let finalParentKey = {string_id: parentKey};
    if (parentKey === '') {
        finalParentKey = null;
    }
    return patch('system', 'permission-group/', {
        key: {
            string_id: key,
        },
        parent_key: finalParentKey,
        name,
        remark,
    });
}

export function all(page, rows) {
    return get('system', 'permission-group/all', {
        page,
        rows,
    });
}

export function idLike(pattern, page, rows) {
    return get('system', 'permission-group/id-like', {
        pattern,
        page,
        rows,
    });
}

export function childForParent(parentKey, page, rows) {
    return get('system', `permission-group/${parentKey}/child`, {
        page,
        rows,
    });
}

export function inspectDisp(key) {
    return get('system', `permission-group/${key}/disp`, {});
}

export function childForParentDisp(parentKey, page, rows) {
    return get('system', `permission-group/${parentKey}/child/disp`, {
        page,
        rows,
    });
}

export function childForRootDisp(page, rows) {
    return get('system', 'permission-group/root/child/disp', {
        page,
        rows,
    });
}

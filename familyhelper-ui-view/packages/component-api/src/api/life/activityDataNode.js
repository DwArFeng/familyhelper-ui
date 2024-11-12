// noinspection NpmUsedModulesInstalled,JSUnusedGlobalSymbols

import {get, post,} from '@/util/http';

export function exists(key) {
    return get('life', `activity-data-node/${key}/exists/`, {});
}

export function inspect(key) {
    return get('life', `activity-data-node/${key}/`, {});
}

export function all(page, rows) {
    return get('life', 'activity-data-node/all/', {
        page,
        rows,
    });
}

export function childForActivityDataSet(activityDataSetKey, page, rows) {
    return get('life', `activity-data-set/${activityDataSetKey}/activity-data-node/`, {
        page,
        rows,
    });
}

export function childForActivityDataSetRoot(activityDataSetKey, page, rows) {
    return get('life', `activity-data-set/${activityDataSetKey}/activity-data-node/root/`, {
        page,
        rows,
    });
}

export function childForParent(parentKey, page, rows) {
    return get('life', `activity-data-node/${parentKey}/child/`, {
        page,
        rows,
    });
}

export function childForActivityDataSetNameLike(activityDataSetKey, pattern, page, rows) {
    return get('life', `activity-data-set/${activityDataSetKey}/activity-data-node/name-like/`, {
        pattern,
        page,
        rows,
    });
}

export function inspectDisp(key) {
    return get('life', `activity-data-node/${key}/disp/`, {});
}

export function allDisp(page, rows) {
    return get('life', 'activity-data-node/all/disp/', {
        page,
        rows,
    });
}

export function childForActivityDataSetDisp(activityDataSetKey, page, rows) {
    return get('life', `activity-data-set/${activityDataSetKey}/activity-data-node/disp/`, {
        page,
        rows,
    });
}

export function childForActivityDataSetRootDisp(activityDataSetKey, page, rows) {
    return get('life', `activity-data-set/${activityDataSetKey}/activity-data-node/root/disp/`, {
        page,
        rows,
    });
}

export function childForParentDisp(parentKey, page, rows) {
    return get('life', `activity-data-node/${parentKey}/child/disp/`, {
        page,
        rows,
    });
}

export function childForActivityDataSetNameLikeDisp(activityDataSetKey, pattern, page, rows) {
    return get('life', `activity-data-set/${activityDataSetKey}/activity-data-node/name-like/disp/`, {
        pattern,
        page,
        rows,
    });
}

export function nodePathFromRoot(key) {
    return get('life', `activity-data-node/${key}/path-from-root/`, {});
}

export function nodePathFromRootDisp(key) {
    return get('life', `activity-data-node/${key}/path-from-root/disp/`, {});
}

export function itemPathFromRoot(key) {
    return get('life', `activity-data-item/${key}/path-from-root/`, {});
}

export function itemPathFromRootDisp(key) {
    return get('life', `activity-data-item/${key}/path-from-root/disp/`, {});
}

export function create(setKey, parentKey, name, remark) {
    let finalParentKey = {
        long_id: parentKey,
    };
    if (parentKey === '') {
        finalParentKey = null;
    }
    return post('life', 'activity-data-node/create/', {
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
    return post('life', 'activity-data-node/update/', {
        key: {
            long_id: key,
        },
        parent_key: finalParentKey,
        name,
        remark,
    });
}

export function remove(key) {
    return post('life', 'activity-data-node/remove/', {
        long_id: key,
    });
}

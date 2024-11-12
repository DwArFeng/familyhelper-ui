// noinspection NpmUsedModulesInstalled,JSUnusedGlobalSymbols

import {get, post,} from '@/util/http';

export function exists(key) {
    return get('life', `activity-data-item/${key}/exists/`, {});
}

export function inspect(key) {
    return get('life', `activity-data-item/${key}/`, {});
}

export function all(page, rows) {
    return get('life', 'activity-data-item/all/', {
        page,
        rows,
    });
}

export function childForActivityDataNode(activityDataNodeKey, page, rows) {
    return get('life', `activity-data-node/${activityDataNodeKey}/activity-data-item/`, {
        page,
        rows,
    });
}

export function childForActivityDataSetRoot(activityDataSetKey, page, rows) {
    return get('life', `activity-data-set/${activityDataSetKey}/activity-data-item/root/`, {
        page,
        rows,
    });
}

export function childForActivityDataSetNameLike(activityDataSetKey, pattern, page, rows) {
    return get('life', `activity-data-set/${activityDataSetKey}/activity-data-item/name-like/`, {
        pattern,
        page,
        rows,
    });
}

export function inspectDisp(key) {
    return get('life', `activity-data-item/${key}/disp/`, {});
}

export function allDisp(page, rows) {
    return get('life', 'activity-data-item/all/disp/', {
        page,
        rows,
    });
}

export function childForActivityDataNodeDisp(activityDataNodeKey, page, rows) {
    return get('life', `activity-data-node/${activityDataNodeKey}/activity-data-item/disp/`, {
        page,
        rows,
    });
}

export function childForActivityDataSetRootDisp(activityDataSetKey, page, rows) {
    return get('life', `activity-data-set/${activityDataSetKey}/activity-data-item/root/disp/`, {
        page,
        rows,
    });
}

export function childForActivityDataSetNameLikeDisp(activityDataSetKey, pattern, page, rows) {
    return get('life', `activity-data-set/${activityDataSetKey}/activity-data-item/name-like/disp/`, {
        pattern,
        page,
        rows,
    });
}

export function create(setKey, nodeKey, name, remark) {
    let finalNodeKey = {
        long_id: nodeKey
    }
    if (nodeKey === '') {
        finalNodeKey = null;
    }
    return post('life', 'activity-data-item/create/', {
        set_key: {
            long_id: setKey
        },
        node_key: finalNodeKey,
        name,
        remark,
    });
}

export function update(key, nodeKey, name, remark) {
    let finalNodeKey = {
        long_id: nodeKey
    }
    if (nodeKey === '') {
        finalNodeKey = null;
    }
    return post('life', 'activity-data-item/update/', {
        key: {
            long_id: key,
        },
        node_key: finalNodeKey,
        name,
        remark,
    });
}

export function remove(key) {
    return post('life', 'activity-data-item/remove/', {
        long_id: key,
    });
}

import {
    get, post,
} from '@/util/http';

export function exists(key) {
    return get('assets', `item/${key}/exists/`, {});
}

export function inspect(key) {
    return get('assets', `item/${key}/`, {});
}

export function all(page, rows) {
    return get('assets', 'item/all/', {
        page,
        rows,
    });
}

export function childForAssetCatalog(assetCatalogKey, page, rows) {
    return get('assets', `asset-catalog/${assetCatalogKey}/item/`, {
        page,
        rows,
    });
}

export function childForAssetCatalogRoot(assetCatalogKey, page, rows) {
    return get('assets', `asset-catalog/${assetCatalogKey}/item/root/`, {
        page,
        rows,
    });
}

export function childForParent(parentKey, page, rows) {
    return get('assets', `item/${parentKey}/child/`, {
        page,
        rows,
    });
}

export function childForAssetCatalogNameLike(assetCatalogKey, pattern, page, rows) {
    return get('assets', `asset-catalog/${assetCatalogKey}/item/name-like/`, {
        pattern,
        page,
        rows,
    });
}

export function inspectDisp(key) {
    return get('assets', `item/${key}/disp/`, {});
}

export function allDisp(page, rows) {
    return get('assets', 'item/all/disp/', {
        page,
        rows,
    });
}

export function childForAssetCatalogDisp(assetCatalogKey, page, rows) {
    return get('assets', `asset-catalog/${assetCatalogKey}/item/disp/`, {
        page,
        rows,
    });
}

export function childForAssetCatalogRootDisp(assetCatalogKey, page, rows) {
    return get('assets', `asset-catalog/${assetCatalogKey}/item/root/disp/`, {
        page,
        rows,
    });
}

export function childForParentDisp(parentKey, page, rows) {
    return get('assets', `item/${parentKey}/child/disp/`, {
        page,
        rows,
    });
}

export function childForAssetCatalogNameLikeDisp(assetCatalogKey, pattern, page, rows) {
    return get('assets', `asset-catalog/${assetCatalogKey}/item/name-like/disp/`, {
        pattern,
        page,
        rows,
    });
}

export function pathFromRoot(key) {
    return get('assets', `item/${key}/path-from-root/`, {});
}

export function pathFromRootDisp(key) {
    return get('assets', `item/${key}/path-from-root/disp/`, {});
}

export function create(assetCatalogKey, parentKey, labelKeys, name, type, lifeCycle, remark) {
    let finalParentKey = {
        long_id: parentKey,
    };
    if (parentKey === '') {
        finalParentKey = null;
    }
    const finalLabelKeys = labelKeys.map((key) => ({string_id: key}));
    return post('assets', 'item/create/', {
        asset_catalog_key: {
            long_id: assetCatalogKey,
        },
        parent_key: finalParentKey,
        label_keys: finalLabelKeys,
        name,
        type,
        life_cycle: lifeCycle,
        remark,
    });
}

export function update(itemKey, parentKey, labelKeys, name, type, lifeCycle, remark) {
    let finalParentKey = {
        long_id: parentKey,
    };
    if (parentKey === '') {
        finalParentKey = null;
    }
    const finalLabelKeys = labelKeys.map((key) => ({string_id: key}));
    return post('assets', 'item/update/', {
        item_key: {
            long_id: itemKey,
        },
        parent_key: finalParentKey,
        label_keys: finalLabelKeys,
        name,
        type,
        life_cycle: lifeCycle,
        remark,
    });
}

export function remove(key) {
    return post('assets', 'item/remove/', {
        long_id: key,
    });
}

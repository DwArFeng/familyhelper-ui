import {
    get, post,
} from '@/util/http';

export function exists(key) {
    return get('assets', `asset-catalog/${key}/exists/`, {});
}

export function inspect(key) {
    return get('assets', `asset-catalog/${key}/`, {});
}

export function all(page, rows) {
    return get('assets', 'asset-catalog/all/', {
        page,
        rows,
    });
}

export function allPermitted(page, rows) {
    return get('assets', 'asset-catalog/all-permitted/disp/', {
        page,
        rows,
    });
}

export function allOwned(page, rows) {
    return get('assets', 'asset-catalog/all-owned/disp/', {
        page,
        rows,
    });
}

export function create(name, remark) {
    return post('assets', 'asset-catalog/create', {
        name,
        remark,
    });
}

export function update(key, name, remark) {
    return post('assets', 'asset-catalog/update', {
        asset_catalog_key: {
            long_id: key,
        },
        name,
        remark,
    });
}

export function remove(key) {
    return post('assets', 'asset-catalog/remove', {
        long_id: key,
    });
}

export function upsertPermission(assetCatalogKey, userKey, permissionLevel) {
    return post('assets', 'asset-catalog/upsert-permission', {
        asset_catalog_key: {
            long_id: assetCatalogKey,
        },
        user_key: {
            string_id: userKey,
        },
        permission_level: permissionLevel,
    });
}

export function removePermission(assetCatalogKey, userKey) {
    return post('assets', 'asset-catalog/remove-permission', {
        asset_catalog_key: {
            long_id: assetCatalogKey,
        },
        user_key: {
            string_id: userKey,
        },
    });
}

import {
    get, post,
} from '@/util/http';

export function exists(key) {
    return get('project', `project/${key}/exists/`, {});
}

export function inspect(key) {
    return get('project', `project/${key}/`, {});
}

export function all(page, rows) {
    return get('project', 'project/all/', {
        page,
        rows,
    });
}

export function allPermitted(page, rows) {
    return get('project', 'project/all-permitted/disp/', {
        page,
        rows,
    });
}

export function allOwned(page, rows) {
    return get('project', 'project/all-owned/disp/', {
        page,
        rows,
    });
}

export function create(name, remark, status) {
    return post('project', 'project/create', {
        name,
        remark,
        status,
    });
}

export function update(key, name, remark, status) {
    return post('project', 'project/update', {
        project_key: {
            long_id: key,
        },
        name,
        remark,
        status,
    });
}

export function remove(key) {
    return post('project', 'project/remove', {
        long_id: key,
    });
}

export function upsertPermission(assetCatalogKey, userKey, permissionLevel) {
    return post('project', 'project/upsert-permission', {
        project_key: {
            long_id: assetCatalogKey,
        },
        user_key: {
            string_id: userKey,
        },
        permission_level: permissionLevel,
    });
}

export function removePermission(assetCatalogKey, userKey) {
    return post('project', 'project/remove-permission', {
        project_key: {
            long_id: assetCatalogKey,
        },
        user_key: {
            string_id: userKey,
        },
    });
}

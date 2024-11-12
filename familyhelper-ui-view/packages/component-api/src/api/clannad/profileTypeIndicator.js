// noinspection NpmUsedModulesInstalled,JSUnusedGlobalSymbols

import {
    del, get, patch, post,
} from '@/util/http';

export function exists(category, key) {
    return get('clannad', `profile-type-indicator/${category}%26${key}/exists/`, {});
}

export function inspect(category, key) {
    return get('clannad', `profile-type-indicator/${category}%26${key}/`, {});
}

export function insert(category, key, label, remark) {
    return post('clannad', 'profile-type-indicator/', {
        key: {
            category_id: category,
            string_id: key,
        },
        label,
        remark,
    });
}

export function remove(category, key) {
    return del('clannad', `profile-type-indicator/${category}%26${key}/`, {});
}

export function update(category, key, label, remark) {
    return patch('clannad', 'profile-type-indicator/', {
        key: {
            category_id: category,
            string_id: key,
        },
        label,
        remark,
    });
}

export function childForCategory(category, page, rows) {
    return get('clannad', 'profile-type-indicator/child-for-category/', {
        category,
        page,
        rows,
    });
}

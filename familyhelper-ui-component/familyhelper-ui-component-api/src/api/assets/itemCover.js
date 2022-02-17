import {
    get, getBlob, post, postFormData,
} from '@/util/http';

export function exists(key) {
    return get('assets', `item-cover/${key}/exists/`, {});
}

export function inspect(key) {
    return get('assets', `item-cover/${key}/`, {});
}

export function childForItem(itemKey, page, rows) {
    return get('assets', `item/${itemKey}/item-cover/`, {
        page,
        rows,
    });
}

export function download(key) {
    return getBlob('assets', `item-cover/${key}/download/`, {});
}

export function upload(itemKey, formData) {
    return postFormData('assets', `item/${itemKey}/item-cover/upload/`, formData);
}

export function remove(key) {
    return post('assets', 'item-cover/remove/', {
        long_id: key,
    });
}

export function updateOrder(keys) {
    return post('assets', 'item-cover/update-order/', {
        item_cover_keys: keys,
    });
}

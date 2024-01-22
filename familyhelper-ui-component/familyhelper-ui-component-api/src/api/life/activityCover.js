import {
    get, getBlob, post, postFormData,
} from '@/util/http';

export function exists(key) {
    return get('life', `activity-cover/${key}/exists/`, {});
}

export function inspect(key) {
    return get('life', `activity-cover/${key}/`, {});
}

export function childForActivity(itemKey, page, rows) {
    return get('life', `activity/${itemKey}/activity-cover/`, {
        page,
        rows,
    });
}

export function download(key) {
    return getBlob('life', `activity-cover/${key}/download/`, {});
}

export function upload(itemKey, formData) {
    return postFormData('life', `item/${itemKey}/activity-cover/upload/`, formData);
}

export function remove(key) {
    return post('life', 'activity-cover/remove/', {
        long_id: key,
    });
}

export function updateOrder(keys) {
    return post('life', 'activity-cover/update-order/', {
        activity_cover_keys: keys,
    });
}

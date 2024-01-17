import {
    get, getBlob, post, postFormData,
} from '@/util/http';

export function exists(key) {
    return get('life', `activity-template-cover/${key}/exists/`, {});
}

export function inspect(key) {
    return get('life', `activity-template-cover/${key}/`, {});
}

export function childForActivityTemplate(itemKey, page, rows) {
    return get('life', `activity-template/${itemKey}/activity-template-cover/`, {
        page,
        rows,
    });
}

export function download(key) {
    return getBlob('life', `activity-template-cover/${key}/download/`, {});
}

export function upload(itemKey, formData) {
    return postFormData('life', `item/${itemKey}/activity-template-cover/upload/`, formData);
}

export function remove(key) {
    return post('life', 'activity-template-cover/remove/', {
        long_id: key,
    });
}

export function updateOrder(keys) {
    return post('life', 'activity-template-cover/update-order/', {
        activity_template_cover_keys: keys,
    });
}

import {
    get, getBlob, post, postFormData,
} from '@/util/http';

export function exists(key) {
    return get('life', `activity-file/${key}/exists/`, {});
}

export function inspect(key) {
    return get('life', `activity-file/${key}/`, {});
}

export function childForActivity(activityKey, page, rows) {
    return get('life', `activity/${activityKey}/activity-file/default/`, {
        page,
        rows,
    });
}

export function childForActivityInspectedDateDesc(activityKey, page, rows) {
    return get('life', `activity/${activityKey}/activity-file/inspected-date-desc/`, {
        page,
        rows,
    });
}

export function childForActivityModifiedDateDesc(activityKey, page, rows) {
    return get('life', `activity/${activityKey}/activity-file/modified-date-desc/`, {
        page,
        rows,
    });
}

export function childForActivityOriginNameAsc(activityKey, page, rows) {
    return get('life', `activity/${activityKey}/activity-file/origin-name-asc/`, {
        page,
        rows,
    });
}

export function childForActivityCreatedDateAsc(activityKey, page, rows) {
    return get('life', `activity/${activityKey}/activity-file/created-date-asc/`, {
        page,
        rows,
    });
}

export function download(key) {
    return getBlob('life', `activity-file/${key}/download/`, {});
}

export function upload(activityKey, formData) {
    return postFormData('life', `activity/${activityKey}/activity-file/upload/`, formData);
}

export function update(activityFileKey, formData) {
    return postFormData('life', `/activity-file/${activityFileKey}/update/`, formData);
}

export function remove(key) {
    return post('life', 'activity-file/remove/', {
        long_id: key,
    });
}

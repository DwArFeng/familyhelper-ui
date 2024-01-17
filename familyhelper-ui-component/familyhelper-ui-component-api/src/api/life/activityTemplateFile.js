import {
    get, getBlob, post, postFormData,
} from '@/util/http';

export function exists(key) {
    return get('life', `activity-template-file/${key}/exists/`, {});
}

export function inspect(key) {
    return get('life', `activity-template-file/${key}/`, {});
}

export function childForActivityTemplate(activityTemplateKey, page, rows) {
    return get('life', `activity-template/${activityTemplateKey}/activity-template-file/default/`, {
        page,
        rows,
    });
}

export function childForActivityTemplateInspectedDateDesc(activityTemplateKey, page, rows) {
    return get('life', `activity-template/${activityTemplateKey}/activity-template-file/inspected-date-desc/`, {
        page,
        rows,
    });
}

export function childForActivityTemplateModifiedDateDesc(activityTemplateKey, page, rows) {
    return get('life', `activity-template/${activityTemplateKey}/activity-template-file/modified-date-desc/`, {
        page,
        rows,
    });
}

export function childForActivityTemplateOriginNameAsc(activityTemplateKey, page, rows) {
    return get('life', `activity-template/${activityTemplateKey}/activity-template-file/origin-name-asc/`, {
        page,
        rows,
    });
}

export function childForActivityTemplateCreatedDateAsc(activityTemplateKey, page, rows) {
    return get('life', `activity-template/${activityTemplateKey}/activity-template-file/created-date-asc/`, {
        page,
        rows,
    });
}

export function download(key) {
    return getBlob('life', `activity-template-file/${key}/download/`, {});
}

export function upload(activityTemplateKey, formData) {
    return postFormData('life', `activity-template/${activityTemplateKey}/activity-template-file/upload/`, formData);
}

export function update(activityTemplateFileKey, formData) {
    return postFormData('life', `/activity-template-file/${activityTemplateFileKey}/update/`, formData);
}

export function remove(key) {
    return post('life', 'activity-template-file/remove/', {
        long_id: key,
    });
}

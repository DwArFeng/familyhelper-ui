import {
    get, getBlob, post, postFormData,
} from '@/util/http';

export function exists(key) {
    return get('life', `pb-file/${key}/exists/`, {});
}

export function inspect(key) {
    return get('life', `pb-file/${key}/`, {});
}

export function childForPbRecord(pbRecordKey, page, rows) {
    return get('life', `pb-record/${pbRecordKey}/pb-file/default/`, {
        page,
        rows,
    });
}

export function childForPbRecordInspectedDateDesc(pbRecordKey, page, rows) {
    return get('life', `pb-record/${pbRecordKey}/pb-file/inspected-date-desc/`, {
        page,
        rows,
    });
}

export function childForPbRecordOriginNameAsc(pbRecordKey, page, rows) {
    return get('life', `pb-record/${pbRecordKey}/pb-file/origin-name-asc/`, {
        page,
        rows,
    });
}

export function childForPbRecordUploadedDateAsc(pbRecordKey, page, rows) {
    return get('life', `pb-record/${pbRecordKey}/pb-file/uploaded-date-asc/`, {
        page,
        rows,
    });
}

export function download(key) {
    return getBlob('life', `pb-file/${key}/download/`, {});
}

export function upload(pbRecordKey, formData) {
    return postFormData('life', `pb-record/${pbRecordKey}/pb-file/upload/`, formData);
}

export function remove(key) {
    return post('life', 'pb-file/remove/', {
        long_id: key,
    });
}

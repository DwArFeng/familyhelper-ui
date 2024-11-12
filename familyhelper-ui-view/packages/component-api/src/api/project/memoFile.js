// noinspection NpmUsedModulesInstalled,JSUnusedGlobalSymbols

import {
    get, getBlob, post, postFormData,
} from '@/util/http';

export function exists(key) {
    return get('project', `memo-file/${key}/exists/`, {});
}

export function inspect(key) {
    return get('project', `memo-file/${key}/`, {});
}

export function childForMemo(memoKey, page, rows) {
    return get('project', `memo/${memoKey}/memo-file/default/`, {
        page,
        rows,
    });
}

export function childForMemoInspectedDateDesc(memoKey, page, rows) {
    return get('project', `memo/${memoKey}/memo-file/inspected-date-desc/`, {
        page,
        rows,
    });
}

export function childForMemoModifiedDateDesc(memoKey, page, rows) {
    return get('project', `memo/${memoKey}/memo-file/modified-date-desc/`, {
        page,
        rows,
    });
}

export function childForMemoOriginNameAsc(memoKey, page, rows) {
    return get('project', `memo/${memoKey}/memo-file/origin-name-asc/`, {
        page,
        rows,
    });
}

export function childForMemoCreatedDateAsc(memoKey, page, rows) {
    return get('project', `memo/${memoKey}/memo-file/created-date-asc/`, {
        page,
        rows,
    });
}

export function download(key) {
    return getBlob('project', `memo-file/${key}/download/`, {});
}

export function upload(memoKey, formData) {
    return postFormData('project', `memo/${memoKey}/memo-file/upload/`, formData);
}

export function update(memoFileKey, formData) {
    return postFormData('project', `/memo-file/${memoFileKey}/update/`, formData);
}

export function remove(key) {
    return post('project', 'memo-file/remove/', {
        long_id: key,
    });
}

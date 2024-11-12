// noinspection NpmUsedModulesInstalled,JSUnusedGlobalSymbols

import {
    get, getBlob, post, postFormData,
} from '@/util/http';

export function exists(key) {
    return get('finance', `bill-file/${key}/exists/`, {});
}

export function inspect(key) {
    return get('finance', `bill-file/${key}/`, {});
}

export function childForFundChange(fundChangeKey, page, rows) {
    return get('finance', `fund-change/${fundChangeKey}/bill-file/`, {
        page,
        rows,
    });
}

export function childForFundChangeIndexAsc(fundChangeKey, page, rows) {
    return get('finance', `fund-change/${fundChangeKey}/bill-file/index-asc/`, {
        page,
        rows,
    });
}

export function download(key) {
    return getBlob('finance', `bill-file/${key}/download/`, {});
}

export function upload(fundChangeKey, formData) {
    return postFormData('finance', `fund-change/${fundChangeKey}/bill-file/upload/`, formData);
}

export function remove(key) {
    return post('finance', 'bill-file/remove/', {
        long_id: key,
    });
}

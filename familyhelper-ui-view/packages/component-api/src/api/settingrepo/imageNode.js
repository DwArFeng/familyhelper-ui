// noinspection NpmUsedModulesInstalled,JSUnusedGlobalSymbols

import {Base64} from 'js-base64';
// noinspection NpmUsedModulesInstalled,JSUnusedGlobalSymbols

import {
    get, getBlob, post, postFormData,
} from '@/util/http';

export function exists(key) {
    return get('settingrepo', `image-node/${key}/exists/`, {});
}

export function inspect(key) {
    return get('settingrepo', `image-node/${key}/`, {});
}

export function all(page, rows) {
    return get('settingrepo', 'image-node/all/', {
        page,
        rows,
    });
}

export function operateInspect(category, args) {
    return post('settingrepo', 'image-node/inspect/', {
        category,
        args
    });
}

export function downloadFile(category, args) {
    return getBlob('settingrepo', 'image-node/download-file/', {
        category,
        args
    });
}

export function requestFileStreamVoucher(category, args) {
    return post('settingrepo', 'image-node/request-file-stream-voucher/', {
        category,
        args
    });
}

export function downloadThumbnail(downloadInfo) {
    return getBlob('settingrepo', 'image-node/download-thumbnail/', {
        'download-info': Base64.encode(JSON.stringify(downloadInfo)),
    });
}

export function upload(formData) {
    return postFormData('settingrepo', 'image-node/upload/', formData);
}

export function uploadStream(formData) {
    return postFormData('settingrepo', 'image-node/upload-stream/', formData);
}

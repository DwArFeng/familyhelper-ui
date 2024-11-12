// noinspection NpmUsedModulesInstalled,JSUnusedGlobalSymbols

import {Base64} from 'js-base64';
// noinspection NpmUsedModulesInstalled,JSUnusedGlobalSymbols

import {
    get, getBlob, post, postFormData,
} from '@/util/http';

export function exists(key) {
    return get('settingrepo', `image-list-node/${key}/exists/`, {});
}

export function inspect(key) {
    return get('settingrepo', `image-list-node/${key}/`, {});
}

export function all(page, rows) {
    return get('settingrepo', 'image-list-node/all/', {
        page,
        rows,
    });
}

export function size(category, args) {
    return post('settingrepo', 'image-list-node/size/', {
        category,
        args
    });
}

export function operateInspect(category, args) {
    return post('settingrepo', 'image-list-node/inspect/', {
        category,
        args
    });
}

export function downloadFile(category, args, index) {
    return getBlob('settingrepo', 'image-list-node/download-file/', {
        category,
        args,
        index
    });
}

export function requestFileStreamVoucher(category, args, index) {
    return post('settingrepo', 'image-list-node/request-file-stream-voucher/', {
        category,
        args,
        index
    });
}

export function downloadThumbnail(downloadInfo) {
    return getBlob('settingrepo', 'image-list-node/download-thumbnail/', {
        'download-info': Base64.encode(JSON.stringify(downloadInfo)),
    });
}

export function upload(formData) {
    return postFormData('settingrepo', 'image-list-node/upload/', formData);
}

export function uploadStream(formData) {
    return postFormData('settingrepo', 'image-list-node/upload-stream/', formData);
}

export function update(formData) {
    return postFormData('settingrepo', 'image-list-node/update/', formData);
}

export function updateStream(formData) {
    return postFormData('settingrepo', 'image-list-node/update-stream/', formData);
}

export function changeOrder(category, args, oldIndex, neoIndex) {
    return post('settingrepo', 'image-list-node/change-order/', {
        category,
        args,
        old_index: oldIndex,
        neo_index: neoIndex
    });
}

export function remove(category, args, index) {
    return post('settingrepo', 'image-list-node/remove/', {
        category,
        args,
        index
    });
}

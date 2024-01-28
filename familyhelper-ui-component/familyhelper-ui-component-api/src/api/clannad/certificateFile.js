import {
    get, getBlob, post, postFormData,
} from '@/util/http';

export function exists(key) {
    return get('clannad', `certificate-file/${key}/exists/`, {});
}

export function inspect(key) {
    return get('clannad', `certificate-file/${key}/`, {});
}

export function childForCertificate(certificateKey, page, rows) {
    return get('clannad', `certificate/${certificateKey}/certificate-file/`, {
        page,
        rows,
    });
}

export function downloadFile(key) {
    return getBlob('clannad', `certificate-file/${key}/download-file/`, {});
}

export function downloadThumbnail(key) {
    return getBlob('clannad', `certificate-file/${key}/download-thumbnail/`, {});
}

export function upload(certificateKey, formData) {
    return postFormData('clannad', `certificate/${certificateKey}/certificate-file/upload/`, formData);
}

export function remove(key) {
    return post('clannad', 'certificate-file/remove/', {
        long_id: key,
    });
}

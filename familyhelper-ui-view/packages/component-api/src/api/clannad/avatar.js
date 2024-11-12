// noinspection NpmUsedModulesInstalled,JSUnusedGlobalSymbols

import {
    get, getBlob, postFormData,
} from '@/util/http';

export function exists(key) {
    return get('clannad', `avatar/${key}/exists/`, {});
}

export function inspect(key) {
    return get('clannad', `avatar/${key}/`, {});
}

export function download(key) {
    return getBlob('clannad', `avatar/${key}/download/`, {});
}

export function upload(key, formData) {
    return postFormData('clannad', `avatar/${key}/upload/`, formData);
}

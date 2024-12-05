// noinspection NpmUsedModulesInstalled,JSUnusedGlobalSymbols

import {get, getBlob, postFormData} from '@/util/http';

export function exists(key) {
    return get('clannad', `message-body/${key}/exists/`, {});
}

export function inspect(key) {
    return get('clannad', `message-body/${key}/`, {});
}

export function all(page, rows) {
    return get('clannad', 'message-body/all/', {
        page,
        rows,
    });
}

export function download(key) {
    return getBlob('clannad', `message-body/${key}/download/`, {});
}

export function update(key, formData) {
    return postFormData('clannad', `message-body/${key}/update/`, formData);
}

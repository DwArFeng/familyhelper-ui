// noinspection NpmUsedModulesInstalled,JSUnusedGlobalSymbols

import {get} from '@/util/http';

export function exists(key) {
    return get('note', `ponb/${key}/exists/`, {});
}

export function inspect(key) {
    return get('note', `ponb/${key}/`, {});
}

export function inspectDisp(key) {
    return get('note', `ponb/${key}/disp/`, {});
}

export function childForNoteBook(noteBookKey, page, rows) {
    return get('note', `note-book/${noteBookKey}/ponb/`, {
        page,
        rows,
    });
}

export function childForNoteBookDisp(noteBookKey, page, rows) {
    return get('note', `note-book/${noteBookKey}/ponb/disp/`, {
        page,
        rows,
    });
}

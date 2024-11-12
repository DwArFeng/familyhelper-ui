// noinspection NpmUsedModulesInstalled,JSUnusedGlobalSymbols

import {get} from '@/util/http';

export function exists(key) {
    return get('assets', `poac/${key}/exists/`, {});
}

export function inspect(key) {
    return get('assets', `poac/${key}/`, {});
}

export function inspectDisp(key) {
    return get('assets', `poac/${key}/disp/`, {});
}

export function childForAssetCatalog(assetCatalogKey, page, rows) {
    return get('assets', `asset-catalog/${assetCatalogKey}/poac/`, {
        page,
        rows,
    });
}

export function childForAssetCatalogDisp(assetCatalogKey, page, rows) {
    return get('assets', `asset-catalog/${assetCatalogKey}/poac/disp/`, {
        page,
        rows,
    });
}

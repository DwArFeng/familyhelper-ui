import {get} from '@/util/http';

export function exists(key) {
    return get('clannad', `poce/${key}/exists/`, {});
}

export function inspect(key) {
    return get('clannad', `poce/${key}/`, {});
}

export function inspectDisp(key) {
    return get('clannad', `poce/${key}/disp/`, {});
}

export function childForCertificate(certificateKey, page, rows) {
    return get('clannad', `certificate/${certificateKey}/poce/`, {
        page,
        rows,
    });
}

export function childForCertificateDisp(certificateKey, page, rows) {
    return get('clannad', `certificate/${certificateKey}/poce/disp/`, {
        page,
        rows,
    });
}

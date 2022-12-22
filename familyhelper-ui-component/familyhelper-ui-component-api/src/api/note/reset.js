import {post} from '@/util/http';

export function resetRoute() {
    return post('notify', 'reset-route/', {});
}

export function resetDispatch() {
    return post('notify', 'reset-dispatch/', {});
}

export function resetSend() {
    return post('notify', 'reset-send/', {});
}

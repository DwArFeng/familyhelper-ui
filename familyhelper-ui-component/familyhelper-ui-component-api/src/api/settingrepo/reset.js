import {post} from '@/util/http';

export function resetFormat() {
    return post('settingrepo', 'reset-format/', {});
}

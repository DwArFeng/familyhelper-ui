import {
    del, get, patch, post,
} from '@/util/http';

export function exists(key) {
    return get('settingrepo', `setting-category/${key}/exists/`, {});
}

export function inspect(key) {
    return get('settingrepo', `setting-category/${key}/`, {});
}

export function insert(key, formatterType, formatterParam, remark) {
    return post('settingrepo', 'setting-category/', {
        key: {
            string_id: key,
        },
        formatter_type:formatterType,
        formatter_param:formatterParam,
        remark,
    });
}

export function remove(key) {
    return del('settingrepo', `setting-category/${key}/`, {});
}

export function update(key, formatterType, formatterParam, remark) {
    return patch('settingrepo', 'setting-category/', {
        key: {
            string_id: key,
        },
        formatter_type:formatterType,
        formatter_param:formatterParam,
        remark,
    });
}

export function all(page, rows) {
    return get('settingrepo', 'setting-category/all/', {
        page,
        rows,
    });
}

export function idLike(pattern, page, rows) {
    return get('settingrepo', 'setting-category/id-like/', {
        pattern,
        page,
        rows,
    });
}

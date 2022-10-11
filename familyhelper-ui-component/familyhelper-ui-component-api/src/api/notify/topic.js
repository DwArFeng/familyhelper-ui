import {del, get, patch, post,} from '@/util/http';

export function exists(key) {
    return get('notify', `topic/${key}/exists/`, {});
}

export function inspect(key) {
    return get('notify', `topic/${key}/`, {});
}

export function insert(
    key, label, enabled, priority, preferred, coolDownDuration, executorType, executorParam, remark
) {
    return post('notify', 'topic/', {
        key: {
            string_id: key,
        },
        label,
        enabled,
        priority,
        preferred,
        cool_down_duration: coolDownDuration,
        executor_type:executorType,
        executor_param:executorParam,
        remark,
    });
}

export function remove(key) {
    return del('notify', `topic/${key}/`, {});
}

export function update(
    key, label, enabled, priority, preferred, coolDownDuration,executorType, executorParam, remark
) {
    return patch('notify', 'topic/', {
        key: {
            string_id: key,
        },
        label,
        enabled,
        priority,
        preferred,
        cool_down_duration: coolDownDuration,
        executor_type:executorType,
        executor_param:executorParam,
        remark,
    });
}

export function all(page, rows) {
    return get('notify', 'topic/all/', {
        page,
        rows,
    });
}

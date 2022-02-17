import {
    get, post,
} from '@/util/http';

export function exists(key) {
    return get('project', `task/${key}/exists/`, {});
}

export function inspect(key) {
    return get('project', `task/${key}/`, {});
}

export function all(page, rows) {
    return get('project', 'task/all/', {
        page,
        rows,
    });
}

export function childForProject(projectKey, page, rows) {
    return get('project', `project/${projectKey}/task/`, {
        page,
        rows,
    });
}

export function inspectDisp(key) {
    return get('project', `task/${key}/disp/`, {});
}

export function allDisp(page, rows) {
    return get('project', 'task/all/disp/', {
        page,
        rows,
    });
}

export function childForProjectDisp(projectKey, page, rows) {
    return get('project', `project/${projectKey}/task/disp/`, {
        page,
        rows,
    });
}


export function create(projectKey, type, name, remark, totalMissionCount) {
    return post('project', 'task/create', {
        project_key: {
            long_id: projectKey,
        },
        type,
        name,
        remark,
        total_mission_count: totalMissionCount,
    });
}

//TODO
export function update(key, name, remark, status) {
    return post('project', 'task/update', {
        project_key: {
            long_id: key,
        },
        name,
        remark,
        status,
    });
}

//TODO
export function remove(key) {
    return post('project', 'task/remove', {
        long_id: key,
    });
}

import {
  del, get, patch, post,
} from '@/util/http';

export function exists(subjectUserKey, objectUserKey) {
  return get('clannad', `nickname/${subjectUserKey}%26${objectUserKey}/exists/`, {});
}

export function inspect(subjectUserKey, objectUserKey) {
  return get('clannad', `nickname/${subjectUserKey}%26${objectUserKey}/`, {});
}

export function insert(subjectUserKey, objectUserKey, call, remark) {
  return post('clannad', 'nickname/', {
    key: {
      subject_user_id: subjectUserKey,
      object_user_id: objectUserKey,
    },
    call,
    remark,
  });
}

export function remove(subjectUserKey, objectUserKey) {
  return del('clannad', `nickname/${subjectUserKey}%26${objectUserKey}/`, {});
}

export function update(subjectUserKey, objectUserKey, call, remark) {
  return patch('clannad', 'nickname/', {
    key: {
      subject_user_id: subjectUserKey,
      object_user_id: objectUserKey,
    },
    call,
    remark,
  });
}

export function childForSubjectUser(subjectUserKey, page, rows) {
  return get('clannad', `user/subject/${subjectUserKey}/nickname/`, {
    page,
    rows,
  });
}

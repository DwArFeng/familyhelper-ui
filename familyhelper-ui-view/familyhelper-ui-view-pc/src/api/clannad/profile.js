import {
  get, patch,
} from '@/util/http';

export function exists(key) {
  return get('clannad', `profile/${key}/exists/`, {});
}

export function inspect(key) {
  return get('clannad', `profile/${key}/`, {});
}

export function inspectDisp(key) {
  return get('clannad', `profile/${key}/disp`, {});
}

export function update(key, name, idNumber, motd, birthday, gender, remark) {
  return patch('clannad', 'profile/', {
    key: {
      string_id: key,
    },
    name,
    id_number: idNumber,
    motd,
    birthday,
    gender,
    remark,
  });
}

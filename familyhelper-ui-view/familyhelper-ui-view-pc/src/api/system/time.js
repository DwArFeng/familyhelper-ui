import { post } from '@/util/http';

// 考虑到以后可能还会扩充字段，因此保持该导出模式。
// eslint-disable-next-line import/prefer-default-export
export function currentDate() {
  return post('system', 'current-date', {});
}

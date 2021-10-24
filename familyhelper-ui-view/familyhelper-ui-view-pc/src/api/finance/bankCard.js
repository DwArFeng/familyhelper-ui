import {
  get, post,
} from '@/util/http';

export function exists(key) {
  return get('finance', `bank-card/${key}/exists/`, {});
}

export function inspect(key) {
  return get('finance', `bank-card/${key}/`, {});
}

export function all(page, rows) {
  return get('finance', 'bank-card/all/', {
    page,
    rows,
  });
}

export function childForAccountBook(accountBookKey, page, rows) {
  return get('finance', `account-book/${accountBookKey}/bank-card/`, {
    page,
    rows,
  });
}

export function inspectDisp(key) {
  return get('finance', `bank-card/${key}/disp/`, {});
}

export function allDisp(page, rows) {
  return get('finance', 'bank-card/all/disp/', {
    page,
    rows,
  });
}

export function childForAccountBookDisp(accountBookKey, page, rows) {
  return get('finance', `account-book/${accountBookKey}/bank-card/disp/`, {
    page,
    rows,
  });
}

export function create(accountBookKey, name, cardType, remark) {
  return post('finance', `account-book/${accountBookKey}/bank-card/create`, {
    name,
    card_type: cardType,
    remark,
  });
}

export function update(key, name, cardType, remark) {
  return post('finance', `bank-card/${key}/update`, {
    name,
    card_type: cardType,
    remark,
  });
}

export function remove(key) {
  return post('finance', `bank-card/${key}/remove`, {});
}

export function recordBalance(key, balance) {
  return post('finance', `bank-card/${key}/record-balance`, {
    balance,
  });
}

export function rollbackBalance(key) {
  return post('finance', `bank-card/${key}/rollback-balance`, {});
}

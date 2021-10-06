import Vue from 'vue';

export default function syncPermission(object, propertyName) {
  // noinspection JSUnresolvedVariable
  const currentPermissions = Vue.ls.get('permissionInfo');
  if (currentPermissions == null) { return; }
  const permissionSet = new Set();
  currentPermissions.forEach((item) => {
    permissionSet.add(item);
  });
  Vue.set(object, propertyName, permissionSet);
}

export function permissions() {
  const currentPermissions = Vue.ls.get('permissionInfo');
  const permissionSet = new Set();
  currentPermissions.forEach((item) => {
    permissionSet.add(item);
  });
  return permissionSet;
}

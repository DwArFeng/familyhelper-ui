const assetsManagement = [
  {
    key: 'assetsManagement',
    index: 20,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '资产管理',
      },
      menu: {
        shown: true,
      },
      ezNav: {
        shown: true,
        closedBehavior: {
          type: 'back',
          data: null,
        },
      },
      router: {
        required: false,
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.assets_management',
      },
    },
    node: {
      parentKey: null,
    },
  },
  {
    key: 'assetsManagement.assetCatalog',
    index: 0,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '资产目录管理',
      },
      menu: {
        shown: true,
      },
      ezNav: {
        shown: true,
        closedBehavior: {
          type: 'back',
          data: null,
        },
      },
      router: {
        required: true,
        path: 'app/asset-management/asset-catalog',
        component: () => import('@/views/items/assetsManagement/assetCatalog/AssetCatalog.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.assets_management.assets_catalog',
      },
    },
    node: {
      parentKey: 'assetsManagement',
    },
  },
  {
    key: 'assetsManagement.assetBom',
    index: 10,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '资产BOM管理',
      },
      menu: {
        shown: true,
      },
      ezNav: {
        shown: true,
        closedBehavior: {
          type: 'back',
          data: null,
        },
      },
      router: {
        required: true,
        path: 'app/asset-management/asset-bom',
        component: () => import('@/views/items/assetsManagement/assetBom/AssetBom.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.assets_management.assets_bom',
      },
    },
    node: {
      parentKey: 'assetsManagement',
    },
  },
  {
    key: 'assetsManagement.itemTypeIndicator',
    index: 20,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '项目类型管理',
      },
      menu: {
        shown: true,
      },
      ezNav: {
        shown: true,
        closedBehavior: {
          type: 'back',
          data: null,
        },
      },
      router: {
        required: true,
        path: 'app/assets-management/item-type-indicator',
        component: () => import('@/views/items/assetsManagement/itemTypeIndicator/ItemTypeIndicator.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.assets_management.item_type_indicator',
      },
    },
    node: {
      parentKey: 'assetsManagement',
    },
  },
  {
    key: 'assetsManagement.itemLabel',
    index: 30,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '项目标签管理',
      },
      menu: {
        shown: true,
      },
      ezNav: {
        shown: true,
        closedBehavior: {
          type: 'back',
          data: null,
        },
      },
      router: {
        required: true,
        path: 'app/asset-management/item-label',
        component: () => import('@/views/items/assetsManagement/itemLabel/ItemLabel.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.assets_management.item_label',
      },
    },
    node: {
      parentKey: 'assetsManagement',
    },
  },
];

// noinspection JSUnusedGlobalSymbols
export default assetsManagement;

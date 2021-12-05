const assetManagement = [
  {
    key: 'assetManagement',
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
      },
      router: {
        required: false,
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.asset_management',
      },
    },
    node: {
      parentKey: null,
    },
  },
  {
    key: 'assetManagement.assetCatalog',
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
      },
      router: {
        required: true,
        path: 'app/asset-management/asset-catalog',
        component: () => import('@/views/items/assetManagement/assetCatalog/AssetCatalog.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.asset_management.asset_catalog',
      },
    },
    node: {
      parentKey: 'assetManagement',
    },
  },
  {
    key: 'assetManagement.assetBom',
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
      },
      router: {
        required: true,
        path: 'app/asset-management/asset-bom',
        component: () => import('@/views/items/assetManagement/assetBom/AssetBom.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.asset_management.asset_bom',
      },
    },
    node: {
      parentKey: 'assetManagement',
    },
  },
  {
    key: 'assetManagement.itemLabel',
    index: 20,
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
      },
      router: {
        required: true,
        path: 'app/asset-management/item-label',
        component: () => import('@/views/items/assetManagement/itemLabel/ItemLabel.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.asset_management.item_label',
      },
    },
    node: {
      parentKey: 'assetManagement',
    },
  },
  {
    key: 'assetManagement.itemFileLabel',
    index: 30,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '项目文件标签管理',
      },
      menu: {
        shown: true,
      },
      ezNav: {
        shown: true,
      },
      router: {
        required: true,
        path: 'app/asset-management/item-file-label',
        component: () => import('@/views/items/assetManagement/itemFileLabel/ItemFileLabel.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.asset_management.item_file_label',
      },
    },
    node: {
      parentKey: 'assetManagement',
    },
  },
];

export default assetManagement;

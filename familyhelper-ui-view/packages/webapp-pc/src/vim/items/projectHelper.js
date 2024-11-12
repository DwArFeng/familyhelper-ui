const projectHelper = [
  {
    key: 'projectHelper',
    index: 100,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '工程助手',
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
        node: 'ui.pc.menu_visible.project_helper',
      },
    },
    node: {
      parentKey: null,
    },
  },
  {
    key: 'projectHelper.project',
    index: 0,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '工程管理',
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
        path: 'app/project-helper/project',
        component: () => import('@/views/items/projectHelper/project/Project.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.project_helper.project',
      },
    },
    node: {
      parentKey: 'projectHelper',
    },
  },
  {
    key: 'projectHelper.task',
    index: 10,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '任务管理',
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
        path: 'app/project-helper/task',
        component: () => import('@/views/items/projectHelper/taskView/TaskView.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.project_helper.task',
      },
    },
    node: {
      parentKey: 'projectHelper',
    },
  },
  {
    key: 'projectHelper.taskTypeIndicator',
    index: 20,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '任务类型管理',
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
        path: 'app/project-helper/task-type-indicator',
        component: () => import('@/views/items/projectHelper/taskTypeIndicator/TaskTypeIndicator.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.project_helper.task_type_indicator',
      },
    },
    node: {
      parentKey: 'projectHelper',
    },
  },
  {
    key: 'projectHelper.memo',
    index: 30,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '备忘录',
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
        path: 'app/project-helper/memo',
        component: () => import('@/views/items/projectHelper/memo/Memo.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.project_helper.memo',
      },
    },
    node: {
      parentKey: 'projectHelper',
    },
  },
  {
    key: 'projectHelper.memoHistory',
    index: 40,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '历史备忘录',
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
        path: 'app/project-helper/memo-history',
        component: () => import('@/views/items/projectHelper/memoHistory/MemoHistory.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.project_helper.memo_history',
      },
    },
    node: {
      parentKey: 'projectHelper',
    },
  },
  {
    key: 'projectHelper.memoEditor',
    index: 50,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '备忘录编辑器',
      },
      menu: {
        shown: false,
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
        path: 'app/project-helper/memo-editor',
        component: () => import('@/views/items/projectHelper/memoEditor/MemoEditor.vue'),
      },
      permission: {
        required: false,
        node: '',
      },
    },
    node: {
      parentKey: 'projectHelper',
    },
  },
  {
    key: 'projectHelper.memoRemindDriverSupport',
    index: 60,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '备忘录提醒驱动器支持',
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
        path: 'app/project-helper/memo-remind-driver-support',
        component: () => import('@/views/items/projectHelper/memoRemindDriverSupport/MemoRemindDriverSupport.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.project_helper.memo_remind_driver_support',
      },
    },
    node: {
      parentKey: 'projectHelper',
    },
  },
];

// noinspection JSUnusedGlobalSymbols
export default projectHelper;

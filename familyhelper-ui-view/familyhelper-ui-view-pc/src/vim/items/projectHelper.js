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
];

export default projectHelper;

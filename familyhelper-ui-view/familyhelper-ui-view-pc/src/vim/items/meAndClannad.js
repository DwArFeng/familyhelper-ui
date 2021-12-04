const meAndClannad = [
  {
    key: 'meAndClannad',
    index: 90,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '我与家庭',
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
        node: 'ui.pc.menu_visible.me_and_clannad',
      },
    },
    node: {
      parentKey: null,
    },
  },
  {
    key: 'meAndClannad.profileTypeIndicator',
    index: 0,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '简介类型管理',
      },
      menu: {
        shown: true,
      },
      ezNav: {
        shown: true,
      },
      router: {
        required: true,
        path: 'app/me-and-clannad/profile-type-indicator',
        component: () => import('@/views/item/meAndClannad/profileTypeIndicator/ProfileTypeIndicator.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.me_and_clannad.profile_type_indicator',
      },
    },
    node: {
      parentKey: 'meAndClannad',
    },
  },
  {
    key: 'meAndClannad.myProfile',
    index: 10,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '个人简介管理',
      },
      menu: {
        shown: true,
      },
      ezNav: {
        shown: true,
      },
      router: {
        required: true,
        path: 'app/me-and-clannad/my-profile',
        component: () => import('@/views/item/meAndClannad/myProfile/MyProfile.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.me_and_clannad.my_profile',
      },
    },
    node: {
      parentKey: 'meAndClannad',
    },
  },
  {
    key: 'meAndClannad.myAvatar',
    index: 20,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '个人头像管理',
      },
      menu: {
        shown: true,
      },
      ezNav: {
        shown: true,
      },
      router: {
        required: true,
        path: 'app/me-and-clannad/my-avatar',
        component: () => import('@/views/item/meAndClannad/myAvatar/MyAvatar.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.me_and_clannad.my_avatar',
      },
    },
    node: {
      parentKey: 'meAndClannad',
    },
  },
  {
    key: 'meAndClannad.clannadProfile',
    index: 30,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '家人简介',
      },
      menu: {
        shown: true,
      },
      ezNav: {
        shown: true,
      },
      router: {
        required: true,
        path: 'app/me-and-clannad/clannad-profile',
        component: () => import('@/views/item/meAndClannad/clannadProfile/ClannadProfile.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.me_and_clannad.clannad_profile',
      },
    },
    node: {
      parentKey: 'meAndClannad',
    },
  },
  {
    key: 'meAndClannad.clannadNickname',
    index: 40,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '家人称呼管理',
      },
      menu: {
        shown: true,
      },
      ezNav: {
        shown: true,
      },
      router: {
        required: true,
        path: 'app/me-and-clannad/clannad-nickname',
        component: () => import('@/views/item/meAndClannad/clannadNickname/ClannadNickname.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.me_and_clannad.clannad_nickname',
      },
    },
    node: {
      parentKey: 'meAndClannad',
    },
  },
];

export default meAndClannad;

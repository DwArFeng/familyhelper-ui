<template>
<div class="personal-setting-container">
  <content-panel
    class="content-panel"
    :breadcrumb="['系统设置', '个人设置']"
  >
    <el-tabs
      class="profile-tabs"
      tab-position="left"
      v-model="profileTabs.activeName"
      v-loading="this.me === ''"
    >
      <el-tab-pane label="个人简介" name="profile">
        <profile-panel :me="me"/>
      </el-tab-pane>
      <el-tab-pane label="通信设置" name="communication">
        <coming-soon/>
      </el-tab-pane>
      <el-tab-pane label="安全设置" name="security">
        <coming-soon/>
      </el-tab-pane>
      <el-tab-pane label="头像设置" name="avatar">
        <coming-soon/>
      </el-tab-pane>
      <el-tab-pane label="个性化" name="customize">
        <coming-soon/>
      </el-tab-pane>
    </el-tabs>
  </content-panel>
</div>
</template>

<script>
import ContentPanel from '@/components/layout/LayoutPanel.vue';
import ComingSoon from '@/components/layout/ComingSoon.vue';
import ProfilePanel from '@/views/meAndClannad/personalSetting/ProfilePanel.vue';

export default {
  name: 'PersonalSetting',
  components: { ProfilePanel, ComingSoon, ContentPanel },
  data() {
    return {
      me: '',
      profileTabs: {
        activeName: 'profile',
      },
    };
  },
  methods: {
    handleWhoAmI() {
      // noinspection JSUnresolvedVariable
      const loginInfo = this.$ls.get('loginInfo');
      if (loginInfo === null) {
        this.me = '';
      } else {
        // noinspection JSUnresolvedVariable
        this.me = loginInfo.account_id;
        console.log(this.me);
      }
    },
  },
  mounted() {
    this.handleWhoAmI();
  },
};
</script>

<style scoped>
.personal-setting-container {
  width: 100%;
  height: 100%;
}

.profile-tabs{
  width: 100%;
  height: 100%;
}

/*noinspection CssUnusedSymbol*/
.profile-tabs >>> .el-tabs__content{
  height: 100%;
}

/*noinspection CssUnusedSymbol*/
.profile-tabs >>> .el-tab-pane{
  height: 100%;
}
</style>

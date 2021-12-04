<template>
  <div class="clannad-profile-container">
    <content-panel
      class="content-panel"
    >
      <el-tabs
        class="profile-tabs"
        tab-position="left"
        v-model="profileTabs.activeName"
      >
        <el-tab-pane
          v-for="(item) in profileTabs.permittedAccounts"
          lazy
          :key="item.key.string_id"
          :label="item.name"
          :name="item.key.string_id"
        >
          <profile-display-panel :me="item.key.string_id"/>
        </el-tab-pane>
      </el-tabs>
    </content-panel>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import ContentPanel from '@/components/layout/LayoutPanel.vue';
import ProfileDisplayPanel from '@/views/item/meAndClannad/clannadProfile/ProfileDisplayPanel.vue';

import { childForAccountGuest } from '@/api/clannad/profile';
import { inspect as inspectAccount } from '@/api/system/account';
import resolveResponse from '@/util/response';

// noinspection JSAnnotator
export default {
  name: 'ClannadProfile',
  components: { ProfileDisplayPanel, ContentPanel },
  computed: {
    ...mapGetters('lnp', ['me']),
  },
  data() {
    return {
      profileTabs: {
        activeName: 'id_type',
        permittedAccounts: [],
      },
    };
  },
  methods: {
    handleSearchPermitted() {
      const permittedAccounts = [];
      resolveResponse(inspectAccount(this.me))
        .then((res) => {
          permittedAccounts.push(res);
        })
        .then(() => resolveResponse(childForAccountGuest(this.me, 0, 99999)))
        .then((res) => {
          const promises = [];
          res.data.forEach((profile) => {
            promises.push(resolveResponse(inspectAccount(profile.key.string_id)));
          });
          return Promise.all(promises);
        })
        .then((res) => {
          res.forEach((account) => permittedAccounts.push(account));
        })
        .then(() => {
          this.$set(this.profileTabs, 'permittedAccounts', permittedAccounts);
          this.profileTabs.activeName = this.me;
        })
        .catch(() => {
        });
    },
  },
  mounted() {
    this.handleSearchPermitted();
  },
};
</script>

<style scoped>
.clannad-profile-container {
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

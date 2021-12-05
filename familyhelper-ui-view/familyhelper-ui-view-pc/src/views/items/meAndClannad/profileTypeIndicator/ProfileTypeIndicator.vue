<template>
<div class="profile-type-indicator-container">
  <content-panel
    class="content-panel"
  >
    <el-tabs
      class="profile-type-tabs"
      tab-position="left"
      v-model="profileTypeTabs.activeName"
    >
      <el-tab-pane
        v-for="(item, index) in profileTypeTabs.meta"
        :key="index"
        :label="item.label"
        :name="item.category"
      >
        <category-maintain-panel :category="item.category" :label="item.label"/>
      </el-tab-pane>
    </el-tabs>
  </content-panel>
</div>
</template>

<script>
import ContentPanel from '@/components/layout/LayoutPanel.vue';
import CategoryMaintainPanel from '@/views/items/meAndClannad/profileTypeIndicator/CategoryMaintainPanel.vue';

export default {
  name: 'ProfileTypeIndicator',
  components: { CategoryMaintainPanel, ContentPanel },
  data() {
    return {
      profileTypeTabs: {
        activeName: 'id_type',
        meta: [
          {
            category: 'id_type',
            label: '证件类型',
          },
          {
            category: 'gender',
            label: '性别类型',
          },
          {
            category: 'blood_type',
            label: '血型',
          },
          {
            category: 'nationality',
            label: '民族',
          },
          {
            category: 'educational_level',
            label: '学位',
          },
          {
            category: 'educational_background',
            label: '学历',
          },
          {
            category: 'political_status',
            label: '政治面貌',
          },
          {
            category: 'marital_status',
            label: '婚姻状况',
          },
        ],
      },
    };
  },
};
</script>

<style scoped>
.profile-type-indicator-container{
  width: 100%;
  height: 100%;
}

.profile-type-tabs{
  width: 100%;
  height: 100%;
}

/*noinspection CssUnusedSymbol*/
.profile-type-tabs >>> .el-tabs__content{
  height: 100%;
}

/*noinspection CssUnusedSymbol*/
.profile-type-tabs >>> .el-tab-pane{
  height: 100%;
}
</style>

<template>
  <div class="activity-template-management-container">
    <border-layout-panel west-width="30%" :west-visible="true">
      <template v-slot:west>
        <activity-template-table
          ref="activityTemplateTable"
          mode="ACTIVITY_TEMPLATE_MANAGEMENT"
          @onSelectionChanged="handleSelectionChanged"
        />
      </template>
      <template v-slot:default>
        <activity-template-edit-panel
          :activityTemplateId="activityTemplateEditPanel.activityTemplateId"
          :readonly="readonly"
          :upsc="activityTemplateEditPanel.upsc"
          @onActivityTemplatePropertyUpdated="handleActivityTemplatePropertyUpdated"
        />
      </template>
    </border-layout-panel>
  </div>
</template>

<script>
import BorderLayoutPanel from '@/components/layout/BorderLayoutPanel.vue';
import ActivityTemplateTable
from '@/views/items/life/activityTemplateManagement/ActivityTemplateTable.vue';
import ActivityTemplateEditPanel
from '@/views/items/life/activityTemplateManagement/ActivityTemplateEditPanel.vue';

import {
  inspectDisp as inspect,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/life/activityTemplate';
import resolveResponse from '@/util/response';

export default {
  name: 'ActivityTemplateManagement',
  components: {
    ActivityTemplateEditPanel, ActivityTemplateTable, BorderLayoutPanel,
  },
  computed: {
    readonly() {
      if (!this.tablePanel.activityTemplate) {
        return true;
      }
      return this.tablePanel.activityTemplate.permission_level === 1;
    },
  },
  data() {
    return {
      tablePanel: {
        activityTemplate: null,
      },
      activityTemplateEditPanel: {
        activityTemplateId: '',
        upsc: 'ui_preference.pc.life.activity_template_management.activity_template_edit_panel',
      },
    };
  },
  methods: {
    handleSelectionChanged(activityTemplate) {
      if (activityTemplate) {
        this.activityTemplateEditPanel.activityTemplateId = activityTemplate.key.long_id;
        this.tablePanel.activityTemplate = activityTemplate;
      } else {
        this.activityTemplateEditPanel.activityTemplateId = '';
        this.tablePanel.activityTemplate = null;
      }
    },
    handleActivityTemplatePropertyUpdated() {
      resolveResponse(inspect(this.activityTemplateEditPanel.activityTemplateId))
        .then((res) => {
          this.$refs.activityTemplateTable.updateEntity(res);
        })
        .catch(() => {
        });
    },
  },
};
</script>

<style scoped>
.activity-template-management-container {
  height: 100%;
  width: 100%;
}
</style>

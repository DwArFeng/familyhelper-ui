<template>
  <div class="activity-management-container">
    <border-layout-panel west-width="30%" :west-visible="true">
      <template v-slot:west>
        <activity-table
          ref="activityTable"
          mode="ACTIVITY_MANAGEMENT"
          @onSelectionChanged="handleSelectionChanged"
        />
      </template>
      <template v-slot:default>
        <activity-edit-panel
          :activityId="activityEditPanel.activityId"
          :readonly="readonly"
          :upsc="activityEditPanel.upsc"
          @onActivityPropertyUpdated="handleActivityPropertyUpdated"
        />
      </template>
    </border-layout-panel>
  </div>
</template>

<script>
import BorderLayoutPanel from '@/components/layout/BorderLayoutPanel.vue';
import ActivityTable from '@/views/items/life/activityManagement/ActivityTable.vue';
import ActivityEditPanel from '@/views/items/life/activityManagement/ActivityEditPanel.vue';

import {
  inspectDisp as inspect,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/life/activity';
import resolveResponse from '@/util/response';

export default {
  name: 'ActivityManagement',
  components: {
    ActivityEditPanel, ActivityTable, BorderLayoutPanel,
  },
  computed: {
    readonly() {
      if (!this.tablePanel.activity) {
        return true;
      }
      const modifiedPermission = this.tablePanel.activity.permission_level === 1;
      const unlocked = !this.tablePanel.activity.locked;
      return modifiedPermission && unlocked;
    },
  },
  data() {
    return {
      tablePanel: {
        activity: null,
      },
      activityEditPanel: {
        activityId: '',
        upsc: 'ui_preference.pc.life.activity_management.activity_edit_panel',
      },
    };
  },
  methods: {
    handleSelectionChanged(activity) {
      if (activity) {
        this.activityEditPanel.activityId = activity.key.long_id;
        this.tablePanel.activity = activity;
      } else {
        this.activityEditPanel.activityId = '';
        this.tablePanel.activity = null;
      }
    },
    handleActivityPropertyUpdated() {
      resolveResponse(inspect(this.activityEditPanel.activityId))
        .then((res) => {
          this.$refs.activityTable.updateEntity(res);
        })
        .catch(() => {
        });
    },
  },
};
</script>

<style scoped>
.activity-management-container {
  width: 100%;
  height: 100%;
}
</style>

<template>
  <div class="notify-setting-input-container">
    <el-input v-loading="input.loading" v-model="input.label" readonly>
      <el-button v-if="!readonly" slot="append" icon="el-icon-edit" @click="handleShowDialog"/>
    </el-input>
    <notify-setting-select-dialog
      :visible.sync="dialog.visible"
      :close-on-click-modal="false"
      @onNotifySettingSelected="handleNotifySettingSelected"
    />
  </div>
</template>

<script>
import resolveResponse from '@/util/response';
import NotifySettingSelectDialog from '@/views/items/notifyManagement/notifySetting/NotifySettingSelectDialog.vue';

import { exists, inspect } from '@/api/notify/notifySetting';

export default {
  name: 'NotifySettingInput',
  components: { NotifySettingSelectDialog },
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    readonly: {
      type: Boolean,
      default: false,
    },
    value: {
      type: String,
      required: true,
    },
  },
  watch: {
    value(value) {
      this.watchedValue = value;
    },
    watchedValue(value) {
      this.$emit('change', value);
      this.updateInputLabel();
    },
  },
  data() {
    return {
      watchedValue: '',
      input: {
        loading: false,
        label: '',
      },
      dialog: {
        visible: false,
      },
    };
  },
  methods: {
    updateInputLabel() {
      if (this.watchedValue === '') {
        this.input.label = '（未选择）';
        return;
      }
      this.input.loading = true;
      resolveResponse(exists(this.watchedValue))
        .then((res) => {
          if (res) {
            return Promise.resolve();
          }
          this.input.label = '（通知设置不存在）';
          return Promise.reject();
        })
        .then(() => resolveResponse(inspect(this.watchedValue)))
        .then((res) => {
          this.input.label = res.label;
        })
        .catch(() => {
        })
        .finally(() => {
          this.input.loading = false;
        });
    },
    handleShowDialog() {
      this.dialog.visible = true;
    },
    handleNotifySettingSelected(notifySetting) {
      this.input.label = notifySetting.label;
      this.watchedValue = notifySetting.key.long_id;
      this.$emit('change', notifySetting.key.long_id);
    },
  },
  mounted() {
    this.watchedValue = this.value;
    this.updateInputLabel();
  },
};
</script>

<style scoped>
</style>

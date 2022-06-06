<template>
  <div class="sender-info-input-container">
    <el-input v-loading="input.loading" v-model="input.label" readonly>
      <el-button v-if="!readonly" slot="append" icon="el-icon-edit" @click="handleShowDialog"/>
    </el-input>
    <sender-info-select-dialog
      :visible.sync="dialog.visible"
      :close-on-click-modal="false"
      @onSenderInfoSelected="handleSenderInfoSelected"
    />
  </div>
</template>

<script>
import resolveResponse from '@/util/response';
import { exists, inspect } from '@/api/notify/senderInfo';
import SenderInfoSelectDialog from '@/views/items/notifyManagement/senderInfo/SenderInfoSelectDialog.vue';

export default {
  name: 'SenderInfoInput',
  components: { SenderInfoSelectDialog },
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
          this.input.label = '（发送器不存在）';
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
    handleSenderInfoSelected(senderInfo) {
      this.input.label = senderInfo.label;
      this.watchedValue = senderInfo.key.long_id;
      this.$emit('change', senderInfo.key.long_id);
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

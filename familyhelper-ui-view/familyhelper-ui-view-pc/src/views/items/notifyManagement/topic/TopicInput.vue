<template>
  <div class="topic-input-container">
    <el-input v-loading="input.loading" v-model="input.label" readonly>
      <el-button v-if="!readonly" slot="append" icon="el-icon-edit" @click="handleShowDialog"/>
    </el-input>
    <topic-select-dialog
      :visible.sync="dialog.visible"
      :close-on-click-modal="false"
      @onTopicSelected="handleTopicSelected"
    />
  </div>
</template>

<script>
import resolveResponse from '@/util/response';
import { exists, inspect } from '@/api/notify/topic';
import TopicSelectDialog from '@/views/items/notifyManagement/topic/TopicSelectDialog.vue';

export default {
  name: 'TopicInput',
  components: { TopicSelectDialog },
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
          this.input.label = '（主题不存在）';
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
    handleTopicSelected(topic) {
      this.input.label = topic.label;
      this.watchedValue = topic.key.string_id;
      this.$emit('change', topic.key.string_id);
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

<template>
  <div class="fund-change-type-selector-container">
    <el-select
      class="item"
      v-model="watchedValue"
      :disabled="readonly"
      :placeholder="placeholder"
      :clearable="clearable"
    >
      <el-option
        v-for="item in entities.data"
        :key="item.key.string_id"
        :label="item.label"
        :value="item.key.string_id"
      />
    </el-select>
  </div>
</template>

<script>
import { all } from '@dwarfeng/familyhelper-ui-component-api/src/api/finance/fundChangeTypeIndicator';
import resolveResponse from '@/util/response';

export default {
  name: 'FundChangeTypeSelector',
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    value: {
      type: String,
      required: true,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    placeholder: {
      type: String,
      default: '请选择',
    },
    clearable: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    value(value) {
      this.watchedValue = value;
    },
    watchedValue(value) {
      this.$emit('change', value);
    },
  },
  data() {
    return {
      watchedValue: '',
      formattedValue: '',
      entities: {
        current_page: 0,
        total_pages: 0,
        rows: 0,
        count: '0',
        data: [],
      },
    };
  },
  methods: {
    init() {
      this.watchedValue = this.value;
      resolveResponse(all(0, 1000))
        .then((res) => {
          this.entities = res;
        })
        .catch(() => {
        });
    },
  },
  mounted() {
    this.init();
  },
};
</script>

<style scoped>
.item {
  width: 100%;
}
</style>

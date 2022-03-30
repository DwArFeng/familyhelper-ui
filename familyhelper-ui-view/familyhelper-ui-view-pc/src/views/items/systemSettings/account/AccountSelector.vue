<template>
  <div class="account-selector">
    <el-select
      v-model="watchedValue"
      placeholder="请选择用户"
      filterable
      remote
      :remote-method="updateOption"
      :loading="loading"
    >
      <el-option
        v-for="option in filteredOptions"
        :key="option.key.string_id"
        :value="option.key.string_id"
      >
        <template v-slot>
          <div class="account-container">
            <avatar-panel
              class="account-container-item"
              :size="32"
              :object-user-id="option.key.string_id"
              :placeholder-font-size="14"
            />
            <span class="account-container-item">{{ option.key.string_id }}</span>
            <span class="account-container-item">({{ option.display_name }})</span>
          </div>
        </template>
      </el-option>
    </el-select>
  </div>
</template>

<script>
import AvatarPanel from '@/components/avatar/AvatarPanel.vue';

import resolveResponse from '@/util/response';
import { idLikeDisp } from '@/api/system/account';

export default {
  name: 'AccountSelector',
  components: { AvatarPanel },
  props: {
    value: {
      type: String,
      default: '',
    },
    filter: {
      type: Function,
      default: () => true,
    },
  },
  watch: {
    filter() {
      this.filteredOptions = this.options.filter(this.filter);
    },
    value(val) {
      this.watchedValue = val;
    },
    watchedValue(val) {
      this.$emit('input', val);
    },
  },
  data() {
    return {
      watchedValue: this.value,
      options: [],
      filteredOptions: [],
      loading: false,
    };
  },
  methods: {
    updateOption(pattern) {
      this.loading = true;
      resolveResponse(idLikeDisp(pattern, 0, 9999))
        .then((res) => {
          this.options = res.data;
          this.filteredOptions = this.options.filter(this.filter);
        })
        .catch(() => {
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
  mounted() {
    this.updateOption('');
  },
};
</script>

<style scoped>
.account-selector {
  width: 100%;
}

/*noinspection CssUnusedSymbol*/
.account-selector >>> .el-select {
  width: 100%;
}

.account-container{
  height: 34px;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.account-container-item:not(:last-child){
  margin-right: 10px;
}

.account-container-item:last-child{
  color:grey;
}
</style>

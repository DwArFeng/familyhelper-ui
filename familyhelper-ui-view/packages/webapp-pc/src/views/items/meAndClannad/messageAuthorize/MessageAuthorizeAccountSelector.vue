<template>
  <div class="message-authorize-account-selector-container">
    <el-select
      v-model="watchedValue"
      filterable
      remote
      :loading="loading"
      :remote-method="updateOption"
      :clearable="clearable"
      :placeholder="placeholder"
    >
      <el-option
        v-for="option in filteredOptions"
        :key="`${option.key.receive_user_id}-${option.key.authorized_send_user_id}`"
        :value="option.key.receive_user_id"
      >
        <template v-slot>
          <div class="account-container">
            <avatar-panel
              class="account-container-item"
              :size="32"
              :object-user-id="option.key.receive_user_id"
              :placeholder-font-size="14"
            />
            <span class="account-container-item">{{ option.key.receive_user_id }}</span>
            <!--suppress JSUnresolvedReference -->
            <span class="account-container-item">({{ option.receive_account.display_name }})</span>
          </div>
        </template>
      </el-option>
    </el-select>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import AvatarPanel from '@/components/avatar/AvatarPanel.vue';

import resolveResponse from '@/util/response';
import { childForAuthorizedSendAccountIdLikeDisp } from '@dwarfeng/familyhelper-ui-component-api/src/api/clannad/messageAuthorization';

// noinspection JSAnnotator
export default {
  name: 'MessageAuthorizeAccountSelector',
  components: { AvatarPanel },
  computed: {
    ...mapGetters('lnp', ['me']),
  },
  props: {
    value: {
      type: String,
      default: '',
    },
    filter: {
      type: Function,
      default: () => true,
    },
    clearable: {
      type: Boolean,
      default: false,
    },
    placeholder: {
      type: String,
      default: '请选择用户',
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
      resolveResponse(childForAuthorizedSendAccountIdLikeDisp(this.me, pattern, 0, 9999))
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
.message-authorize-account-selector-container {
  width: 100%;
}

/*noinspection CssUnusedSymbol*/
.message-authorize-account-selector-container >>> .el-select {
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

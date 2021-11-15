<template>
  <!--suppress HtmlUnknownAttribute -->
  <div v-loading="display.loading">
    <el-avatar
      class="avatar-panel-container"
      fit="contain"
      :size="size"
      :style=avatar.style
      :shape="shape"
      :src="display.avatarUrl"
    >
      <div class="placeholder" :style=placeholder.style>{{display.displayName}}</div>
    </el-avatar>
  </div>
</template>

<script>
import { inspectDisp } from '@/api/system/account';
import { exists } from '@/api/clannad/avatar';
import resolveResponse from '@/util/response';

export default {
  name: 'AvatarPanel',
  props: {
    renderMode: {
      type: String,
      validator(value) {
        return ['BY_ID', 'BY_CONTENT'].indexOf(value) !== -1;
      },
      default: 'BY_ID',
    },
    shape: {
      type: String,
      validator(value) {
        return ['square', 'circle'].indexOf(value) !== -1;
      },
      default: 'square',
    },
    size: {
      type: Number,
      default: 180,
    },
    placeholderFontSize: {
      type: Number,
      default: 32,
    },
    objectUserId: {
      type: String,
      default: '',
    },
    displayName: {
      type: String,
      default: '',
    },
    avatarUrl: {
      type: String,
      default: '',
    },
  },
  watch: {
    size(value) {
      const size = `${value}px`;
      this.avatar.style.height = size;
      this.avatar.style.width = size;
    },
    placeholderFontSize(value) {
      this.placeholder.style.fontSize = `${value}px`;
    },
    renderMode: {
      handler(newValue, oldValue) {
        const tempUrl = this.display.avatarUrl;
        this.update();
        if (newValue === 'BY_CONTENT' && oldValue === 'BY_ID') {
          window.URL.revokeObjectURL(tempUrl);
        }
      },
    },
    objectUserId() {
      if (this.renderMode === 'BY_ID') {
        this.update();
      }
    },
    displayName() {
      if (this.renderMode === 'BY_CONTENT') {
        this.update();
      }
    },
    avatarUrl() {
      if (this.renderMode === 'BY_CONTENT') {
        this.update();
      }
    },
  },
  data() {
    return {
      me: '',
      avatar: {
        style: {
          height: `${this.size}px`,
          width: `${this.size}px`,
        },
      },
      placeholder: {
        style: {
          fontSize: `${this.placeholderFontSize}px`,
        },
      },
      display: {
        loading: true,
        displayName: '',
        avatarUrl: '',
      },
    };
  },
  methods: {
    handleWhoAmI() {
      // noinspection JSUnresolvedVariable
      const loginInfo = this.$ls.get('loginInfo');
      if (loginInfo === null) {
        this.me = '';
      } else {
        // noinspection JSUnresolvedVariable
        this.me = loginInfo.account_id;
      }
    },
    update() {
      // 1. 设置加载标记为 true。
      this.display.loading = true;

      // 2. 更新参数。
      if (this.renderMode === 'BY_ID') {
        this.display.loading = false;
        resolveResponse(this, inspectDisp(this.me, this.objectUserId))
          .then((res) => {
            this.display.displayName = res.display_name;
          })
          .then(() => resolveResponse(this, exists(this.me)))
          .then((res) => {
            if (res) {
              return Promise.resolve();
            }
            this.display.avatarUrl = '';
            return Promise.reject();
          })
          .then(() => {
            this.display.avatarUrl = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png';
          })
          .catch(() => {})
          .finally(() => {
            this.display.loading = false;
          });
      } else {
        this.display.displayName = this.displayName;
        this.display.avatarUrl = this.avatarUrl;
        this.display.loading = false;
      }
    },
  },
  mounted() {
    this.handleWhoAmI();
    this.update();
  },
};
</script>

<style scoped>
.placeholder{

}
</style>

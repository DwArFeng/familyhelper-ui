<template>
  <div :style="{width:`${size}px`, height:`${size}px`}" v-loading="display.loading">
    <!--suppress JSValidateTypes -->
    <el-avatar
      class="avatar-panel-container"
      fit="contain"
      :size="size"
      :style=avatar.style
      :shape="shape"
      :src="display.avatarUrl"
    >
      <div class="placeholder" :style=placeholder.style>{{computedDisplayName}}</div>
    </el-avatar>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import { inspectDisp } from '@dwarfeng/familyhelper-ui-component-api/src/api/system/account';
import { download, exists } from '@dwarfeng/familyhelper-ui-component-api/src/api/clannad/avatar';
import resolveResponse from '@/util/response';

// noinspection JSAnnotator
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
  computed: {
    computedDisplayName() {
      if (this.display.displayName === '') {
        return '';
      }
      return this.display.displayName.charAt(0);
    },
    ...mapGetters('lnp', ['me']),
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
    update() {
      // 1. 设置加载标记为 true。
      this.display.loading = true;

      // 2. 更新参数。
      if (this.renderMode === 'BY_ID') {
        this.display.loading = false;
        resolveResponse(inspectDisp(this.objectUserId))
          .then((res) => {
            this.display.displayName = res.display_name;
          })
          .then(() => resolveResponse(exists(this.objectUserId)))
          .then((res) => {
            if (res) {
              // noinspection JSCheckFunctionSignatures
              return download(this.objectUserId)
                .then((blob) => window.URL.createObjectURL(blob));
            }
            return Promise.resolve('');
          })
          .then((res) => {
            this.display.avatarUrl = res;
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
    this.update();
  },
  destroyed() {
    const { renderMode } = this;
    const url = this.display.avatarUrl;
    if (renderMode === 'BY_ID' && url !== '') {
      window.URL.revokeObjectURL(url);
    }
  },
};
</script>

<style scoped>
.placeholder{
  user-select: none;
  white-space: nowrap;
  text-overflow: clip;
  overflow: hidden;
}
</style>

<template>
  <div class="setting-node-edit-panel-container">
    <div class="placeholder" v-if="loading">
      正在查询设置节点信息...
    </div>
    <div class="placeholder" v-else-if="settingNodeInvalid">
      无法查看或编辑设置节点
    </div>
    <text-node-edit-panel
      v-else-if="this.anchorSettingNode.type === 0"
      :category="this.anchorSettingNode.category"
      :args="this.anchorSettingNode.args"
      :readonly="readonly"
    />
    <image-node-edit-panel
      v-else-if="this.anchorSettingNode.type === 2"
      :category="this.anchorSettingNode.category"
      :args="this.anchorSettingNode.args"
      :readonly="readonly"
    />
    <image-list-node-edit-panel
      v-else-if="this.anchorSettingNode.type === 3"
      :category="this.anchorSettingNode.category"
      :args="this.anchorSettingNode.args"
      :readonly="readonly"
    />
    <div class="placeholder" v-else>
      节点类型未知，无法查看或编辑
    </div>
  </div>
</template>

<script>
import { inspect } from '@/api/settingrepo/settingNode';
import resolveResponse from '@/util/response';
import TextNodeEditPanel
from '@/views/items/settingrepo/settingNode/editPanel/TextNodeEditPanel.vue';
import ImageNodeEditPanel
from '@/views/items/settingrepo/settingNode/editPanel/ImageNodeEditPanel.vue';
import ImageListNodeEditPanel
from '@/views/items/settingrepo/settingNode/editPanel/ImageListNodeEditPanel.vue';

export default {
  name: 'SettingNodeEditPanel',
  components: { ImageListNodeEditPanel, ImageNodeEditPanel, TextNodeEditPanel },
  props: {
    id: {
      type: String,
      required: true,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    watchingRouteName: {
      type: String,
      default: null,
    },
  },
  computed: {
    settingNodeInvalid() {
      return !this.anchorSettingNode.category || !this.anchorSettingNode.args;
    },
  },
  watch: {
    id() {
      this.notify.idLoading = true;
      this.handleInspect();
    },
    $route(val) {
      if (val.name === this.watchingRouteName) {
        this.mayShowNotify();
      } else {
        this.mayCloseNotify();
      }
    },
  },
  data() {
    return {
      loading: false,
      anchorSettingNode: {
        type: null,
        last_modified_date: 0,
        remark: '',
        category: '',
        args: null,
      },
      notify: {
        idLoading: false,
        show: false,
        handle: null,
      },
    };
  },
  methods: {
    handleInspect() {
      if (!this.id) {
        return;
      }
      this.loading = true;
      resolveResponse(inspect(this.id))
        .then((res) => {
          this.anchorSettingNode.type = res.type;
          this.anchorSettingNode.last_modified_date = res.last_modified_date;
          this.anchorSettingNode.remark = res.remark;
          this.anchorSettingNode.category = res.category;
          this.anchorSettingNode.args = res.args;
        })
        .finally(() => {
          this.loading = false;
        })
        .then(() => {
          this.notify.idLoading = false;
          if (this.$route.name === this.watchingRouteName) {
            this.mayShowNotify();
          }
        });
    },
    mayShowNotify() {
      if (this.notify.idLoading) {
        return;
      }
      if (this.notify.show) {
        return;
      }
      const imageTypes = [2, 3];
      if (!imageTypes.includes(this.anchorSettingNode.type)) {
        return;
      }
      this.notify.show = true;
      // noinspection JSCheckFunctionSignatures
      this.notify.handle = this.$notify({
        title: '使用提示',
        customClass: 'custom-message-box__w450',
        message: '<div style="line-height: 20px">'
          + '显示内容使用的是缩略图，清晰度较低，仅供预览。<br>'
          + '<b>请勿截屏或使用浏览器的保存图片功能！</b><br>如需下载原图，请点击下载按钮。'
          + '</div>',
        dangerouslyUseHTMLString: true,
        type: 'info',
        center: true,
        position: 'bottom-right',
        offset: 75,
        duration: 0,
        onClose: () => {
          this.notify.show = false;
          this.notify.handle = null;
        },
      });
    },
    mayCloseNotify() {
      if (!this.notify.show) {
        return;
      }
      this.notify.handle.close();
    },
  },
  mounted() {
    this.handleInspect();
    if (this.$route.name === this.watchingRouteName) {
      this.mayShowNotify();
    }
  },
};
</script>

<style scoped>
.setting-node-edit-panel-container{
  width: 100%;
  height: 100%;
}

.placeholder {
  width: 100%;
  height: 100%;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
  color: #BFBFBF;
  user-select: none;
}
</style>

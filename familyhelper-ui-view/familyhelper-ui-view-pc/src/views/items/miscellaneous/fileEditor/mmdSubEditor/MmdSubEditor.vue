<template>
  <div class="mmd-sub-editor-container">
    <coming-soon/>
    <butterfly-vue
      class="butterfly-vue"
      ref="butterfly"
      v-if="false"
      :canvasConf="butterfly.canvasConf"
      :canvasData="butterfly.mockData"
      @onLoaded="handleLoaded"
      @onOtherEvent="handleOtherEvent"
    />
    <!-- 叠加的节点编辑器 -->
    <div class="overlay" ref="overlay" :style="overlayStyle" v-if="overlay.visible">
      <overlay-icon-button iconClass="el-icon-arrow-left"/>
      <overlay-icon-button iconClass="el-icon-edit" @click="handleNodeEdit"/>
      <overlay-icon-button iconClass="el-icon-delete"/>
      <overlay-icon-button iconClass="el-icon-arrow-right"/>
    </div>
    <mmd-node-dialog
      v-model="dialog.mmdData"
      title="节点编辑"
      :visible.sync="dialog.visible"
    />
  </div>
</template>

<script>
import { ButterflyVue } from 'butterfly-vue';

import ComingSoon from '@/components/comingSoon/ComingSoon.vue';
import OverlayIconButton
from '@/views/items/miscellaneous/fileEditor/mmdSubEditor/OverlayIconButton.vue';
import MmdNodeDialog from '@/views/items/miscellaneous/fileEditor/mmdSubEditor/MmdNodeDialog.vue';

import mockData from './mockData';

export default {
  name: 'MmdSubEditor',
  components: {
    ComingSoon,
    MmdNodeDialog,
    OverlayIconButton,
    ButterflyVue,
  },
  props: {
    blob: {
      type: Blob,
      default: null,
    },
    readonly: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    overlayStyle() {
      return {
        top: `${this.overlay.top}px`,
        left: `${this.overlay.left}px`,
      };
    },
  },
  watch: {
    blob(value) {
      value.text()
        .then((text) => {
          this.content = text;
        });
    },
    'overlay.visible': {
      handler(val) {
        if (!val) {
          return;
        }
        this.$nextTick(() => {
          this.updateOverlayPosition(this.currentNode);
        });
      },
    },
  },
  data() {
    return {
      butterfly: {
        mockData,
        canvasConf: {
          moveable: true,
          draggable: true,
          linkable: true,
          disLinkable: true,
        },
      },
      overlay: {
        top: 400,
        left: 600,
        visible: false,
      },
      currentNode: null,
      dialog: {
        visible: false,
        mmdData: {
          label: '',
          noteEnabled: true,
          note: '',
          imageEnabled: true,
          image: '',
          backgroundColor: '#FFFFFF',
          foregroundColor: '#889AA4',
          fontWeight: 'normal',
          fontStyle: 'normal',
        },
      },
    };
  },
  methods: {
    // contentToBlob() {
    //   return new Blob([this.content], { type: 'text/plain' });
    // },
    handleLoaded(vueCom) {
      const { canvas } = vueCom;
      // noinspection JSUnresolvedFunction
      canvas.setMinimap(true);
      this.$set(canvas, 'readonly', true);
    },
    handleOtherEvent(event) {
      switch (event.type) {
        case 'node:click':
          this.currentNode = event.node;
          this.overlay.visible = true;
          break;
        default:
          this.overlay.visible = false;
          this.currentNode = null;
      }
    },
    updateOverlayPosition(node) {
      // 定义 overlay 和 dom 之间的缝隙。
      const verticalGap = 3;

      // 确保 butterfly 尺寸完全大于 overlay，否则置 fitness 属性为 false，届时 overlay 不会显示。
      // 在高度方向上，butterfly 应该大于 overlay 的高度 + dom 的高度 * 2 + verticalGap。
      const butterflyRect = this.$refs.butterfly.$el.getBoundingClientRect();
      const overlayRect = this.$refs.overlay.getBoundingClientRect();
      const { dom } = node;
      const domRect = dom.getBoundingClientRect();
      if (butterflyRect.width < overlayRect.width) {
        this.overlay.visible = false;
        return;
      }
      if (butterflyRect.height < overlayRect.height + domRect.height * 2 + verticalGap) {
        this.overlay.visible = false;
        return;
      }

      // 定义 overlay 临时的 top 和 left 变量。
      let overlayTop = 0;
      let overlayLeft = 0;

      // 尽量将 overlay 的水平位置置于 dom 的中间。
      overlayLeft = domRect.left - (overlayRect.width - domRect.width) / 2;
      // 如果上述行为导致 overlay 的矩形框超越了 butterfly，则调整 overlay 的位置，使其不超越。
      if (overlayLeft < butterflyRect.left) {
        overlayLeft = butterflyRect.left;
      } else if (overlayLeft + overlayRect.width > butterflyRect.right) {
        overlayLeft = butterflyRect.right - overlayRect.width;
      }

      // 如果 dom 上方的空隙能放下 overlay，则将 overlay 放置到上方，否则将 overlay 放置到下方。
      overlayTop = domRect.top - overlayRect.height - verticalGap;
      if (overlayTop < butterflyRect.top) {
        overlayTop = domRect.bottom + verticalGap;
      }

      // 将 overlay 临时的 top 和 left 赋予实际变量。
      this.overlay.left = overlayLeft;
      this.overlay.top = overlayTop;
    },
    handleNodeEdit() {
      this.dialog.visible = true;
    },
  },
};
</script>

<style scoped>
.mmd-sub-editor-container {
  position: static;
  width: 100%;
  height: 100%;
}

.butterfly-vue {
  position: relative;
  height: 100%;
  width: 100%;
}

.overlay {
  display: flex;
  flex-direction: row;
  position: fixed;
  z-index: 10;
  padding: 1px 15px;
  background: rgba(0, 0, 0, 0.05);
  opacity: 0.85;
  border-radius: 10px;
}
</style>

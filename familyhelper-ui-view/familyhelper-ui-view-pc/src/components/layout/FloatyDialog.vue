<template>
  <div
    class="floaty-dialog-container"
    ref="container"
    v-show="watchedVisible"
    :style="containerStyle"
  >
    <div class="frame" :key="key">
      <div class="title-bar" :style="titleBarStyle" @mousedown="handleStartMove">
        <div class="title-bar-item icon-area" v-if="iconVisible">
          <slot name="icon">
            <i class="iconfont" style="font-size: 20px;color: #495060;">&#xffd3;</i>
          </slot>
        </div>
        <div class="title-bar-item title-area">
          <span>{{ title }}</span>
        </div>
        <div
          class="title-bar-item
          operate-area"
          @mouseenter="operateOverride=true"
          @mouseleave="operateOverride=false"
        >
          <el-button-group>
            <el-button
              class="button"
              v-if="dockStatus !== 0"
              type="info"
              @click="handleUndock"
            >
              <i class="iconfont">&#xffd2;</i>
            </el-button>
            <el-button
              class="button"
              v-if="showOpacityButton"
              type="info"
              @click="handleShowContextMenu(2)"
            >
              <i class="iconfont">&#xffc9;</i>
            </el-button>
            <el-button
              class="button"
              v-if="showDockButton"
              type="info"
              @click="handleShowContextMenu(1)"
            >
              <i class="iconfont">&#xffd1;</i>
            </el-button>
            <el-button
              class="button"
              type="danger"
              @click="handleClose"
            >
              <i class="iconfont">&#xffd0;</i>
            </el-button>
          </el-button-group>
        </div>
      </div>
      <div class="content-panel" :style="{zIndex: zIndex}">
        <div
          class="content-panel-item content-panel-mask"
          v-show="showContentMask && adjustStatus===1"
          :style="{background:`rgba(255,255,255,${contentOpacity}%)`}"
        >
          <i class="iconfont">&#xffcb;</i>
        </div>
        <div
          class="content-panel-item content-panel-mask"
          v-show="showContentMask && adjustStatus===2"
          :style="{background:`rgba(255,255,255,${contentOpacity}%)`}"
        >
          <i class="iconfont">&#xffca;</i>
        </div>
        <div
          class="content-panel-item content-panel-body"
          v-show="!showContentMask || adjustStatus===0"
          :style="{opacity:`${contentOpacity}%`}"
        >
          <slot name="default">
            <div class="content-panel-placeholder">
              <i class="iconfont">&#xffd3;</i>
            </div>
          </slot>
        </div>
      </div>
    </div>
    <div>
      <div
        class="resize-item resize-bar-vertical"
        :style="resizeBarWestStyle"
        v-if="dockStatus===0 || dockStatus===4"
        @mousedown="handleStartResize($event,westResizingHandle)"
      />
      <div
        class="resize-item resize-bar-vertical"
        v-if="dockStatus===0 || dockStatus===2"
        :style="resizeBarEastStyle"
        @mousedown="handleStartResize($event,eastResizingHandle)"
      />
      <div
        class="resize-item resize-bar-horizontal"
        v-if="dockStatus===0 || dockStatus===3"
        :style="resizeBarNorthStyle"
        @mousedown="handleStartResize($event,northResizingHandle)"
      />
      <div
        class="resize-item resize-bar-horizontal"
        v-if="dockStatus===0 || dockStatus===1"
        :style="resizeBarSouthStyle"
        @mousedown="handleStartResize($event,southResizingHandle)"
      />
      <div
        class="resize-item resize-block-nwse"
        v-if="dockStatus===0"
        :style="resizeBlockNorthWestStyle"
        @mousedown="handleStartResize($event,northWestResizingHandle)"
      />
      <div
        class="resize-item resize-block-nesw"
        v-if="dockStatus===0"
        :style="resizeBlockNorthEastStyle"
        @mousedown="handleStartResize($event,northEastResizingHandle)"
      />
      <div
        class="resize-item resize-block-nesw"
        v-if="dockStatus===0"
        :style="resizeBlockSouthWestStyle"
        @mousedown="handleStartResize($event,southWestResizingHandle)"
      />
      <div
        class="resize-item resize-block-nwse"
        v-if="dockStatus===0"
        :style="resizeBlockSouthEastStyle"
        @mousedown="handleStartResize($event,southEastResizingHandle)"
      />
    </div>
    <div
      class="global-mask" v-if="adjustStatus !== 0 || contextMenuStatus !== 0"
      :style="{cursor: this.maskCursor}"
    />
    <div>
      <div
        class="contextmenu dock"
        v-if="contextMenuStatus===1"
        ref="contextmenu"
        aria-modal="true"
        tabindex="0"
        style="transform: translateX(-18px)"
        @blur="closeContextMenu"
      >
        <ul class="contextmenu-body">
          <li class="iconfont" @click="handleDockTop">&#xffcf;</li>
          <li class="iconfont" @click="handleDockLeft">&#xffce;</li>
          <li class="iconfont" @click="handleDockDown">&#xffcd;</li>
          <li class="iconfont" @click="handleDockRight">&#xffcc;</li>
        </ul>
      </div>
      <div
        class="contextmenu opacity"
        v-if="contextMenuStatus===2"
        ref="contextmenu"
        aria-modal="true"
        tabindex="0"
        style="transform: translateX(-30px)"
        @blur="closeContextMenu"
      >
        <div class="slider">
          <el-slider
            v-model="contentOpacity"
            vertical
            height="80px"
            :show-tooltip="false"
            :min="0"
            :max="100"
            @change="handleContentOpacitySliderChanged"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FloatyDialog',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    iconVisible: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '',
    },
    minHeight: {
      type: Number,
      default: 175,
      validator(value) {
        return value >= 175;
      },
    },
    minWidth: {
      type: Number,
      default: 140,
      validator(value) {
        return value >= 140;
      },
    },
    zIndex: {
      type: Number,
      default: 3000,
      validator(value) {
        return value <= 99990;
      },
    },
    showContentMask: {
      type: Boolean,
      default: false,
    },
    destroyContentOnClose: {
      type: Boolean,
      default: false,
    },
    showDockButton: {
      type: Boolean,
      default: false,
    },
    showOpacityButton: {
      type: Boolean,
      default: false,
    },
    initialX: {
      type: Number,
      default: 100,
    },
    initialY: {
      type: Number,
      default: 100,
    },
    initialHeight: {
      type: Number,
      default: 175,
    },
    initialWidth: {
      type: Number,
      default: 140,
    },
    initialDockStatus: {
      type: Number,
      default: 0,
    },
    initialContentOpacity: {
      type: Number,
      default: 100,
    },
  },
  computed: {
    containerStyle() {
      return {
        height: `${this.size.height}px`,
        width: `${this.size.width}px`,
        left: `${this.position.x}px`,
        top: `${this.position.y}px`,
        zIndex: this.zIndex,
      };
    },
    titleBarStyle() {
      return {
        cursor: this.dockStatus === 0 ? 'move' : 'auto',
        zIndex: this.zIndex + 1,
      };
    },
    resizeBarWestStyle() {
      return {
        height: `${this.size.height}px`,
        left: '0',
        transform: 'translateX(-50%)',
        zIndex: this.zIndex + 9,
      };
    },
    resizeBarEastStyle() {
      return {
        height: `${this.size.height}px`,
        right: '0',
        transform: 'translateX(50%)',
        zIndex: this.zIndex + 9,
      };
    },
    resizeBarNorthStyle() {
      return {
        width: `${this.size.width}px`,
        top: '0',
        transform: 'translateY(-50%)',
        zIndex: this.zIndex + 9,
      };
    },
    resizeBarSouthStyle() {
      return {
        width: `${this.size.width}px`,
        bottom: '0',
        transform: 'translateY(50%)',
        zIndex: this.zIndex + 9,
      };
    },
    resizeBlockNorthWestStyle() {
      return {
        top: 0,
        left: 0,
        transform: 'translate(-50%,-50%)',
        zIndex: this.zIndex + 10,
      };
    },
    resizeBlockNorthEastStyle() {
      return {
        top: 0,
        right: 0,
        transform: 'translate(50%,-50%)',
        zIndex: this.zIndex + 10,
      };
    },
    resizeBlockSouthWestStyle() {
      return {
        bottom: 0,
        left: 0,
        transform: 'translate(-50%,50%)',
        zIndex: this.zIndex + 10,
      };
    },
    resizeBlockSouthEastStyle() {
      return {
        bottom: 0,
        right: 0,
        transform: 'translate(50%,50%)',
        zIndex: this.zIndex + 10,
      };
    },
    visualField() {
      return {
        x: this.position.x,
        y: this.position.y,
        height: this.size.height,
        width: this.size.width,
        dockStatus: this.dockStatus,
        contentOpacity: this.contentOpacity,
      };
    },
  },
  watch: {
    visible(value) {
      this.watchedVisible = value;
      if (value) {
        this.addBodyResizeListener();
      } else {
        this.removeBodyResizeListener();
      }
      if (this.destroyContentOnClose) {
        this.key += 1;
      }
      this.restoreInitialValue();
    },
    watchedVisible(value) {
      this.$emit('update:visible', value);
    },
    minHeight(value) {
      if (this.size.height < value) {
        this.size.height = value;
        this.$emit('onVisualFieldAdjusted', this.visualField);
      }
    },
    minWidth(value) {
      if (this.size.width < value) {
        this.size.width = value;
        this.$emit('onVisualFieldAdjusted', this.visualField);
      }
    },
  },
  data() {
    /*
     * adjustStatus 代码含义:
     *   0: 没有调整。
     *   1: 正在移动。
     *   2: 正在调整尺寸。
     *
     * dockStatus 代码含义:
     *   0: 没有停靠。
     *   1: 上侧停靠。
     *   2: 左侧停靠。
     *   3: 下侧停靠。
     *   4: 右侧停靠。
     *
     * contextMenuStatus 代码含义:
     *   0: 未弹出菜单。
     *   1: 停靠选择菜单。
     *   2: 组件透明度调整菜单。
     */
    return {
      watchedVisible: false,
      position: {
        x: 100,
        y: 100,
      },
      size: {
        height: 175,
        width: 140,
      },
      mousePositionCopy: {
        x: 0,
        y: 0,
      },
      positionCopy: {
        x: 0,
        y: 0,
      },
      sizeCopy: {
        height: 0,
        width: 0,
      },
      anchorResizeHandle: null,
      adjustStatus: 0,
      maskCursor: 'auto',
      dockStatus: 0,
      operateOverride: false,
      contextMenuStatus: 0,
      positionBackup: {
        x: 0,
        y: 0,
      },
      sizeBackup: {
        height: 0,
        width: 0,
      },
      bodyResizeObserver: null,
      key: 0,
      contentOpacity: 100,
      timeout: null,
    };
  },
  methods: {
    syncProps() {
      this.watchedVisible = this.visible;
    },
    handleStartMove($event) {
      // 如果窗口正在停靠，则不执行移动动作。
      if (this.dockStatus !== 0) {
        return;
      }
      // 如果用户正在操作操作按钮区域，则停止移动操作。
      if (this.operateOverride) {
        return;
      }
      // 阻止默认事件、并阻止事件穿透。
      $event.preventDefault();
      $event.stopPropagation();
      // 设置初始的鼠标位置。
      this.mousePositionCopy.x = $event.clientX;
      this.mousePositionCopy.y = $event.clientY;
      // 设置位置副本。
      this.positionCopy.x = this.position.x;
      this.positionCopy.y = this.position.y;
      // 设置蒙版的鼠标样式。
      this.maskCursor = this.inspectCursorStyle($event);
      // 置位调整状态。
      this.adjustStatus = 1;
      // 为 document 增加相关侦听。
      document.addEventListener('mousemove', this.handleMoving);
      document.addEventListener('mouseup', this.handleStopMove);
    },
    handleMoving($event) {
      // 阻止默认事件、并阻止事件穿透。
      $event.preventDefault();
      $event.stopPropagation();
      // 应用动画帧处理移动动作。
      requestAnimationFrame(() => {
        // 该方法在动作帧中执行，因此存在滞后性，有可能在用户松开鼠标后执行。
        // 如果窗口没有移动，则直接退出。
        if (this.adjustStatus !== 1) {
          return;
        }
        // 计算鼠标移动增量，将增量应用到元素的位置属性中。
        this.position.x = $event.clientX - this.mousePositionCopy.x + this.positionCopy.x;
        this.position.y = $event.clientY - this.mousePositionCopy.y + this.positionCopy.y;
        // 计算边界。
        const minLeft = -this.$refs.container.clientWidth + 20;
        const maxLeft = document.body.clientWidth - 20;
        const minTop = 0;
        const maxTop = document.body.clientHeight - 40;
        // 元素位置与边界坐标比较，并根据情况取值。
        this.position.x = Math.max(this.position.x, minLeft);
        this.position.x = Math.min(this.position.x, maxLeft);
        this.position.y = Math.max(this.position.y, minTop);
        this.position.y = Math.min(this.position.y, maxTop);
      });
    },
    handleStopMove($event) {
      // 阻止默认事件、并阻止事件穿透。
      $event.preventDefault();
      $event.stopPropagation();
      // 复位调整状态。
      this.adjustStatus = 0;
      // 为 document 移除相关侦听。
      document.removeEventListener('mousemove', this.handleMoving);
      document.removeEventListener('mouseup', this.handleStopMove);
      // 根据条件抛出事件。
      if (this.positionCopyEquals()) {
        return;
      }
      this.$emit('onVisualFieldAdjusted', this.visualField);
    },
    handleStartResize($event, resizeHandle) {
      // 阻止默认事件、并阻止事件穿透。
      $event.preventDefault();
      $event.stopPropagation();
      // 设置锚点调整尺寸句柄。
      this.anchorResizeHandle = resizeHandle;
      // 设置初始的鼠标位置。
      this.mousePositionCopy.x = $event.clientX;
      this.mousePositionCopy.y = $event.clientY;
      // 设置位置副本。
      this.positionCopy.x = this.position.x;
      this.positionCopy.y = this.position.y;
      // 设置尺寸副本。
      this.sizeCopy.height = this.size.height;
      this.sizeCopy.width = this.size.width;
      // 设置蒙版的鼠标样式。
      this.maskCursor = this.inspectCursorStyle($event);
      // 置位调整状态。
      this.adjustStatus = 2;
      // 为 document 增加相关侦听。
      document.addEventListener('mousemove', this.handleResizing);
      document.addEventListener('mouseup', this.handleStopResize);
    },
    handleResizing($event) {
      // 阻止默认事件、并阻止事件穿透。
      $event.preventDefault();
      $event.stopPropagation();
      // 应用动画帧处理移动动作。
      requestAnimationFrame(() => {
        // 该方法在动作帧中执行，因此存在滞后性，有可能在用户松开鼠标后执行。
        // 如果窗口没有调整尺寸，则直接退出。
        if (this.adjustStatus !== 2) {
          return;
        }
        // 计算鼠标移动增量。
        const dX = $event.clientX - this.mousePositionCopy.x;
        const dY = $event.clientY - this.mousePositionCopy.y;
        // 调用锚点句柄处理调整尺寸细节。
        this.anchorResizeHandle(dX, dY);
      });
    },
    handleStopResize($event) {
      // 阻止默认事件、并阻止事件穿透。
      $event.preventDefault();
      $event.stopPropagation();
      // 复位调整状态。
      this.adjustStatus = 0;
      // 为 document 移除相关侦听。
      document.removeEventListener('mousemove', this.handleResizing);
      document.removeEventListener('mouseup', this.handleStopResize);
      // 根据条件抛出事件。
      if (this.positionCopyEquals() && this.sizeCopyEquals()) {
        return;
      }
      this.$emit('onVisualFieldAdjusted', this.visualField);
    },
    positionCopyEquals() {
      if (this.position.x !== this.positionCopy.x) {
        return false;
      }
      return this.position.y === this.positionCopy.y;
    },
    sizeCopyEquals() {
      if (this.size.height !== this.sizeCopy.height) {
        return false;
      }
      return this.size.width === this.sizeCopy.width;
    },
    inspectCursorStyle($event) {
      return window.getComputedStyle($event.target, '::after').getPropertyValue('cursor');
    },
    westResizingHandle(dX) {
      // 将增量应用到元素的位置属性中。
      this.position.x = this.positionCopy.x + dX;
      this.size.width = this.sizeCopy.width - dX;
      // 计算极限值。
      const maxPositionX = this.positionCopy.x + this.sizeCopy.width - this.minWidth;
      // eslint-disable-next-line prefer-destructuring
      const minWidth = this.minWidth;
      // 元素位置、尺寸与极限值比较，并根据情况取值。
      this.position.x = Math.min(this.position.x, maxPositionX);
      this.size.width = Math.max(this.size.width, minWidth);
    },
    eastResizingHandle(dX) {
      // 将增量应用到元素的位置属性中。
      this.size.width = this.sizeCopy.width + dX;
      // 计算极限值。
      // eslint-disable-next-line prefer-destructuring
      const minWidth = this.minWidth;
      // 元素位置、尺寸与极限值比较，并根据情况取值。
      this.size.width = Math.max(this.size.width, minWidth);
    },
    northResizingHandle(dX, dY) {
      // 将增量应用到元素的位置属性中。
      this.position.y = this.positionCopy.y + dY;
      this.size.height = this.sizeCopy.height - dY;
      // 计算极限值。
      const minPositionY = 0;
      const maxPositionY = this.positionCopy.y + this.sizeCopy.height - this.minHeight;
      // eslint-disable-next-line prefer-destructuring
      const minHeight = this.minHeight;
      const maxHeight = this.positionCopy.y + this.sizeCopy.height;
      // 元素位置、尺寸与极限值比较，并根据情况取值。
      this.position.y = Math.min(this.position.y, maxPositionY);
      this.position.y = Math.max(this.position.y, minPositionY);
      this.size.height = Math.min(this.size.height, maxHeight);
      this.size.height = Math.max(this.size.height, minHeight);
    },
    southResizingHandle(dX, dY) {
      // 将增量应用到元素的位置属性中。
      this.size.height = this.sizeCopy.height + dY;
      // 计算极限值。
      // eslint-disable-next-line prefer-destructuring
      const minHeight = this.minHeight;
      // 元素位置、尺寸与极限值比较，并根据情况取值。
      this.size.height = Math.max(this.size.height, minHeight);
    },
    northWestResizingHandle(dX, dY) {
      // 代理两个边的尺寸调整句柄。
      this.westResizingHandle(dX);
      this.northResizingHandle(dX, dY);
    },
    northEastResizingHandle(dX, dY) {
      // 代理两个边的尺寸调整句柄。
      this.eastResizingHandle(dX);
      this.northResizingHandle(dX, dY);
    },
    southWestResizingHandle(dX, dY) {
      // 代理两个边的尺寸调整句柄。
      this.westResizingHandle(dX);
      this.southResizingHandle(dX, dY);
    },
    southEastResizingHandle(dX, dY) {
      // 代理两个边的尺寸调整句柄。
      this.eastResizingHandle(dX);
      this.southResizingHandle(dX, dY);
    },
    handleClose() {
      this.watchedVisible = false;
      this.operateOverride = false;
      this.$nextTick(() => {
        this.$emit('onClosed');
      });
    },
    handleShowContextMenu(status) {
      this.maskCursor = 'auto';
      this.contextMenuStatus = status;
      this.$nextTick(() => {
        this.$refs.contextmenu.focus();
      });
    },
    handleContentOpacitySliderChanged() {
      // 关闭菜单。
      this.closeContextMenu();
      // 抛出事件。
      this.$emit('onVisualFieldAdjusted', this.visualField);
    },
    closeContextMenu() {
      this.contextMenuStatus = 0;
    },
    handleDockTop() {
      // 如果窗口之前是未停靠状态，则备份视觉字段。
      if (this.dockStatus === 0) {
        this.backupVisualField();
      }
      // 位置及尺寸变更。
      this.position.x = 0;
      this.position.y = 0;
      this.size.height = this.sizeBackup.height;
      this.size.width = document.body.clientWidth;
      // 设置停靠状态。
      this.dockStatus = 1;
      // 关闭菜单。
      this.closeContextMenu();
      // 抛出事件。
      this.$emit('onVisualFieldAdjusted', this.visualField);
    },
    handleDockLeft() {
      // 如果窗口之前是停靠状态，则备份视觉字段。
      if (this.dockStatus === 0) {
        this.backupVisualField();
      }
      // 位置及尺寸变更。
      this.position.x = 0;
      this.position.y = 0;
      this.size.height = document.body.clientHeight;
      this.size.width = this.sizeBackup.width;
      // 设置停靠状态。
      this.dockStatus = 2;
      // 关闭菜单。
      this.closeContextMenu();
      // 抛出事件。
      this.$emit('onVisualFieldAdjusted', this.visualField);
    },
    handleDockDown() {
      // 如果窗口之前是未停靠状态，则备份视觉字段。
      if (this.dockStatus === 0) {
        this.backupVisualField();
      }
      // 位置及尺寸变更。
      this.position.x = 0;
      this.position.y = document.body.clientHeight - this.sizeBackup.height;
      this.size.height = this.sizeBackup.height;
      this.size.width = document.body.clientWidth;
      // 设置停靠状态。
      this.dockStatus = 3;
      // 关闭菜单。
      this.closeContextMenu();
      // 抛出事件。
      this.$emit('onVisualFieldAdjusted', this.visualField);
    },
    handleDockRight() {
      // 如果窗口之前是未停靠状态，则备份视觉字段。
      if (this.dockStatus === 0) {
        this.backupVisualField();
      }
      // 位置及尺寸变更。
      this.position.x = document.body.clientWidth - this.sizeBackup.width;
      this.position.y = 0;
      this.size.height = document.body.clientHeight;
      this.size.width = this.sizeBackup.width;
      // 设置停靠状态。
      this.dockStatus = 4;
      // 关闭菜单。
      this.closeContextMenu();
      // 抛出事件。
      this.$emit('onVisualFieldAdjusted', this.visualField);
    },
    handleUndock() {
      // 复位操作区域复写标记。
      this.operateOverride = false;
      // 如果窗口之前是停靠状态，则恢复视觉字段。
      if (this.dockStatus !== 0) {
        this.resumeVisualField();
      }
      // 元素位置与边界坐标比较，并根据情况取值。
      this.position.x = Math.min(this.position.x, document.body.clientWidth - 20);
      this.position.y = Math.min(this.position.y, document.body.clientHeight - 40);
      // 保证尺寸不小于最小尺寸。
      this.size.height = Math.max(this.size.height, this.minHeight);
      this.size.width = Math.max(this.size.width, this.minWidth);
      // 设置停靠状态。
      this.dockStatus = 0;
      // 关闭菜单。
      this.closeContextMenu();
      // 抛出事件。
      this.$emit('onVisualFieldAdjusted', this.visualField);
    },
    backupVisualField() {
      this.positionBackup.x = this.position.x;
      this.positionBackup.y = this.position.y;
      this.sizeBackup.height = this.size.height;
      this.sizeBackup.width = this.size.width;
    },
    resumeVisualField() {
      this.position.x = this.positionBackup.x;
      this.position.y = this.positionBackup.y;
      this.size.height = this.sizeBackup.height;
      this.size.width = this.sizeBackup.width;
    },
    addBodyResizeListener() {
      if (this.bodyResizeObserver !== null) {
        return;
      }
      this.bodyResizeObserver = new ResizeObserver(() => {
        if (!this.revalidateVisualField()) {
          return;
        }
        if (this.timeout !== null) {
          clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(() => {
          this.$emit('onVisualFieldAdjusted', this.visualField);
        }, 300);
      });
      this.bodyResizeObserver.observe(document.body);
    },
    removeBodyResizeListener() {
      if (this.bodyResizeObserver === null) {
        return;
      }
      this.bodyResizeObserver.unobserve(document.body);
      this.bodyResizeObserver = null;
    },
    restoreInitialValue() {
      this.position.x = this.initialX;
      this.position.y = this.initialY;
      this.size.height = this.initialHeight;
      this.size.width = this.initialWidth;
      this.dockStatus = this.initialDockStatus;
      this.contentOpacity = this.initialContentOpacity;
      this.revalidateVisualFieldAndEmit();
    },
    revalidateVisualField() {
      const oldPositionX = this.position.x;
      const oldPositionY = this.position.y;
      const oldSizeHeight = this.size.height;
      const oldSizeWidth = this.size.width;
      switch (this.dockStatus) {
        case 0:
          this.position.x = Math.min(this.position.x, document.body.clientWidth - 20);
          this.position.y = Math.min(this.position.y, document.body.clientHeight - 40);
          this.size.height = Math.max(this.size.height, this.minHeight);
          this.size.width = Math.max(this.size.width, this.minWidth);
          break;
        case 1:
          this.position.x = 0;
          this.position.y = 0;
          this.size.height = Math.max(this.size.height, this.minHeight);
          this.size.width = document.body.clientWidth;
          break;
        case 2:
          this.position.x = 0;
          this.position.y = 0;
          this.size.height = document.body.clientHeight;
          this.size.width = Math.max(this.size.width, this.minWidth);
          break;
        case 3:
          this.position.x = 0;
          this.position.y = document.body.clientHeight - this.size.height;
          this.size.height = Math.max(this.size.height, this.minHeight);
          this.size.width = document.body.clientWidth;
          break;
        case 4:
          this.position.x = document.body.clientWidth - this.size.width;
          this.position.y = 0;
          this.size.height = document.body.clientHeight;
          this.size.width = Math.max(this.size.width, this.minWidth);
          break;
        default:
          break;
      }
      if (oldPositionX !== this.position.x) {
        return true;
      }
      if (oldPositionY !== this.position.y) {
        return true;
      }
      if (oldSizeHeight !== this.size.height) {
        return true;
      }
      return oldSizeWidth !== this.size.width;
    },
    revalidateVisualFieldAndEmit() {
      if (!this.revalidateVisualField()) {
        return;
      }
      this.$emit('onVisualFieldAdjusted', this.visualField);
    },
  },
  mounted() {
    this.syncProps();
    this.addBodyResizeListener();
    this.restoreInitialValue();
    this.revalidateVisualFieldAndEmit();
  },
  destroyed() {
    this.removeBodyResizeListener();
  },
};
</script>

<style scoped>
.floaty-dialog-container {
  position: fixed;
}

.frame {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  border-radius: 4px;
  border-width: 2px;
  border-style: solid;
  border-color: #d8dce5;
}

.title-bar {
  height: 32px;
  width: 100%;
  display: flex;
  flex-direction: row;
  box-sizing: border-box;
  padding: 5px 8px;
  background: #F5F7FA;
  border-bottom: 1px solid #d8dce5;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, .12), 0 0 3px 0 rgba(0, 0, 0, .04);
}

.title-bar-item {
  height: 100%;
}

.title-bar-item:not(:last-child) {
  margin-right: 5px;
}

.content-panel {
  height: 0;
  width: 100%;
  flex-grow: 1;
  box-sizing: border-box;
}

.content-panel-item {
  height: 100%;
  width: 100%;
  box-sizing: border-box;
}

.content-panel-mask {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.content-panel-mask i {
  user-select: none;
  color: #BFBFBF;
  font-size: 64px;
}

.content-panel-body {
  overflow: hidden;
  border-style: solid;
  border-width: 8px;
  border-color: #FFFFFF;
}

.content-panel-placeholder {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background: #FFFFFF;
}

.content-panel-placeholder i {
  user-select: none;
  color: #BFBFBF;
  font-size: 64px;
}

.resize-item {
  position: absolute;
}

.resize-item.resize-bar-vertical {
  width: 12px;
  top: 0;
  cursor: ew-resize;
}

.resize-item.resize-bar-horizontal {
  height: 12px;
  left: 0;
  cursor: ns-resize;
}

.resize-item.resize-block-nwse {
  width: 16px;
  height: 16px;
  cursor: nwse-resize;
}

.resize-item.resize-block-nesw {
  width: 16px;
  height: 16px;
  cursor: nesw-resize;
}

.global-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99999;
}

.icon-area {
  width: 21px;
  user-select: none;
}

.title-area {
  width: 0;
  flex-grow: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.title-area span {
  color: #495060;
  user-select: none;
  font-size: 14px;
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei",
  "微软雅黑", Arial, sans-serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.operate-area {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.operate-area .button {
  padding: 2px 5px;
}

.operate-area .button i {
  font-size: 14px;
}

.contextmenu {
  position: absolute;
  top: 27px;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: auto;
  z-index: 100000;
}

.contextmenu:focus {
  outline: none;
}

.contextmenu.dock ul {
  width: 60px;
  margin: 5px 0 0;
  padding: 5px 0;
  box-sizing: border-box;
  list-style-type: none;
  border-radius: 4px;
  border-width: 1px;
  border-style: solid;
  border-color: transparent;
  font-size: 12px;
  font-weight: 400;
  color: #333;
  box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, .3);
  background: #F5F7FA;
}

.contextmenu.dock li {
  margin: 0;
  padding: 1px 4px;
  cursor: pointer;
  font-size: 20px;
  text-align: center;
  color: #495060;
}

.contextmenu.dock li:hover {
  background: #eee;
}

.contextmenu.opacity .slider {
  width: 60px;
  margin: 5px 0 0;
  padding: 17px 0;
  box-sizing: border-box;
  list-style-type: none;
  border-radius: 4px;
  border-width: 1px;
  border-style: solid;
  border-color: transparent;
  font-size: 12px;
  font-weight: 400;
  color: #333;
  box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, .3);
  background: #F5F7FA;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/*noinspection CssUnusedSymbol*/
.contextmenu.opacity >>> .el-slider__button {
  height: 12px;
  width: 12px;
}
</style>

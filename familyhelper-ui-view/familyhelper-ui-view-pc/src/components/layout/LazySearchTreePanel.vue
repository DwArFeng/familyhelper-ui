<template>
  <!--suppress VueUnrecognizedDirective -->
  <div class="lazy-search-tree-panel-container" v-loading="loading">
    <header-layout-panel>
      <template v-slot:header>
        <div class="header-container">
          <div class="flex-item expand select-wrapper">
            <transition name="tooltip">
              <div
                class="tooltip"
                ref="tooltip"
                v-show="tooltip.visible"
                :style="tooltipStyle"
              >
                <div class="content-wrapper">
                  <div v-if="tooltip.loading" class="content">
                    <i class="el-icon-loading"/>
                    <span>{{ loadingText }}</span>
                  </div>
                  <div v-else class="content">
                    <i class="el-icon-aim"/>
                    <span>{{ tooltip.content }}</span>
                  </div>
                </div>
              </div>
            </transition>
            <el-select
              class="select"
              ref="select"
              v-model="select.value"
              filterable
              remote
              clearable
              :loading="select.loading"
              :placeholder="placeholder"
              :value-key="keyField"
              :popper-append-to-body="false"
              :remote-method="wrappedSearchOptionHandler"
              :loading-text="loadingText"
              @change="handleSelectChanged"
            >
              <el-option
                ref="option"
                v-for="(option,index) in select.options"
                :key="index"
                :label="option[labelField]"
                :value="option"
              >
                <slot name="default" :node="null" :data="option">
                  <default-tree-default-slot :label="option[labelField]"/>
                </slot>
              </el-option>
            </el-select>
          </div>
          <el-button
            class="flex-item search-button"
            icon="el-icon-refresh"
            @click="refresh"
          />
        </div>
      </template>
      <template v-slot:default>
        <overlay-scrollbars class="body-container scroll-bar">
          <el-tree
            class="tree-panel"
            ref="tree"
            lazy
            :data="tree.root"
            :props="{label:labelField,isLeaf:isLeafField}"
            :accordion="accordion"
            :load="wrappedLoadChildHandler"
            :expand-on-click-node="false"
            :check-on-click-node="true"
            :node-key="keyField"
            :highlight-current="true"
            @current-change="handleCurrentChanged"
          >
            <!--suppress VueUnrecognizedSlot -->
            <template v-slot:default="{node, data}">
              <div class="tree-node">
                <div class="tree-node-content">
                  <slot name="default" :node="node" :data="data">
                    <default-tree-default-slot :label="data[labelField]"/>
                  </slot>
                </div>
                <div
                  class="tree-node-operate-area"
                  v-if="operateAreaVisible"
                  @mouseenter="tree.operateAreaHover=true"
                  @mouseleave="tree.operateAreaHover=false"
                >
                  <slot name="operateArea" :node="node" :data="data">
                    <default-tree-operate-area-slot
                      :node="node"
                      :data="data"
                      :inspectButtonVisible="inspectButtonVisible"
                      :editButtonVisible="editButtonVisible"
                      :deleteButtonVisible="deleteButtonVisible"
                      @onEntityInspect="handleEntityInspect"
                      @onEntityEdit="handleEntityEdit"
                      @onEntityDelete="handleEntityDelete"
                    />
                  </slot>
                </div>
              </div>
            </template>
          </el-tree>
        </overlay-scrollbars>
      </template>
    </header-layout-panel>
  </div>
</template>

<script>
import HeaderLayoutPanel from '@/components/layout/HeaderLayoutPanel.vue';
import DefaultTreeDefaultSlot from '@/components/layout/DefaultTreeDefaultSlot.vue';
import DefaultTreeOperateAreaSlot from '@/components/layout/DefaultTreeOperateAreaSlot.vue';

export default {
  name: 'LazySearchTreePanel',
  components: { DefaultTreeOperateAreaSlot, DefaultTreeDefaultSlot, HeaderLayoutPanel },
  props: {
    keyField: {
      type: String,
      default: 'key',
    },
    labelField: {
      type: String,
      default: 'label',
    },
    isLeafField: {
      type: String,
      default: 'isLeaf',
    },
    placeholder: {
      type: String,
      default: '请输入名称',
    },
    searchOptionHandler: {
      type: Function,
      default: (pattern, accept) => {
        accept([]);
      },
    },
    accordion: {
      type: Boolean,
      default: () => false,
    },
    loadRootHandler: {
      type: Function,
      default: (accept) => {
        accept([]);
      },
    },
    loadChildHandler: {
      type: Function,
      default: (node, accept) => {
        accept([]);
      },
    },
    inspectButtonVisible: {
      type: Boolean,
      default: true,
    },
    editButtonVisible: {
      type: Boolean,
      default: true,
    },
    deleteButtonVisible: {
      type: Boolean,
      default: true,
    },
    operateAreaVisible: {
      type: Boolean,
      default: true,
    },
    queryPathHandler: {
      type: Function,
      default: (data, accept) => {
        accept([]);
      },
    },
    loadingText: {
      type: String,
      default: '正在加载',
    },
    pathDelimiter: {
      type: String,
      default: '/',
    },
  },
  computed: {
    tooltipStyle() {
      return {
        top: `${this.tooltip.top}px`,
        left: `${this.tooltip.left}px`,
        width: `${this.tooltip.width}px`,
      };
    },
  },
  data() {
    return {
      loading: false,
      select: {
        loading: false,
        value: '',
        options: [],
      },
      tree: {
        root: [],
        operateAreaHover: false,
      },
      tooltip: {
        loading: true,
        visible: false,
        timer: null,
        anchorIndex: 0,
        content: '',
        top: 0,
        left: 0,
        width: 100,
        unwatchHandle: null,
      },
    };
  },
  methods: {
    wrappedSearchOptionHandler(pattern) {
      // 构造 accept 函数。
      const accept = (res) => {
        this.select.options = [];
        this.select.options.push(...res);
        this.select.loading = false;
      };
      // 调用 searchOptionHandler 加载搜索选项。
      this.select.loading = true;
      this.searchOptionHandler(pattern, accept);
    },
    wrappedLoadChildHandler(node, resolve) {
      if (node.level === 0) {
        return;
      }
      // 构造 accept 函数。
      const accept = (res) => {
        resolve(res);
      };
      // 调用 loadChildHandler 加载子节点。
      this.loadChildHandler(node.data[this.keyField], accept);
    },
    handleSearch() {
      if (this.select.value === '') {
        this.handleSearchRoot();
      } else {
        this.handleSearchValue(this.select.value);
      }
    },
    handleSearchRoot() {
      // 构造 accept 函数。
      const accept = (res) => {
        this.tree.root = [];
        this.tree.root.push(...res);
        this.loading = false;
      };
      // 调用 loadRootHandler 加载根节点。
      this.loading = true;
      this.loadRootHandler(accept);
    },
    handleSearchValue(value) {
      // 构造 accept 函数。
      const accepter = (path) => {
        // 获取树的节点映射。
        const nodeMap = this.nodeMap();

        // 定义 offset 变量，用于记录第一个没被加载的节点的索引。
        let offset = 0;

        // 遍历查询得到的路径，确认节点是否被加载，获取第一个没被加载的节点的索引。
        for (; offset < path.length; offset += 1) {
          // 获取节点的 key。
          const key = path[offset][this.keyField];
          // 如果节点没有被加载，跳出循环。
          if (!nodeMap[key]) {
            break;
          }
          // 如果节点被加载，但 loaded 为 false，跳出循环。
          if (!nodeMap[key].loaded) {
            break;
          }
        }

        // 如果 offset 等于 path.length，说明所有节点都被加载。
        if (offset === path.length) {
          // 遍历查询得到的路径，展开所有节点。
          path.forEach((entity) => {
            const key = entity[this.keyField];
            const node = nodeMap[key];
            node.expand();
          });
          // 定义中间变量。
          const currentKey = value[this.keyField];
          const currentNode = nodeMap[currentKey];
          const currentData = currentNode.data;
          // 选中 value 对应的节点。
          this.setCurrentKey(currentKey);
          // 发送 onCurrentChanged 事件。
          this.$emit('onCurrentChanged', currentNode, currentData);
          // 如果 accordion 为 true，收起其他节点。
          this.mayCollapseOtherNode(path);
          this.loading = false;
          // 返回。
          return;
        }

        // 获取 index 到 res.length 的剩余元素数量。
        let remainCount = path.length - offset;

        // 定义 childInfo 变量，用于存储未被加载的所有节点。
        const childInfos = [];

        // 构造 accept 函数的构造函数。
        const acceptProvider = (index) => (children) => {
          // 向 childInfo 中添加节点信息，并减少 remain 的值。
          childInfos[index - offset] = { key: path[index][this.keyField], children };
          remainCount -= 1;
          // 如果 remainCount 大于 0，说明还有子节点没有被加载，不进行操作。
          if (remainCount > 0) {
            return;
          }
          // 如果 remainCount 等于 0，说明所有子节点都被加载。
          // 将加载的子节点添加到其父节点中。
          childInfos.forEach((childInfo) => {
            const node = nodeMap[childInfo.key];
            // 将节点设置为已加载。
            node.loaded = true;
            // 清除旧的子节点数据。
            node.childNodes = [];
            // 将子节点添加到父节点中。
            childInfo.children.forEach((child) => {
              this.append(node, child);
            });
          });
          // 展开节点。
          path.forEach((entity) => {
            const key = entity[this.keyField];
            const node = nodeMap[key];
            node.expand();
          });
          // 定义中间变量。
          const currentKey = value[this.keyField];
          const currentNode = nodeMap[currentKey];
          const currentData = currentNode.data;
          // 选中 value 对应的节点。
          this.setCurrentKey(currentKey);
          // 发送 onCurrentChanged 事件。
          this.$emit('onCurrentChanged', currentNode, currentData);
          // 如果 accordion 为 true，收起其他节点。
          this.mayCollapseOtherNode(path);
          this.loading = false;
        };

        // 从 offset 遍历到 res.length，查询未被加载的所有节点。
        for (let index = offset; index < path.length; index += 1) {
          // 构造 accept 函数。
          const accept = acceptProvider(index);
          // 调用 loadChildHandler 加载子节点。
          this.loadChildHandler(path[index][this.keyField], accept);
        }
      };
      // 调用 queryPathHandler 查询路径。
      this.loading = true;
      this.queryPathHandler(value[this.keyField], accepter);
    },
    mayCollapseOtherNode(path) {
      // 如果 accordion 为 false，不进行操作。
      if (!this.accordion) {
        return;
      }
      // 获取树的节点映射。
      const nodeMap = this.nodeMap();
      path.forEach((entity) => {
        // 获取节点的 key。
        const key = entity[this.keyField];
        // 获取节点。
        const node = nodeMap[key];
        // 获取节点的 id。
        const { id } = node;
        // 获取该节点的所有兄弟节点。
        const siblings = node.parent.childNodes;
        // 遍历兄弟节点，收起所有不是当前节点的节点。
        siblings.forEach((sibling) => {
          if (sibling.id !== id) {
            sibling.collapse();
          }
        });
      });
    },
    handleSelectChanged(value) {
      // 如果 value 等于空字符串，不进行操作。
      if (value === '') {
        return;
      }
      // 如果 value 不等于空字符串，调用 handleSearchValue 搜索并定位。
      this.handleSearchValue(value);
    },
    handleCurrentChanged(data, node) {
      if (this.tree.operateAreaHover) {
        return;
      }
      this.$emit('onCurrentChanged', node, data);
    },
    handleEntityInspect(node, data) {
      this.$emit('onEntityInspect', node, data);
    },
    handleEntityEdit(node, data) {
      this.$emit('onEntityEdit', node, data);
    },
    handleEntityDelete(node, data) {
      const accept = () => {
        this.$refs.tree.remove(node);
      };
      this.$emit('onEntityDelete', node, data, accept);
    },
    getNode(data) {
      return this.$refs.tree.getNode(data);
    },
    appendRoot(data) {
      this.tree.root.push(data);
    },
    append(nodeRef, data) {
      this.$refs.tree.append(data, nodeRef);
    },
    insertBefore(nodeRef, data) {
      this.$refs.tree.insertBefore(data, nodeRef);
    },
    insertAfter(nodeRef, data) {
      this.$refs.tree.insertAfter(data, nodeRef);
    },
    remove(nodeRef) {
      this.$refs.tree.remove(nodeRef);
    },
    nodeMap() {
      return this.$refs.tree.store.nodesMap;
    },
    setCurrentKey(key) {
      this.$refs.tree.setCurrentKey(key);
    },
    refresh() {
      this.select.value = '';
      this.select.options = [];
      this.tree.root = [];
      this.handleSearch();
      this.$emit('onCurrentChanged', null, null);
    },
    handleHoverIndexChanged(index) {
      // 隐藏 tooltip。
      this.tooltip.visible = false;
      if (this.tooltip.timer) {
        clearTimeout(this.tooltip.timer);
        this.tooltip.timer = null;
      }

      // 如果 index 等于 -1，不进行操作。
      if (index === -1) {
        return;
      }

      this.tooltip.timer = setTimeout(() => {
        // 获得 option。
        const option = this.select.options[index];
        // 设置 tooltip 的 index。
        this.tooltip.index = index;
        // 加载 tooltip 内容。
        this.tooltip.loading = true;
        // 设置 tooltip 的显示状态。
        this.tooltip.visible = true;
        // 调整 tooltip 的位置以及尺寸。
        this.adjustTooltipStyle()
          .then(() => new Promise((resolve) => {
            this.queryPathHandler(option[this.keyField], (accept) => {
              resolve(accept);
            });
          }))
          .then((path) => {
            let pathString = this.pathDelimiter;
            // 遍历 path，拼接 pathString。
            path.forEach((entity) => {
              pathString += entity[this.labelField] + this.pathDelimiter;
            });
            pathString += option[this.labelField];
            // 设置 tooltip 内容。
            this.tooltip.content = pathString;
            // 设置 tooltip 加载状态。
            this.tooltip.loading = false;
            // 调整 tooltip 的位置以及尺寸。
            return this.adjustTooltipStyle();
          });
      }, 500);
    },
    adjustTooltipStyle() {
      return this.$nextTick()
        .then(() => {
          const optionEl = this.$refs.option[this.tooltip.index].$el;
          // 获取 optionEl 的位置，作为参考位置。
          const refTop = optionEl.getBoundingClientRect().top;
          const refLeft = optionEl.getBoundingClientRect().left;
          // 调整 tooltip 的位置以及尺寸。
          this.tooltip.top = refTop - 2 - this.$refs.tooltip.offsetHeight;
          this.tooltip.left = refLeft + 10;
          // noinspection JSUnresolvedReference
          this.tooltip.width = optionEl.offsetWidth - 20;
          // 返回一个 Promise 对象。
          return Promise.resolve();
        });
    },
  },
  mounted() {
    this.handleSearch();
    this.tooltip.unwatchHandle = this.$watch(
      () => this.$refs.select.$data.hoverIndex,
      (value) => {
        this.handleHoverIndexChanged(value);
      },
    );
  },
  beforeDestroy() {
    this.tooltip.unwatchHandle();
  },
};
</script>

<style scoped>
.lazy-search-tree-panel-container {
  width: 100%;
  height: 100%;
}

.header-container {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.header-container .flex-item.expand {
  flex-grow: 1;
}

.header-container .flex-item:not(:last-child) {
  margin-right: 5px;
}

.select-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
  height: 100%;
}

.select-wrapper .tooltip {
  box-sizing: border-box;
  position: fixed;
  z-index: 6000;
  padding: 2px 0;
  color: #606266;
  background: white;
  border: solid 1px #DCDFE6;
  pointer-events: none;
}

/*noinspection CssUnusedSymbol*/
.tooltip-enter-active, .tooltip-leave-active {
  transition: opacity .3s;
}

/*noinspection CssUnusedSymbol*/
.tooltip-enter-to, .tooltip-leave {
  opacity: 1;
}

/*noinspection CssUnusedSymbol*/
.tooltip-enter, .tooltip-leave-to {
  opacity: 0;
}

.select-wrapper .tooltip .content-wrapper {
  box-sizing: border-box;
  height: 100%;
  width: 100%;
  padding: 0 10px;
}

.select-wrapper .tooltip .content-wrapper .content {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.select-wrapper .tooltip i {
  margin-right: 5px;
  font-size: 14px;
}

.select-wrapper .tooltip .content-wrapper .content span {
  width: 0;
  flex-grow: 1;
  font-size: 12px;
  word-break: break-all;
}

.select {
  height: 100%;
  width: 100%;
}

.select >>> input {
  cursor: text;
}

.search-button {
  padding: 12px
}

.body-container {
  width: 100%;
  height: 100%;
}

.tree-panel {
  display: inline-block;
  min-width: 100%;
}

/*noinspection CssUnusedSymbol*/
.tree-panel >>> .el-tree-node__content {
  height: 100%;
  margin-bottom: 2px;
}

.tree-node {
  width: 100%;
  display: flex;
  align-items: center;
}

.tree-node-content {
  height: 100%;
  width: 0;
  flex-grow: 1;
}

.tree-node-operate-area {
  height: 100%;
}
</style>

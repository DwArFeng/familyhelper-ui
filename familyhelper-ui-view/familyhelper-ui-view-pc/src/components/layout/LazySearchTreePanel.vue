<template>
  <div class="lazy-search-tree-panel-container" v-loading="loading">
    <header-layout-panel>
      <template v-slot:header>
        <div class="header-container">
          <el-select
            class="flex-item expand select"
            v-model="select.value"
            filterable
            remote
            clearable
            :loading="select.loading"
            :placeholder="placeholder"
            :value-key="keyField"
            :popper-append-to-body="false"
            :remote-method="wrappedSearchOptionHandler"
            @change="handleSelectChanged"
          >
            <el-option
              v-for="option in select.options"
              :key="option[keyField]"
              :label="option[labelField]"
              :value="option"
            >
              <slot name="default" :node="null" :data="option">
                <default-tree-default-slot :label="option[labelField]"/>
              </slot>
            </el-option>
          </el-select>
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
          const key = path[offset];
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
          path.forEach((key) => {
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
          childInfos[index - offset] = { key: path[index], children };
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
          path.forEach((key) => {
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
          this.loadChildHandler(path[index], accept);
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
      path.forEach((key) => {
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
  },
  mounted() {
    this.handleSearch();
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

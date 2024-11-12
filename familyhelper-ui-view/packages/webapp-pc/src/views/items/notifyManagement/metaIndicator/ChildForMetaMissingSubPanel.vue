<template>
  <div class="child-for-meta-missing-sub-panel-container">
    <div class="placeholder" v-if="selectionInvalid">
      请指定通知设置、主题、用户
    </div>
    <div class="valid-container" v-else>
      <div class="placeholder" v-if="table.data.length===0">
        没有需要添加的元数据项
      </div>
      <div class="select-container" v-else>
        <el-input v-model="labelFilterBar.value" placeholder="名称筛选" clearable/>
        <el-table
          class="table"
          height="100%"
          stripe
          tooltip-effect="dark"
          border
          :data="filteredData"
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            type="selection"
            width="55"
          />
          <el-table-column
            prop="label"
            label="属性名称"
            show-tooltip-when-overflow
          />
          <el-table-column
            prop="remark"
            label="备注"
            show-tooltip-when-overflow
          />
          <el-table-column
            prop="default_value"
            label="默认值"
            show-tooltip-when-overflow
          />
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import resolveResponse from '@/util/response';
import { metaMissing } from '@dwarfeng/familyhelper-ui-component-api/src/api/notify/metaIndicator';

export default {
  name: 'ChildForMetaMissingSubPanel',
  props: {
    notifySettingId: {
      type: String,
      default: '',
    },
    topicId: {
      type: String,
      default: '',
    },
    accountId: {
      type: String,
      default: '',
    },
  },
  computed: {
    selectionInvalid() {
      return this.notifySettingId === '' || this.topicId === '' || this.accountId === '';
    },
    filteredData() {
      if (this.labelFilterBar.value === '') {
        return this.table.data;
      }
      return this.table.data.filter((data) => data.label.includes(this.labelFilterBar.value));
    },
  },
  watch: {
    notifySettingId() {
      this.handleSearch();
    },
    topicId() {
      this.handleSearch();
    },
    accountId() {
      this.handleSearch();
    },
  },
  data() {
    return {
      loading: false,
      table: {
        data: [],
      },
      labelFilterBar: {
        value: '',
      },
    };
  },
  methods: {
    handleSearch() {
      if (this.selectionInvalid) {
        this.clearContent();
      } else {
        this.lookupMetaMissing();
      }
    },
    clearContent() {
      this.updateTableView([]);
    },
    lookupMetaMissing() {
      this.loading = true;
      resolveResponse(metaMissing(this.notifySettingId, this.topicId, this.accountId))
        .then(this.updateTableView)
        .catch(() => {
        })
        .finally(() => {
          this.loading = false;
        });
    },
    updateTableView(res) {
      this.table.data = res;
    },
    handleSelectionChange(selection) {
      this.$emit('onSelectionChanged', selection);
    },
  },
  mounted() {
    this.handleSearch();
  },
};
</script>

<style scoped>
.child-for-meta-missing-sub-panel-container {
  height: 100%;
  width: 100%;
}

.placeholder {
  width: 100%;
  height: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 28px;
  font-weight: bold;
  color: #BFBFBF;
  user-select: none;
}

.select-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.select-container .table {
  height: 0;
  flex-grow: 1;
  margin-top: 5px;
}

.valid-container {
  width: 100%;
  height: 100%;
}
</style>

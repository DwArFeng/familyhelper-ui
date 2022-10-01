<template>
  <div class="item-overlook-panel-container" v-loading="loading">
    <header-layout-panel>
      <template v-slot:header>
        <div class="header">
          <el-button
            type="primary"
            :disabled="readOnly"
            @click="handleItemEdit"
          >
            编辑属性
          </el-button>
          <el-button type="success" @click="updateView">刷新数据</el-button>
        </div>
      </template>
      <template v-slot:default>
        <div class="overlook-wrapper">
          <title-layout-panel class="details" title="属性" bordered>
            <el-form
              class="property-form"
              label-position="left"
              label-width="80px"
              inline
              :model="form.entity"
            >
              <el-form-item label="名称" style="width: 33%">
                {{ form.entity.name }}
              </el-form-item>
              <el-form-item label="备注" style="width: 100%">
                {{ form.entity.remark }}
              </el-form-item>
              <el-form-item label="创建时间" style="width: 33%">
                {{ form.entity.created_date|timestampFilter }}
              </el-form-item>
              <el-form-item label="编辑时间" style="width: 33%">
                {{ form.entity.modified_date|timestampFilter }}
              </el-form-item>
              <el-form-item label="查看时间" style="width: 33%">
                {{ form.entity.inspected_date|timestampFilter }}
              </el-form-item>
            </el-form>
          </title-layout-panel>
        </div>
      </template>
    </header-layout-panel>
  </div>
</template>

<script>
import HeaderLayoutPanel from '@/components/layout/HeaderLayoutPanel.vue';
import TitleLayoutPanel from '@/components/layout/TitleLayoutPanel.vue';

import { inspectDisp as inspectItem } from '@/api/note/noteItem';
import resolveResponse from '@/util/response';
import { formatTimestamp } from '@/util/timestamp';

export default {
  name: 'ItemOverlookPanel',
  components: { TitleLayoutPanel, HeaderLayoutPanel },
  props: {
    itemId: {
      type: String,
      default: '',
    },
    readOnly: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    itemId() {
      this.updateView();
    },
  },
  filters: {
    timestampFilter(value) {
      if (value === '') {
        return '';
      }
      return formatTimestamp(value);
    },
  },
  data() {
    return {
      form: {
        entity: {
          name: '',
          remark: '',
          created_date: '',
          modified_date: '',
          inspected_date: '',
        },
      },
      loading: false,
    };
  },
  methods: {
    updateView() {
      if (this.itemId === '') {
        return;
      }
      this.inspectItem();
    },
    inspectItem() {
      this.loading = true;
      resolveResponse(inspectItem(this.itemId))
        .then(this.updateFormView)
        .catch(() => {
        })
        .finally(() => {
          this.loading = false;
        });
    },
    updateFormView(res) {
      this.$set(this.form, 'entity', res);
      return Promise.resolve();
    },
    handleItemEdit() {
      this.$emit('onItemEdit');
    },
  },
  mounted() {
    this.updateView();
  },
};
</script>

<style scoped>
.item-overlook-panel-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header {
  width: 100%;
  display: flex;
  flex-direction: row;
}

.overlook-wrapper {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.overlook-wrapper .details:not(:first-child) {
  margin-top: 5px;
}

.overlook-wrapper .details:last-child {
  height: 0;
  flex-grow: 1;
}

.property-form {
  display: flex;
  flex-wrap: wrap;
}

.property-form >>> label {
  width: 240px;
  color: #99a9bf;
  line-height: 30px;
}

/*noinspection CssUnusedSymbol*/
.property-form >>> .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 51%;
  white-space: nowrap;
  display: flex;
  flex-direction: row;
}

/*noinspection CssUnusedSymbol*/
.property-form >>> .el-form-item__content {
  width: 0;
  margin-right: 5px;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 30px;
}
</style>

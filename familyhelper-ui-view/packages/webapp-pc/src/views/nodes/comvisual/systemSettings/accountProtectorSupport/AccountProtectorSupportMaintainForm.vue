<template>
  <div class="account-protector-support-maintain-form">
    <div class="form-row">
      <label class="form-label">类型</label>
      <input class="form-input" type="text" readonly :value="item.key_string_id" />
    </div>
    <div class="form-row">
      <label class="form-label">标签</label>
      <input class="form-input" type="text" readonly :value="item.label" />
    </div>
    <div class="form-row">
      <label class="form-label">描述</label>
      <input class="form-input" type="text" readonly :value="item.description" />
    </div>
    <div class="form-row form-row--grow">
      <label class="form-label">示例参数</label>
      <textarea class="form-textarea" readonly :value="item.example_param" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { type AccountProtectorSupportMaintainDialogItem } from './accountProtectorSupportMaintainTypes.ts'

defineOptions({
  name: 'AccountProtectorSupportMaintainForm',
})

// region Props 定义

type Props = {
  item: AccountProtectorSupportMaintainDialogItem
}

defineProps<Props>()

// endregion
</script>

<style scoped>
.account-protector-support-maintain-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 420px;
}

.form-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.form-row--grow .form-textarea {
  height: 300px;
  resize: none;
}

.form-label {
  width: var(--maintain-label-width, 80px);
  flex-shrink: 0;
  font-size: 14px;
  color: #606266;
  line-height: 32px;
}

.form-input,
.form-textarea {
  flex: 1 1 auto;
  min-width: 0;
  padding: 6px 10px;
  font-size: 14px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  box-sizing: border-box;
  color: #606266;
  background: #f5f7fa;
}

.form-textarea {
  font-family: inherit;
  line-height: 1.5;
}
</style>

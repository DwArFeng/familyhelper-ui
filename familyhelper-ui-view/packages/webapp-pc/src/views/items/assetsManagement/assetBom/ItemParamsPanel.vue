<template>
  <div class="item-params-panel-container">
    <div class="placeholder" v-if="itemId===''">请选择项目</div>
    <div v-else class="main-container">
      <coming-soon/>
    </div>
  </div>
</template>

<script>
import ComingSoon from '@/components/comingSoon/ComingSoon.vue';

export default {
  name: 'ItemParamsPanel',
  components: { ComingSoon },
  props: {
    itemId: {
      type: String,
      default: '',
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    mode: {
      type: String,
      default: 'DEFAULT',
      validator(value) {
        return ['DEFAULT', 'FLOATY'].indexOf(value) !== -1;
      },
    },
  },
};
</script>

<style scoped>
.item-params-panel-container {
  height: 100%;
  width: 100%;
  background: #FFFFFF;
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

.main-container {
  width: 100%;
  height: 100%;
}
</style>

<template>
  <div class="nav-button-container" @click="handleClick">
    <i class="iconfont icon-button">
      {{ icon }}
    </i>
  </div>
</template>

<script>
export default {
  name: 'IconButton',
  props: {
    icon: {
      type: String,
      default: '',
    },
  },
  methods: {
    handleClick() {
      this.$emit('click');
    },
  },
};
</script>

<style scoped>
.nav-button-container {
  cursor: pointer;
  outline: none;
  user-select: none;
  display: flex;
  align-items: center;
  padding: 0 4px;
}

.nav-button-container:hover{
  background: rgba(0, 0, 0, .025)
}

.icon-button{
  font-size: 16px;
}
</style>

<template>
  <div class="overlay-icon-button-container" @click="handleClick">
    <i class="icon-button" :class="iconClass"/>
  </div>
</template>

<script>
export default {
  name: 'OverlayIconButton',
  props: {
    iconClass: {
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
.overlay-icon-button-container {
  cursor: pointer;
  outline: none;
  user-select: none;
  display: flex;
  align-items: center;
  padding: 4px;
  color: black;
}

.overlay-icon-button-container:hover{
  background: rgba(0, 0, 0, .2)
}

.icon-button{
  font-size: 16px;
}
</style>

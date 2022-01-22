<template>
<div class="photo-sub-editor-container">
  <el-image class="image" fit="contain" :src="url" :preview-src-list="[url]"/>
</div>
</template>

<script>
export default {
  name: 'PhotoSubEditor',
  props: {
    url: {
      type: String,
      default: '',
    },
  },
};
</script>

<style scoped>
.photo-sub-editor-container{
  width: 100%;
  height: 100%;
}

.image{
  width: 100%;
  height: 100%;
}
</style>

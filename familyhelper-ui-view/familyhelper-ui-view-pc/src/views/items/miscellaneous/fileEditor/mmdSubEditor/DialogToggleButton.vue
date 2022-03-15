<template>
  <div class="dialog-toggle-button-container" @click="handleClick">
    <i class="iconfont" :class="value === values[0]? 'toggle-off':'toggle-on'">{{ icon }}</i>
  </div>
</template>

<script>
export default {
  name: 'DialogToggleButton',
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    icon: {
      type: String,
      default: '',
    },
    value: {
      type: String,
      required: true,
    },
    values: {
      type: Array,
      required: true,
    },
  },
  methods: {
    handleClick() {
      if (this.value === this.values[0]) {
        this.$emit('change', this.values[1]);
      } else {
        this.$emit('change', this.values[0]);
      }
    },
  },
};
</script>

<style scoped>
/*noinspection CssUnusedSymbol*/
.iconfont.toggle-on{
  background: grey;
}

/*noinspection CssUnusedSymbol*/
.iconfont.toggle-off{
  background: white;
}
</style>

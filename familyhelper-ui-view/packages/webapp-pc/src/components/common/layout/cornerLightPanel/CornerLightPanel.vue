<template>
  <div class="corner-light-panel-container">
    <div class="main-container">
      <slot name="default" />
    </div>
    <transition-group name="corner-light-animation" appear>
      <div
        class="corner-light north-west"
        v-if="showNorthWest"
        :class="cascading"
        :style="lightStyle"
        :key="1"
      />
      <div
        class="corner-light north-east"
        v-if="showNorthEast"
        :class="cascading"
        :style="lightStyle"
        :key="1"
      />
      <div
        class="corner-light south-west"
        v-if="showSouthWest"
        :class="cascading"
        :style="lightStyle"
        :key="1"
      />
      <div
        class="corner-light south-east"
        v-if="showSouthEast"
        :class="cascading"
        :style="lightStyle"
        :key="1"
      />
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({
  name: 'CornerLightPanel',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  showNorthWest?: boolean
  showNorthEast?: boolean
  showSouthWest?: boolean
  showSouthEast?: boolean
  lightBevelEdge?: string | number
  lightColor?: string
  lightOnTop?: boolean
  animateDuration?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  showNorthWest: false,
  showNorthEast: false,
  showSouthWest: false,
  showSouthEast: false,
  lightBevelEdge: 100,
  lightColor: 'rgba(191,191,191)',
  lightOnTop: false,
  animateDuration: 0.2,
})

// -----------------------------------------------------------样式计算-----------------------------------------------------------
const lightStyle = computed(() => {
  let finalLightBevelEdge: string | number
  if (Number.isFinite(props.lightBevelEdge)) {
    finalLightBevelEdge = `${props.lightBevelEdge}px`
  } else {
    finalLightBevelEdge = props.lightBevelEdge
  }
  let finalAnimateDuration: string | number
  if (Number.isFinite(props.animateDuration)) {
    finalAnimateDuration = `${props.animateDuration}s`
  } else {
    finalAnimateDuration = props.animateDuration
  }
  return {
    width: finalLightBevelEdge,
    height: finalLightBevelEdge,
    backgroundColor: props.lightColor,
    transition: `all ${finalAnimateDuration}`,
  }
})

const cascading = computed(() => {
  return props.lightOnTop ? 'top' : 'bottom'
})
</script>

<style scoped>
.corner-light-panel-container {
  position: relative;
  overflow: hidden;
}

.main-container {
  position: absolute;
  height: 100%;
  width: 100%;
  z-index: 1000;
}

.corner-light {
  position: absolute;
}

/*noinspection CssUnusedSymbol*/
.corner-light.top {
  z-index: 1100;
}

/*noinspection CssUnusedSymbol*/
.corner-light.bottom {
  z-index: 900;
}

.corner-light.north-west {
  transform: translateX(-50%) translateY(-50%) rotate(45deg);
}

.corner-light.north-east {
  right: 0;
  transform: translateX(50%) translateY(-50%) rotate(45deg);
}

.corner-light.south-west {
  bottom: 0;
  transform: translateX(-50%) translateY(50%) rotate(45deg);
}

.corner-light.south-east {
  right: 0;
  bottom: 0;
  transform: translateX(50%) translateY(50%) rotate(45deg);
}

/*noinspection CssUnusedSymbol*/
.corner-light-animation-enter,
.corner-light-animation-leave-to {
  opacity: 0;
}

/*noinspection CssUnusedSymbol*/
.corner-light-animation-enter-to,
.corner-light-animation-leave {
  opacity: 1;
}
</style>

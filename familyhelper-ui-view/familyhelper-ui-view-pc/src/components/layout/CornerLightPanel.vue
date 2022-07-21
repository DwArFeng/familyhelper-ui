<template>
  <div class="corner-light-panel-container">
    <div class="main-container">
      <slot/>
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

<script>
export default {
  name: 'CornerLightPanel',
  props: {
    showNorthWest: {
      type: Boolean,
      default: false,
    },
    showNorthEast: {
      type: Boolean,
      default: false,
    },
    showSouthWest: {
      type: Boolean,
      default: false,
    },
    showSouthEast: {
      type: Boolean,
      default: false,
    },
    lightBevelEdge: {
      type: [String, Number],
      default: 100,
    },
    lightColor: {
      type: String,
      default: 'rgba(191,191,191)',
    },
    lightOnTop: {
      type: Boolean,
      default: false,
    },
    animateDuration: {
      type: [String, Number],
      default: 0.2,
    },
  },
  computed: {
    lightStyle() {
      let finalLightBevelEdge = '';
      if (Number.isFinite(this.lightBevelEdge)) {
        finalLightBevelEdge = `${this.lightBevelEdge}px`;
      } else {
        finalLightBevelEdge = this.lightBevelEdge;
      }
      let finalAnimateDuration = '';
      if (Number.isFinite(this.animateDuration)) {
        finalAnimateDuration = `${this.animateDuration}s`;
      } else {
        finalAnimateDuration = this.animateDuration;
      }
      return {
        width: finalLightBevelEdge,
        height: finalLightBevelEdge,
        backgroundColor: this.lightColor,
        transition: `all ${finalAnimateDuration}`,
      };
    },
    cascading() {
      return this.lightOnTop ? 'top' : 'bottom';
    },
  },
};
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
.corner-light-animation-enter, .corner-light-animation-leave-to{
  opacity: 0;
}

/*noinspection CssUnusedSymbol*/
.corner-light-animation-enter-to, .corner-light-animation-leave{
  opacity: 1;
}
</style>

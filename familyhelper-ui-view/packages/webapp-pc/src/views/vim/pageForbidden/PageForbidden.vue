<script lang="ts">
import vim from '@/vim'

import { type VisualizerStore } from '@/store/modules/visualizer.ts'

import { h } from 'vue'

import VimMask from '@/components/vim/vimMask/VimMask.vue'

import { ready } from '@/util/store.ts'

export default {
  name: 'PageForbidden',
  setup() {
    return () => {
      if (!ready.value) {
        return h(VimMask)
      }
      const visualizerStore = vim
        .ctx()
        .store()
        .vueStore<'visualizer', VisualizerStore>('visualizer')
      return h(visualizerStore.visualizer.render('pageForbidden', h))
    }
  },
}
</script>

<style scoped></style>

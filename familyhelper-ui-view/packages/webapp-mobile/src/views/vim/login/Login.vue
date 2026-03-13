<script lang="ts">
import vim from '@/vim'

import { type VisualizerStore } from '@/store/modules/visualizer.ts'

import { h } from 'vue'

import VimMask from '@/components/vim/vimMask/VimMask.vue'

import { getVisualizer } from '@/util/visualizer.ts'

export default {
  name: 'LoginComponent',
  setup() {
    const visualizerStore = vim.ctx().store().vueStore<'visualizer', VisualizerStore>('visualizer')
    return () => {
      if (!visualizerStore.ready) {
        return h(VimMask)
      }
      return h(getVisualizer().render('login', h))
    }
  },
}
</script>

<style scoped></style>

<script lang="ts">
import { h } from 'vue'

import VimMask from '@/components/vim/vimMask/VimMask.vue'

import { ready } from '@/util/store.ts'
import { getVisualizer } from '@/util/visualizer.ts'

export default {
  name: 'LayoutComponent',
  setup() {
    return () => {
      if (!ready.value) {
        return h(VimMask)
      }
      return h(getVisualizer().render('layout', h))
    }
  },
}
</script>

<style scoped></style>

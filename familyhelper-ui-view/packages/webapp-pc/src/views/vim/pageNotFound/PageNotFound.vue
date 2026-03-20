<script lang="ts">
import { h } from 'vue'

import VimMask from '@/components/vim/vimMask/VimMask.vue'

import { ready } from '@/util/store.ts'
import { getVisualizer } from '@/util/visualizer.ts'

export default {
  name: 'PageNotFound',
  setup() {
    return () => {
      if (!ready.value) {
        return h(VimMask)
      }
      return h(getVisualizer().render('pageNotFound', h))
    }
  },
}
</script>

<style scoped></style>

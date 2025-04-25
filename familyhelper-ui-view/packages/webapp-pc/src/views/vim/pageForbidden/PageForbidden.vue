<script lang="ts">
import { h } from 'vue'
import vim from '@/vim'

export default {
  name: 'PageForbidden',
  setup() {
    return () => h(vim.ctx().library().defaultVisualizer().render('pageForbidden', h))
  },
}
</script>

<style scoped></style>

<script lang="ts">
import { h } from 'vue'
import vim from '@/vim'

export default {
  name: 'LayoutComponent',
  setup() {
    return () => h(vim.ctx().library().defaultVisualizer().render('layout', h))
  },
}
</script>

<style scoped></style>

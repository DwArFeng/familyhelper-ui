<script lang="ts">
import { h } from 'vue'
import vim from '@/vim'

export default {
  name: 'PageError',
  setup() {
    return () => h(vim.ctx().library().defaultVisualizer().render('pageError', h))
  },
}
</script>

<style scoped></style>

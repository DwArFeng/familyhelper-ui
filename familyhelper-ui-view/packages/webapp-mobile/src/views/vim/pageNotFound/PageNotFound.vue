<script lang="ts">
import { h } from 'vue'
import vim from '@/vim'

export default {
  name: 'PageNotFound',
  setup() {
    return () => h(vim.ctx().library().defaultVisualizer().render('pageNotFound', h))
  },
}
</script>

<style scoped></style>

<script lang="ts">
import { h } from 'vue'
import vim from '@/vim'

export default {
  name: 'LoginComponent',
  setup() {
    return () => h(vim.ctx().library().defaultVisualizer().render('login', h))
  },
}
</script>

<style scoped></style>

<script>
import { renderHandler } from '@/elements';

export default {
  name: 'VimLayout',
  functional: true,
  render(h) {
    const customClass = 'vim-layout';
    return [renderHandler().handleRenderLayout(h, customClass)];
  },
};
</script>

<style scoped>

</style>

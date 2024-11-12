<script>
import { renderHandler } from '@/elements';

export default {
  name: 'VimLabel',
  functional: true,
  props: {
    type: {
      type: String,
      required: true,
    },
    content: {
      type: [Object, Number, String],
      required: true,
    },
  },
  render(h, ctx) {
    const customClass = 'vim-label';
    const { type, content } = ctx.props;
    return [renderHandler(type).handleRenderLabel(h, content, customClass)];
  },
};
</script>

<style scoped>

</style>

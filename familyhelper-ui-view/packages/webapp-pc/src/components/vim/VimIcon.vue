<script>
import { renderHandler } from '@/elements';

export default {
  name: 'VimIcon',
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
    const customClass = 'vim-icon';
    const { type, content } = ctx.props;
    return [renderHandler(type).handleRenderIcon(h, content, customClass)];
  },
};
</script>

<style scoped>

</style>

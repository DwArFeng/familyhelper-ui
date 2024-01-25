<template>
  <div class="memo-editor-container" v-loading="loading">
    <div v-if="loading" class="placeholder">正在加载，请稍后...</div>
    <!--suppress JSUnresolvedReference -->
    <div v-else-if="memo.userId!==me" class="placeholder">此条备忘录不是您的备忘录，您无权访问</div>
    <div v-else class="main-container">
      <memo-edit-panel
        :memo-id="memo.memoId"
        :readonly="memo.status===1"
        :upsc="memoEditPanel.upsc"
      />
    </div>
  </div>
</template>

import { mapGetters } from 'vuex';

<script>
import { mapGetters } from 'vuex';

import { inspect } from '@/api/project/memo';
import resolveResponse from '@/util/response';
import MemoEditPanel from '@/views/items/projectHelper/memo/MemoEditPanel.vue';

// noinspection JSAnnotator
export default {
  name: 'MemoEditor',
  components: { MemoEditPanel },
  computed: {
    ...mapGetters('lnp', ['me']),
  },
  watch: {
    $route(val) {
      if (val.name !== 'projectHelper.memoEditor') {
        return;
      }

      const memoId = this.$route.query['memo-id'];
      let inspectFlag = false;
      if (this.query.memoId !== memoId) {
        this.query.memoId = memoId;
        inspectFlag = true;
      }
      if (inspectFlag) {
        this.handleInspect();
      }
    },
  },
  data() {
    return {
      loading: false,
      query: {
        memoId: '',
      },
      memo: {
        memoId: '',
        userId: '',
        status: 0,
      },
      memoEditPanel: {
        upsc: 'ui_preference.pc.project_helper.memo_editor.memo_edit_panel',
      },
    };
  },
  methods: {
    handleInspect() {
      this.loading = true;
      resolveResponse(inspect(this.query.memoId))
        .then((res) => {
          this.memo.memoId = res.key.long_id;
          this.memo.userId = res.user_key.string_id;
          this.memo.status = res.status;
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
  mounted() {
    this.query.memoId = this.$route.query['memo-id'];
    this.handleInspect();
  },
};
</script>

<style scoped>
.memo-editor-container {
  height: 100%;
  width: 100%;
}

.placeholder {
  width: 100%;
  height: 100%;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
  color: #BFBFBF;
  user-select: none;
}

.main-container {
  width: 100%;
  height: 100%;
}
</style>

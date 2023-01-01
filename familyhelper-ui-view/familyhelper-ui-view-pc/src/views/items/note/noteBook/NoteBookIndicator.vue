<template>
  <div class="note-book-indicator-container">
    <el-input
      v-loading="loading"
      class="indicator"
      v-model="displayValue"
      readonly
    >
      <span slot="prepend">当前笔记本</span>
      <el-button-group class="button-group" slot="append">
        <el-button
          class="button"
          icon="el-icon-search"
          @click="handleShowDialog"
        />
        <el-button
          class="button"
          icon="el-icon-refresh"
          @click="fetchSettingrepo"
        />
      </el-button-group>
    </el-input>
    <note-book-select-dialog
      :mode="mode"
      :visible.sync="dialogVisible"
      @onConfirm="handleConfirmed"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import NoteBookSelectDialog
from '@/views/items/note/noteBook/NoteBookSelectDialog.vue';

import { operateInspect, operatePut } from '@/api/settingrepo/settingNode';
import { exists, inspectDisp } from '@/api/note/noteBook';

import resolveResponse from '@/util/response';
import { currentTimestamp, formatTimestamp } from '@/util/timestamp';

const SETTINGREPO_CATEGORY_ID = 'note.default_note_book';

// noinspection JSAnnotator
export default {
  name: 'NoteBookIndicator',
  components: { NoteBookSelectDialog },
  props: {
    mode: {
      type: String,
      validator(value) {
        return [
          'NOTE_MANAGEMENT', 'DEFAULT',
        ].indexOf(value) !== -1;
      },
      default: 'DEFAULT',
    },
  },
  computed: {
    noteBookId() {
      if (this.noteBook === null) {
        return '';
      }
      return this.noteBook.key.long_id;
    },
    displayValue() {
      if (this.noteBook === null) {
        return '（未选择笔记本）';
      }
      return this.noteBook.name;
    },
    ...mapGetters('lnp', ['me']),
  },
  data() {
    return {
      noteBook: null,
      dialogVisible: false,
      loading: false,
    };
  },
  methods: {
    handleShowDialog() {
      this.dialogVisible = true;
    },
    handleConfirmed(noteBook, setDefault) {
      this.noteBook = noteBook;
      this.$emit('change', noteBook);
      if (!setDefault) {
        return;
      }
      resolveResponse(operatePut(
        SETTINGREPO_CATEGORY_ID,
        [this.me],
        this.noteBookId,
        `更新时间: ${formatTimestamp(currentTimestamp())}`,
      ))
        .catch(() => {
        });
    },
    fetchSettingrepo() {
      this.loading = true;
      resolveResponse(operateInspect(SETTINGREPO_CATEGORY_ID, [this.me]))
        .then((res) => {
          if (res === null) {
            this.noteBook = null;
            return Promise.reject();
          }
          return Promise.resolve(res.value);
        })
        .then((res) => resolveResponse(exists(res))
          .then((existsFlag) => {
            if (existsFlag) {
              return Promise.resolve(res);
            }
            this.noteBook = null;
            return Promise.reject();
          }))
        .then((res) => resolveResponse(inspectDisp(res)))
        .then((res) => {
          this.noteBook = res;
        })
        .catch(() => {
        })
        .finally(() => {
          this.loading = false;
          this.$emit('change', this.noteBook);
        });
    },
  },
  mounted() {
    this.fetchSettingrepo();
  },
};
</script>

<style scoped>
.indicator {
  width: 420px;
}

/*noinspection CssUnusedSymbol*/
.indicator >>> .el-input__inner {
  text-align: center;
}

/*noinspection CssUnusedSymbol*/
.indicator >>> .el-input-group__prepend {
  padding: 0 10px;
}

.button-group{
  display: flex;
}

.button-group .button{
  padding-left: 10px;
  padding-right: 10px;
}
</style>

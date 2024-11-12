<template>
  <div class="my-avatar-container">
    <border-layout-panel
      class="border-layout-panel"
      :west-visible="true"
    >
      <div class="container-wrapper" slot="west">
        <span class="wrapper-title">头像确认</span>
        <div class="west-content-container">
          <avatar-panel
            shape="square"
            render-mode="BY_CONTENT"
            :size="180"
            :placeholder-font-size="32"
            :display-name="oldAvatar.displayName"
            :avatar-url="oldAvatar.avatarUrl"
          />
          <span class="avatar-title">原头像</span>
          <avatar-panel
            shape="square"
            render-mode="BY_CONTENT"
            :size="180"
            :placeholder-font-size="32"
            :display-name="neoAvatar.displayName"
            :avatar-url="neoAvatar.avatarUrl"
          />
          <span class="avatar-title">新头像</span>
          <el-button type="success" @click="handleAvatarUpload">确认并上传</el-button>
        </div>
      </div>
      <div class="container-wrapper">
        <span class="wrapper-title">头像选择</span>
        <coming-soon class="coming-soon"/>
        <div class="upload-title">
          <span>没有您喜欢的头像？</span>
          <el-link type="primary" @click="handleAvatarEdit">点此选择并编辑</el-link>
        </div>
      </div>
    </border-layout-panel>
    <image-upload-edit-dialog
      title="头像上传"
      :visible.sync="avatarEditDialog.visible"
      :output-size="1"
      :cropper-height="200"
      :cropper-width="200"
      :crop-box-height="180"
      :crop-box-width="180"
      :enlarge="1"
      @onConfirmed="handleAvatarUploadConfirmed"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import BorderLayoutPanel from '@/components/layout/BorderLayoutPanel.vue';
import AvatarPanel from '@/components/avatar/AvatarPanel.vue';
import ComingSoon from '@/components/comingSoon/ComingSoon.vue';
import ImageUploadEditDialog from '@/components/image/ImageUploadEditDialog.vue';

import { inspectDisp } from '@dwarfeng/familyhelper-ui-component-api/src/api/system/account';
import {
  exists, download, upload, inspect,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/clannad/avatar';
import resolveResponse from '@/util/response';

// noinspection JSAnnotator
export default {
  name: 'MyAvatar',
  components: {
    ComingSoon, AvatarPanel, BorderLayoutPanel, ImageUploadEditDialog,
  },
  computed: {
    ...mapGetters('lnp', ['me']),
  },
  data() {
    return {
      avatarEditDialog: {
        visible: false,
      },
      oldAvatar: {
        displayName: '',
        avatarUrl: '',
      },
      neoAvatar: {
        displayName: '',
        avatarUrl: '',
        blobToUpdate: null,
        fileName: '',
      },
    };
  },
  methods: {
    loadOldAvatar() {
      resolveResponse(inspectDisp(this.me))
        .then((res) => {
          this.oldAvatar.displayName = res.display_name;
        })
        .then(() => resolveResponse(exists(this.me)))
        .then((res) => {
          if (res) {
            // noinspection JSCheckFunctionSignatures
            return download(this.me)
              .then((blob) => window.URL.createObjectURL(blob));
          }
          return Promise.resolve('');
        })
        .then((res) => {
          this.oldAvatar.avatarUrl = res;
        })
        .catch(() => {
        });
    },
    loadNeoAvatar() {
      resolveResponse(inspectDisp(this.me))
        .then((res) => {
          this.neoAvatar.displayName = res.display_name;
        })
        .then(() => resolveResponse(exists(this.me)))
        .then((res) => {
          if (res) {
            return resolveResponse(inspect(this.me))
              .then((avatarInfo) => {
                // noinspection JSUnresolvedVariable
                this.neoAvatar.fileName = avatarInfo.origin_name;
              })
              .then(() => download(this.me))
              .then((blob) => {
                this.neoAvatar.blobToUpdate = blob;
                // noinspection JSCheckFunctionSignatures
                return Promise.resolve(window.URL.createObjectURL(blob));
              });
          }
          return Promise.resolve('');
        })
        .then((res) => {
          this.neoAvatar.avatarUrl = res;
        })
        .catch(() => {
        });
    },
    handleAvatarEdit() {
      this.avatarEditDialog.visible = true;
    },
    handleAvatarUploadConfirmed(fileName, blob) {
      // 如果 neoAvatar 有旧连接的话，则清除。
      const oldUrl = this.neoAvatar.avatarUrl;
      if (oldUrl !== '') {
        window.URL.revokeObjectURL(oldUrl);
      }
      // Blob 赋值。
      this.neoAvatar.blobToUpdate = blob;
      // 文件名称赋值。
      this.neoAvatar.fileName = fileName;
      // 创建新连接。
      this.neoAvatar.avatarUrl = window.URL.createObjectURL(blob);
    },
    handleAvatarUpload() {
      const formData = new FormData();
      formData.append('file', this.neoAvatar.blobToUpdate, this.neoAvatar.fileName);
      resolveResponse(upload(this.me, formData))
        .then(() => {
          this.$message({
            showClose: true,
            message: '头像更新成功，2秒后刷新界面',
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          setTimeout(() => {
            // 刷新或登出。
            window.location.reload();
          }, 2000);
        })
        .catch(() => {
        });
    },
  },
  mounted() {
    this.loadOldAvatar();
    this.loadNeoAvatar();
  },
  destroyed() {
    let url;
    url = this.oldAvatar.avatarUrl;
    if (url !== '') {
      window.URL.revokeObjectURL(url);
    }
    url = this.neoAvatar.avatarUrl;
    if (url !== '') {
      window.URL.revokeObjectURL(url);
    }
  },
};
</script>

<style scoped>
.my-avatar-container {
  height: 100%;
  width: 100%;
}

.container-wrapper {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.west-content-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.avatar-title {
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei",
  "微软雅黑", Arial, sans-serif;
  font-size: 14px;
  margin-bottom: 10px;
}

.wrapper-title {
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei",
  "微软雅黑", Arial, sans-serif;
  font-size: 14px;
  text-align: center;
}

.coming-soon {
  height: 0;
  flex-grow: 1;
}

.upload-title {
  height: 19px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei",
  "微软雅黑", Arial, sans-serif;
  font-size: 14px;
  text-align: center;
}

/*noinspection CssUnusedSymbol*/
.avatar-edit-dialog >>> .el-dialog__body {
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}
</style>

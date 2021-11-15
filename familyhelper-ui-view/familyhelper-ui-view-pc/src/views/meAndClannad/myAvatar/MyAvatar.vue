<template>
  <div class="my-avatar-container">
    <content-panel
      class="content-panel"
      :breadcrumb="['我与家庭', '个人头像管理']"
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
    </content-panel>
    <el-dialog
      class="avatar-edit-dialog"
      tabindex="0"
      append-to-body
      title="头像选择编辑"
      :close-on-click-modal="false"
      :visible.sync="avatarEditDialog.visible"
    >
      <input
        type="file"
        id="fileSelector"
        hidden
        accept="image/png, image/jpeg, image/gif, image/jpg"
        @change="handleImageSelected($event)"
      />
      <div class="avatar-editor-wrapper">
        <el-button
          class="avatar-editor-header"
          type="success"
          @click="handleFileSelect"
        >
          选择文件
        </el-button>
        <div
          class="avatar-editor"
          id="avatar-editor"
          tabindex="0"
          @keydown="handleHotKeyDown($event)"
        >
          <div class="cropper-with-title">
            <vue-cropper
              class="cropper"
              ref="cropper"
              :img="avatarEditDialog.cropper.img"
              :outputSize="avatarEditDialog.cropper.outputSize"
              :outputType="avatarEditDialog.cropper.outputType"
              :info="avatarEditDialog.cropper.info"
              :canScale="avatarEditDialog.cropper.canScale"
              :autoCrop="avatarEditDialog.cropper.autoCrop"
              :autoCropWidth="avatarEditDialog.cropper.autoCropWidth"
              :autoCropHeight="avatarEditDialog.cropper.autoCropHeight"
              :fixed="avatarEditDialog.cropper.fixed"
              :fixedNumber="avatarEditDialog.cropper.fixedNumber"
              :full="avatarEditDialog.cropper.full"
              :fixedBox="avatarEditDialog.cropper.fixedBox"
              :canMove="avatarEditDialog.cropper.canMove"
              :canMoveBox="avatarEditDialog.cropper.canMoveBox"
              :original="avatarEditDialog.cropper.original"
              :centerBox="avatarEditDialog.cropper.centerBox"
              :height="avatarEditDialog.cropper.height"
              :infoTrue="avatarEditDialog.cropper.infoTrue"
              :maxImgSize="avatarEditDialog.cropper.maxImgSize"
              :enlarge="avatarEditDialog.cropper.enlarge"
              :mode="avatarEditDialog.cropper.mode"
            />
            <span class="cropper-title">{{ avatarEditDialog.file.fileName }}</span>
          </div>
          <div class="avatar-editor-button-column">
            <el-button
              class="avatar-editor-button"
              size="mini"
              type="info"
              :disabled="avatarEditDialog.cropper.img === ''"
              @click="handleAvatarZoomIn"
            >
              <span class="iconfont avatar-editor-button-icon">&#xffe8;</span>
            </el-button>
            <el-button
              class="avatar-editor-button"
              size="mini"
              type="info"
              :disabled="avatarEditDialog.cropper.img === ''"
              @click="handleAvatarZoomOut"
            >
              <span class="iconfont avatar-editor-button-icon">&#xffe9;</span>
            </el-button>
            <el-button
              class="avatar-editor-button"
              size="mini"
              type="info"
              :disabled="avatarEditDialog.cropper.img === ''"
              @click="handleAvatarRotateRight"
            >
              <span class="iconfont avatar-editor-button-icon">&#xffeb;</span>
            </el-button>
            <el-button
              class="avatar-editor-button"
              size="mini"
              type="info"
              :disabled="avatarEditDialog.cropper.img === ''"
              @click="handleAvatarRotateLeft"
            >
              <span class="iconfont avatar-editor-button-icon">&#xffea;</span>
            </el-button>
          </div>
        </div>
        <div class="avatar-editor-footer">
          <el-button
            type="primary"
            :disabled="avatarEditDialog.cropper.img===''"
            @click="handleAvatarEditConfirmed"
          >
            编辑完成
          </el-button>
          <el-button type="danger" @click="handleAvatarEditCanceled">取消</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import ContentPanel from '@/components/layout/LayoutPanel.vue';
import AvatarPanel from '@/components/layout/AvatarPanel.vue';
import ComingSoon from '@/components/layout/ComingSoon.vue';

import { inspectDisp } from '@/api/system/account';
import {
  exists, download, upload, inspect,
} from '@/api/clannad/avatar';
import resolveResponse from '@/util/response';

export default {
  name: 'MyAvatar',
  components: { ComingSoon, AvatarPanel, ContentPanel },
  watch: {},
  data() {
    return {
      me: '',
      avatarEditDialog: {
        visible: false,
        cropper: {
          img: '', // 裁剪图片的地址
          outputSize: 1, // 裁剪生成图片的质量(可选0.1 - 1)
          outputType: 'jpeg', // 裁剪生成图片的格式（jpeg || png || webp）
          info: true, // 图片大小信息
          canScale: true, // 图片是否允许滚轮缩放
          autoCrop: true, // 是否默认生成截图框
          autoCropWidth: 180, // 默认生成截图框宽度
          autoCropHeight: 180, // 默认生成截图框高度
          fixed: true, // 是否开启截图框宽高固定比例
          fixedNumber: [1, 1], // 截图框的宽高比例
          full: false, // false按原比例裁切图片，不失真
          fixedBox: true, // 固定截图框大小，不允许改变
          canMove: true, // 上传图片是否可以移动
          canMoveBox: false, // 截图框能否拖动
          original: false, // 上传图片按照原始比例渲染
          centerBox: false, // 截图框是否被限制在图片里面
          height: true, // 是否按照设备的dpr 输出等比例图片
          infoTrue: true, // true为展示真实输出图片宽高，false展示看到的截图框宽高
          maxImgSize: 3000, // 限制图片最大宽度和高度
          enlarge: 1, // 图片根据截图框输出比例倍数
          mode: '230px 150px', // 图片默认渲染方式
        },
        file: {
          fileName: '',
        },
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
    handleWhoAmI() {
      // noinspection JSUnresolvedVariable
      const loginInfo = this.$ls.get('loginInfo');
      if (loginInfo === null) {
        this.me = '';
      } else {
        // noinspection JSUnresolvedVariable
        this.me = loginInfo.account_id;
      }
    },
    loadOldAvatar() {
      // noinspection JSUnresolvedVariable
      const loginInfo = this.$ls.get('loginInfo');
      if (loginInfo === null) {
        this.me = '';
      } else {
        // noinspection JSUnresolvedVariable
        const me = loginInfo.account_id;
        resolveResponse(this, inspectDisp(me))
          .then((res) => {
            this.oldAvatar.displayName = res.display_name;
          })
          .then(() => resolveResponse(this, exists(this.me)))
          .then((res) => {
            if (res) {
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
      }
    },
    loadNeoAvatar() {
      // noinspection JSUnresolvedVariable
      const loginInfo = this.$ls.get('loginInfo');
      if (loginInfo === null) {
        this.me = '';
      } else {
        // noinspection JSUnresolvedVariable
        const me = loginInfo.account_id;
        resolveResponse(this, inspectDisp(me))
          .then((res) => {
            this.neoAvatar.displayName = res.display_name;
          })
          .then(() => resolveResponse(this, exists(this.me)))
          .then((res) => {
            if (res) {
              return resolveResponse(this, inspect(this.me))
                .then((avatarInfo) => {
                  console.log(avatarInfo);
                  // noinspection JSUnresolvedVariable
                  this.neoAvatar.fileName = avatarInfo.origin_name;
                })
                .then(() => download(this.me))
                .then((blob) => {
                  this.neoAvatar.blobToUpdate = blob;
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
      }
    },
    handleAvatarEdit() {
      this.avatarEditDialog.visible = true;
    },
    handleFileSelect() {
      const file = document.getElementById('fileSelector');
      file.click();
    },
    handleImageSelected(e) {
      const file = e.target.files[0];
      if (!/\.(jpg|jpeg|png|JPG|PNG)$/.test(e.target.value)) {
        this.$message({
          message: '图片类型要求：jpeg、jpg、png',
          type: 'error',
        });
        return false;
      }

      // 将文件的原始名称获取并放在 data 区对应的位置。
      this.avatarEditDialog.file.fileName = file.name;

      // 创建文件读取器，定义文件读取完成时的回调。
      const reader = new FileReader();
      reader.onload = (f) => {
        // 生成图片的 URL。
        const data = window.URL.createObjectURL(new Blob([f.target.result]));
        // 如果之前已经有上一张的图片的 URL 的话，把上一张的 URL 释放掉。
        const oldUrl = this.avatarEditDialog.cropper.img;
        if (oldUrl !== '') {
          window.URL.revokeObjectURL(oldUrl);
        }
        // 赋值新的 URL。
        this.avatarEditDialog.cropper.img = data;
        // 头像编辑器获得焦点。
        document.getElementById('avatar-editor').focus();
      };

      // 转化为 blob。
      reader.readAsArrayBuffer(file);

      return true;
    },
    handleAvatarZoomIn() {
      this.$refs.cropper.changeScale(1);
    },
    handleAvatarZoomOut() {
      this.$refs.cropper.changeScale(-1);
    },
    handleAvatarRotateRight() {
      this.$refs.cropper.rotateRight();
    },
    handleAvatarRotateLeft() {
      this.$refs.cropper.rotateLeft();
    },
    handleHotKeyDown(e) {
      if (this.avatarEditDialog.cropper.img === '') {
        return;
      }
      let delta = 1;
      if (e.ctrlKey) {
        delta = 5;
      }
      switch (e.keyCode) {
        case 38: // 上
          this.$refs.cropper.$data.y -= delta;
          break;
        case 40: // 下
          this.$refs.cropper.$data.y += delta;
          break;
        case 37: // 左
          this.$refs.cropper.$data.x -= delta;
          break;
        case 39: // 右
          this.$refs.cropper.$data.x += delta;
          break;
        default:
      }
    },
    handleAvatarEditCanceled() {
      this.avatarEditDialog.visible = false;
    },
    handleAvatarEditConfirmed() {
      this.$refs.cropper.getCropBlob(async (data) => {
        // 如果 neoAvatar 有旧连接的话，则清除。
        const oldUrl = this.neoAvatar.avatarUrl;
        if (oldUrl !== '') {
          window.URL.revokeObjectURL(oldUrl);
        }
        // Blob 赋值。
        this.neoAvatar.blobToUpdate = data;
        // 文件名称赋值。
        this.neoAvatar.fileName = this.avatarEditDialog.file.fileName;
        // 创建新连接。
        this.neoAvatar.avatarUrl = window.URL.createObjectURL(data);
        // 关闭对话框。
        this.avatarEditDialog.visible = false;
      });
    },
    handleAvatarUpload() {
      const formData = new FormData();
      formData.append('file', this.neoAvatar.blobToUpdate, this.neoAvatar.fileName);
      resolveResponse(this, upload(this.me, formData))
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
    this.handleWhoAmI();
    this.loadOldAvatar();
    this.loadNeoAvatar();
  },
  destroyed() {
    let url = this.avatarEditDialog.cropper.img;
    if (url !== '') {
      window.URL.revokeObjectURL(url);
    }
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

.cropper {
  height: 180px;
  width: 180px;
}

.cropper-with-title {
  display: flex;
  flex-direction: column;
  width: 180px;
  align-content: center;
  margin-left: 33px;
}

.cropper-title {
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei",
  "微软雅黑", Arial, sans-serif;
  font-size: 14px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  text-align: center;
}

.avatar-editor {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.avatar-editor:focus {
  outline: none;
}

.avatar-editor-button-column {
  display: flex;
  flex-direction: column;
}

.avatar-editor-button {
  padding: 2px;
  height: 22px;
  width: 22px;
  box-sizing: content-box;
  margin-left: 5px !important;
}

.avatar-editor-button:not(:last-child) {
  margin-bottom: 6px;
}

.avatar-editor-button-icon {
  font-size: 18px;
  color: white;
}

.avatar-editor-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-editor-header {
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin-bottom: 10px;
}

.avatar-editor-footer {
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin-top: 10px;
}
</style>

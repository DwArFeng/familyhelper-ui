<template>
  <div class="my-profile-container">
    <content-panel
      class="content-panel"
      :header-visible="true"
      :breadcrumb="['我与家庭', '个人简介管理']"
    >
      <div class="main-container-wrapper">
        <overlay-scrollbars class="scroll-bar main-container">
          <el-form
            class="profile-form"
            ref="form"
            label-width="80px"
            :model="profileForm.entity"
            :rules="profileForm.rules"
          >
            <!-- 基本信息 -->
            <el-divider content-position="left">基本信息</el-divider>
            <el-form-item label="姓名" prop="name">
              <el-input
                v-model="profileForm.entity.name"
                placeholder="请填写姓名"
              />
            </el-form-item>
            <el-form-item label="性别" prop="gender">
              <el-select
                v-model="profileForm.entity.gender"
                placeholder="请选择"
              >
                <el-option
                  v-for="item in genderIndicator.entities.data"
                  :key="item.key.string_id"
                  :label="item.label"
                  :value="item.key.string_id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="证件类型" prop="id_type">
              <el-select
                v-model="profileForm.entity.id_type"
                placeholder="请选择"
              >
                <el-option
                  v-for="item in idTypeIndicator.entities.data"
                  :key="item.key.string_id"
                  :label="item.label"
                  :value="item.key.string_id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="证件号" prop="id_number">
              <el-input
                class="in-form-item"
                v-model="profileForm.entity.id_number"
                placeholder="请填写证件号"
              />
            </el-form-item>
            <el-form-item label="生日" prop="birthday">
              <el-date-picker
                v-model="profileForm.entity.birthday"
                type="date"
                placeholder="选择日期"
                value-format="yyyy-MM-dd"
              />
            </el-form-item>
            <el-form-item label="民族" prop="nationality">
              <el-select
                v-model="profileForm.entity.nationality"
                placeholder="请选择"
              >
                <el-option
                  v-for="item in nationalityIndicator.entities.data"
                  :key="item.key.string_id"
                  :label="item.label"
                  :value="item.key.string_id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="血型" prop="id_type">
              <el-select
                v-model="profileForm.entity.blood_type"
                placeholder="请选择"
              >
                <el-option
                  v-for="item in bloodTypeIndicator.entities.data"
                  :key="item.key.string_id"
                  :label="item.label"
                  :value="item.key.string_id"
                />
              </el-select>
            </el-form-item>

            <!-- 联系方式 -->
            <el-divider content-position="left">联系方式</el-divider>
            <el-form-item label="家庭住址" prop="family_address">
              <el-input
                v-model="profileForm.entity.family_address"
                placeholder="请填写家庭住址"
              />
            </el-form-item>
            <el-form-item label="手机号码" prop="phone_number">
              <el-input
                v-model="profileForm.entity.phone_number"
                placeholder="请填写手机号码"
              />
            </el-form-item>
            <el-form-item label="电子邮件" prop="email_address">
              <el-input
                v-model="profileForm.entity.email_address"
                placeholder="请填写电子邮件"
              />
            </el-form-item>

            <!-- 职务信息 -->
            <el-divider content-position="left">职务信息</el-divider>
            <el-form-item label="工作单位" prop="employer">
              <el-input
                v-model="profileForm.entity.employer"
                placeholder="请填写工作单位"
              />
            </el-form-item>
            <el-form-item label="单位地址" prop="employer_address">
              <el-input
                v-model="profileForm.entity.employer_address"
                placeholder="请填写单位地址"
              />
            </el-form-item>
            <el-form-item label="职位" prop="job_position">
              <el-input
                v-model="profileForm.entity.job_position"
                placeholder="请填写职位"
              />
            </el-form-item>
            <el-form-item label="职称" prop="job_title">
              <el-input
                v-model="profileForm.entity.job_title"
                placeholder="请填写职称"
              />
            </el-form-item>

            <!-- 教育水平 -->
            <el-divider content-position="left">教育水平</el-divider>
            <el-form-item label="院校" prop="latest_school_name">
              <el-input
                v-model="profileForm.entity.latest_school_name"
                placeholder="请填写当前/毕业院校"
              />
            </el-form-item>
            <el-form-item label="学历" prop="educational_background">
              <el-select
                v-model="profileForm.entity.educational_background"
                placeholder="请选择"
              >
                <el-option
                  v-for="item in educationalBackgroundIndicator.entities.data"
                  :key="item.key.string_id"
                  :label="item.label"
                  :value="item.key.string_id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="学位" prop="educational_level">
              <el-select
                v-model="profileForm.entity.educational_level"
                placeholder="请选择"
              >
                <el-option
                  v-for="item in educationalLevelIndicator.entities.data"
                  :key="item.key.string_id"
                  :label="item.label"
                  :value="item.key.string_id"
                />
              </el-select>
            </el-form-item>

            <!-- 政治信息 -->
            <el-divider content-position="left">政治信息</el-divider>
            <el-form-item label="政治面貌" prop="political_status">
              <el-select
                v-model="profileForm.entity.political_status"
                placeholder="请选择"
              >
                <el-option
                  v-for="item in politicalStatusIndicator.entities.data"
                  :key="item.key.string_id"
                  :label="item.label"
                  :value="item.key.string_id"
                />
              </el-select>
            </el-form-item>

            <!-- 婚姻信息 -->
            <el-divider content-position="left">婚姻信息</el-divider>
            <el-form-item label="婚姻状态" prop="marital_status">
              <el-select
                v-model="profileForm.entity.marital_status"
                placeholder="请选择"
              >
                <el-option
                  v-for="item in maritalStatusIndicator.entities.data"
                  :key="item.key.string_id"
                  :label="item.label"
                  :value="item.key.string_id"
                />
              </el-select>
            </el-form-item>

            <!-- 其它 -->
            <el-divider content-position="left">其它</el-divider>
            <el-form-item label="备注" prop="remark">
              <el-input
                v-model="profileForm.entity.remark"
                type="textarea"
                maxlength="200"
                show-word-limit
                :rows="6"
              />
            </el-form-item>
          </el-form>
        </overlay-scrollbars>
      </div>
      <div class="header-container" slot="header">
        <el-button
          class="insert-button"
          type="primary"
          @click="handleSave"
        >
          保存
        </el-button>
        <el-button
          class="insert-button"
          type="danger"
          @click="handleResume"
        >
          还原
        </el-button>
        <el-button
          class="insert-button"
          type="primary"
          @click="handleShowGuestAssignDialog"
        >
          分配权限
        </el-button>
      </div>
    </content-panel>
    <el-dialog
      class="guest-assign-dialog-container"
      ref="guestAssignDialog"
      tabindex="0"
      append-to-body
      destroy-on-close
      title="访客权限分配"
      :visible.sync="guestAssignDialog.dialogVisible"
      :close-on-click-modal="false"
      @opened="handleGuestAssignDialogOpened"
      @keydown.ctrl.enter.native="handleResetGuestRelation"
    >
      <el-transfer
        v-model="guestAssignDialog.selectedGuests"
        :titles="['待选用户','已选用户']"
        :props="guestAssignDialog.props"
        :data="guestAssignDialog.allGuests"
      >
      </el-transfer>
      <div class="dialog-footer-container" slot="footer">
        <el-button
          type="primary"
          @click="handleResetGuestRelation"
        >
          确定
        </el-button>
        <el-button
          @click="handleCancelGuestRelation"
        >
          取消
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import ContentPanel from '@/components/layout/LayoutPanel.vue';

import {
  exists, inspect, updateProfile, resetGuestPermission,
} from '@/api/clannad/profile';
import { childForCategory } from '@/api/clannad/profileTypeIndicator';
import { all as allAccount, childForProfileGuest } from '@/api/system/account';
import resolveResponse from '@/util/response';

export default {
  name: 'MyProfile',
  components: { ContentPanel },
  data() {
    return {
      me: '',
      profileForm: {
        entity: {
          name: '',
          id_number: '',
          id_type: '',
          birthday: '',
          gender: '',
          blood_type: '',
          nationality: '',
          family_address: '',
          phone_number: '',
          email_address: '',
          employer: '',
          job_position: '',
          employer_address: '',
          job_title: '',
          latest_school_name: '',
          educational_level: '',
          educational_background: '',
          political_status: '',
          marital_status: '',
          remark: '',
        },
        rules: {},
      },
      idTypeIndicator: {
        entities: {
          current_page: 0,
          total_pages: 0,
          rows: 0,
          count: '0',
          data: [],
        },
      },
      genderIndicator: {
        entities: {
          current_page: 0,
          total_pages: 0,
          rows: 0,
          count: '0',
          data: [],
        },
      },
      nationalityIndicator: {
        entities: {
          current_page: 0,
          total_pages: 0,
          rows: 0,
          count: '0',
          data: [],
        },
      },
      bloodTypeIndicator: {
        entities: {
          current_page: 0,
          total_pages: 0,
          rows: 0,
          count: '0',
          data: [],
        },
      },
      educationalBackgroundIndicator: {
        entities: {
          current_page: 0,
          total_pages: 0,
          rows: 0,
          count: '0',
          data: [],
        },
      },
      educationalLevelIndicator: {
        entities: {
          current_page: 0,
          total_pages: 0,
          rows: 0,
          count: '0',
          data: [],
        },
      },
      politicalStatusIndicator: {
        entities: {
          current_page: 0,
          total_pages: 0,
          rows: 0,
          count: '0',
          data: [],
        },
      },
      maritalStatusIndicator: {
        entities: {
          current_page: 0,
          total_pages: 0,
          rows: 0,
          count: '0',
          data: [],
        },
      },
      guestAssignDialog: {
        dialogVisible: false,
        allGuests: [],
        selectedGuests: [],
        props: {
          key: 'key',
          label: 'label',
          disabled: 'disabled',
        },
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
    handleProfileTypeIndicatorSearch() {
      this.lookupSubCategoryIndicator('id_type', this.idTypeIndicator);
      this.lookupSubCategoryIndicator('gender', this.genderIndicator);
      this.lookupSubCategoryIndicator('nationality', this.nationalityIndicator);
      this.lookupSubCategoryIndicator('blood_type', this.bloodTypeIndicator);
      this.lookupSubCategoryIndicator('educational_background', this.educationalBackgroundIndicator);
      this.lookupSubCategoryIndicator('educational_level', this.educationalLevelIndicator);
      this.lookupSubCategoryIndicator('political_status', this.politicalStatusIndicator);
      this.lookupSubCategoryIndicator('marital_status', this.maritalStatusIndicator);
    },
    lookupSubCategoryIndicator(category, indicatorObject) {
      resolveResponse(this, childForCategory(category, 0, 100))
        .then((res) => {
          // eslint-disable-next-line no-param-reassign
          indicatorObject.entities = res;
        })
        .catch(() => {
        });
    },
    handleProfileReset() {
      resolveResponse(this, exists(this.me))
        .then((res) => {
          if (res) {
            return resolveResponse(this, inspect(this.me));
          }
          return Promise.resolve(null);
        })
        .then(this.updateFormEntity)
        .catch(() => {
        });
    },
    updateFormEntity(res) {
      if (res === null) {
        this.profileForm.entity.name = '';
        this.profileForm.entity.id_number = '';
        this.profileForm.entity.id_type = '';
        this.profileForm.entity.birthday = '';
        this.profileForm.entity.gender = '';
        this.profileForm.entity.blood_type = '';
        this.profileForm.entity.nationality = '';
        this.profileForm.entity.family_address = '';
        this.profileForm.entity.phone_number = '';
        this.profileForm.entity.email_address = '';
        this.profileForm.entity.employer = '';
        this.profileForm.entity.job_position = '';
        this.profileForm.entity.employer_address = '';
        this.profileForm.entity.job_title = '';
        this.profileForm.entity.latest_school_name = '';
        this.profileForm.entity.educational_level = '';
        this.profileForm.entity.educational_background = '';
        this.profileForm.entity.political_status = '';
        this.profileForm.entity.marital_status = '';
        this.profileForm.entity.remark = '';
      } else {
        this.profileForm.entity.name = res.name;
        this.profileForm.entity.id_number = res.id_number;
        this.profileForm.entity.id_type = res.id_type;
        this.profileForm.entity.birthday = res.birthday;
        this.profileForm.entity.gender = res.gender;
        this.profileForm.entity.blood_type = res.blood_type;
        this.profileForm.entity.nationality = res.nationality;
        this.profileForm.entity.family_address = res.family_address;
        this.profileForm.entity.phone_number = res.phone_number;
        this.profileForm.entity.email_address = res.email_address;
        this.profileForm.entity.employer = res.employer;
        this.profileForm.entity.job_position = res.job_position;
        this.profileForm.entity.employer_address = res.employer_address;
        this.profileForm.entity.job_title = res.job_title;
        this.profileForm.entity.latest_school_name = res.latest_school_name;
        this.profileForm.entity.educational_level = res.educational_level;
        this.profileForm.entity.educational_background = res.educational_background;
        this.profileForm.entity.political_status = res.political_status;
        this.profileForm.entity.marital_status = res.marital_status;
        this.profileForm.entity.remark = res.remark;
      }
    },
    handleSave() {
      resolveResponse(this, updateProfile(
        this.me,
        this.profileForm.entity.name,
        this.profileForm.entity.id_number,
        this.profileForm.entity.id_type,
        this.profileForm.entity.birthday,
        this.profileForm.entity.gender,
        this.profileForm.entity.blood_type,
        this.profileForm.entity.nationality,
        this.profileForm.entity.family_address,
        this.profileForm.entity.phone_number,
        this.profileForm.entity.email_address,
        this.profileForm.entity.employer,
        this.profileForm.entity.job_position,
        this.profileForm.entity.employer_address,
        this.profileForm.entity.job_title,
        this.profileForm.entity.latest_school_name,
        this.profileForm.entity.educational_level,
        this.profileForm.entity.educational_background,
        this.profileForm.entity.political_status,
        this.profileForm.entity.marital_status,
        this.profileForm.entity.remark,
      ))
        .then(() => {
          this.$message({
            showClose: true,
            message: '个人简介保存成功',
            type: 'success',
            center: true,
          });
        })
        .catch(() => {
        });
    },
    handleResume() {
      this.$confirm('此操作将丢弃未保存的更改。<br>是否继续?',
        '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          dangerouslyUseHTMLString: true,
          customClass: 'custom-message-box__w500',
          type: 'warning',
        }).then(() => Promise.resolve()).catch(() => Promise.reject())
        .then(() => resolveResponse(this, exists(this.me)))
        .then((res) => {
          if (res) {
            return resolveResponse(this, inspect(this.me));
          }
          return Promise.resolve(null);
        })
        .then(this.updateFormEntity)
        .then(() => {
          this.$message({
            showClose: true,
            message: '个人简介复位成功',
            type: 'success',
            center: true,
          });
        })
        .catch(() => {
        });
    },
    handleShowGuestAssignDialog() {
      this.guestAssignDialog.dialogVisible = true;
      resolveResponse(this, allAccount(0, 99999))
        .then((res) => {
          this.guestAssignDialog.allGuests = res.data.map(
            (r) => ({ key: r.key.string_id, label: r.name, disabled: r.key.string_id === this.me }),
          );
        })
        .then(() => resolveResponse(this, childForProfileGuest(
          this.me, 0, 99999,
        )))
        .then((res) => {
          this.guestAssignDialog.selectedGuests = res.data.map((r) => r.key.string_id);
        })
        .catch(() => {
        });
    },
    handleGuestAssignDialogOpened() {
      // noinspection JSUnresolvedFunction
      this.$refs.guestAssignDialog.$el.focus();
    },
    handleResetGuestRelation() {
      const guestKeys = this.guestAssignDialog.selectedGuests.map((r) => ({ string_id: r }));
      resolveResponse(this, resetGuestPermission(guestKeys))
        .then(() => {
          this.$message({
            showClose: true,
            message: '访客权限更新成功',
            type: 'success',
            center: true,
          });
        })
        .then(() => {
          this.guestAssignDialog.dialogVisible = false;
        })
        .catch(() => {
        });
    },
    handleCancelGuestRelation() {
      this.guestAssignDialog.dialogVisible = false;
    },
  },
  mounted() {
    this.handleWhoAmI();
    this.handleProfileTypeIndicatorSearch();
    this.handleProfileReset();
  },
};
</script>

<style scoped>
.my-profile-container {
  width: 100%;
  height: 100%;
}

.main-container-wrapper {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
}

.main-container {
  width: min(100%, 800px);
}

.profile-form {
  width: 100%;
  box-sizing: border-box;
  padding-right: 20px;
}

/*noinspection CssUnusedSymbol*/
.profile-form >>> .el-divider:not(:first-child) {
  margin-top: 40px
}

/*noinspection CssUnusedSymbol*/
.guest-assign-dialog-container >>> .el-dialog__body {
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
}

.dialog-footer-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
}
</style>

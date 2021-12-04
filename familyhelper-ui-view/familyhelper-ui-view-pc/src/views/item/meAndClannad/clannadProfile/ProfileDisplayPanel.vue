<template>
  <div class="profile-display-panel-container">
    <div class="main-container-wrapper">
      <overlay-scrollbars class="scroll-bar main-container">
        <el-form
          class="profile-form"
          label-position="left"
          label-width="80px"
          inline
          :model="profileForm.entity"
        >
          <!-- 基本信息 -->
          <el-divider content-position="left">基本信息</el-divider>
          <el-form-item label="姓名" prop="name" style="width: 33%">
            {{ formatNormal(profileForm.entity.name) }}
          </el-form-item>
          <el-form-item label="性别" prop="gender" style="width: 33%">
            {{ formatIndicator(profileForm.entity.gender, profileForm.entity.gender_indicator) }}
          </el-form-item>
          <el-form-item label="生日" prop="birthday" style="width: 33%">
            {{ formatNormal(profileForm.entity.birthday) }}
          </el-form-item>
          <el-form-item label="证件类型" prop="id_type" style="width: 33%">
            {{ formatIndicator(profileForm.entity.id_type, profileForm.entity.id_type_indicator) }}
          </el-form-item>
          <el-form-item label="证件号" prop="id_number" style="width: 67%">
            {{ formatNormal(profileForm.entity.id_number) }}
          </el-form-item>
          <el-form-item label="民族" prop="nationality" style="width: 33%">
            {{
              formatIndicator(
                profileForm.entity.nationality, profileForm.entity.nationality_indicator
              )
            }}
          </el-form-item>
          <el-form-item label="血型" prop="blood_type" style="width: 33%">
            {{
              formatIndicator(
                profileForm.entity.blood_type, profileForm.entity.blood_type_indicator
              )
            }}
          </el-form-item>

          <!-- 联系方式 -->
          <el-divider content-position="left">联系方式</el-divider>
          <el-form-item label="家庭住址" prop="family_address" style="width: 100%">
            {{ formatNormal(profileForm.entity.family_address) }}
          </el-form-item>
          <el-form-item label="手机号码" prop="phone_number" style="width: 33%">
            {{ formatNormal(profileForm.entity.phone_number) }}
          </el-form-item>
          <el-form-item label="电子邮件" prop="email_address" style="width: 33%">
            {{ formatNormal(profileForm.entity.email_address) }}
          </el-form-item>

          <!-- 职务信息 -->
          <el-divider content-position="left">职务信息</el-divider>
          <el-form-item label="工作单位" prop="employer" style="width: 100%">
            {{ formatNormal(profileForm.entity.employer) }}
          </el-form-item>
          <el-form-item label="单位地址" prop="employer_address" style="width: 100%">
            {{ formatNormal(profileForm.entity.employer_address) }}
          </el-form-item>
          <el-form-item label="职位" prop="job_position" style="width: 33%">
            {{ formatNormal(profileForm.entity.job_position) }}
          </el-form-item>
          <el-form-item label="职称" prop="job_title" style="width: 33%">
            {{ formatNormal(profileForm.entity.job_title) }}
          </el-form-item>

          <!-- 教育水平 -->
          <el-divider content-position="left">教育水平</el-divider>
          <el-form-item label="院校" prop="latest_school_name" style="width: 33%">
            {{ formatNormal(profileForm.entity.latest_school_name) }}
          </el-form-item>
          <el-form-item label="学历" prop="educational_background" style="width: 33%">
            {{
              formatIndicator(
                profileForm.entity.educational_background,
                profileForm.entity.educational_background_indicator
              )
            }}
          </el-form-item>
          <el-form-item label="学位" prop="educational_level" style="width: 33%">
            {{
              formatIndicator(
                profileForm.entity.educational_level, profileForm.entity.educational_level_indicator
              )
            }}
          </el-form-item>

          <!-- 政治信息 -->
          <el-divider content-position="left">政治信息</el-divider>
          <el-form-item label="政治面貌" prop="political_status" style="width: 100%">
            {{
              formatIndicator(
                profileForm.entity.political_status, profileForm.entity.political_status_indicator
              )
            }}
          </el-form-item>

          <!-- 婚姻信息 -->
          <el-divider content-position="left">婚姻信息</el-divider>
          <el-form-item label="婚姻状态" prop="marital_status" style="width: 100%">
            {{
              formatIndicator(
                profileForm.entity.marital_status, profileForm.entity.marital_status_indicator
              )
            }}
          </el-form-item>
        </el-form>
      </overlay-scrollbars>
    </div>
  </div>
</template>

<script>
import { inspectDisp } from '@/api/clannad/profile';
import resolveResponse from '@/util/response';

export default {
  name: 'ProfileDisplayPanel',
  props: {
    me: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
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
          id_type_indicator: null,
          gender_indicator: null,
          blood_type_indicator: null,
          nationality_indicator: null,
          educational_level_indicator: null,
          educational_background_indicator: null,
          political_status_indicator: null,
          marital_status_indicator: null,
        },
      },
    };
  },
  methods: {
    handleInspectProfile() {
      resolveResponse(inspectDisp(this.me))
        .then((res) => {
          this.$set(this.profileForm, 'entity', res);
        })
        .catch(() => {
        });
    },
    formatNormal(value) {
      if (value === '') {
        return '（未填写）';
      }
      return value;
    },
    formatIndicator(value, indicator) {
      if (value === '') {
        return '（未填写）';
      }
      if (indicator !== null) {
        return indicator.label;
      }
      return `${value}（未找到标签）`;
    },
  },
  mounted() {
    this.handleInspectProfile();
  },
};
</script>

<style scoped>
.profile-display-panel-container {
  height: 100%;
  width: 100%;
}

.main-container-wrapper {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
}

.main-container {
  width: min(100%, 1000px);
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

.profile-form >>> label {
  width: 240px;
  color: #99a9bf;
}

/*noinspection CssUnusedSymbol*/
.profile-form >>> .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 51%;
}

/*noinspection CssUnusedSymbol*/
.profile-form >>> .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 51%;
}

/*noinspection CssUnusedSymbol*/
.profile-form >>> .el-divider__text {
  color: #99a9bf;
}
</style>

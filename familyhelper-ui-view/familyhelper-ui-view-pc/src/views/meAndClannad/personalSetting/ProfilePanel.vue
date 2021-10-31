<template>
  <div class="profile-panel-container layout-container">
    <overlay-scrollbars class="scroll-bar central-gap-container">
      <el-form
        class="profile-form"
        ref="form"
        label-width="80px"
        :model="profileForm.entity"
        :rules="profileForm.rules"
      >
        <el-divider content-position="left">基本信息</el-divider>
        <el-form-item label="姓名" prop="name">
          <el-input
            class="in-form-item"
            v-model="profileForm.entity.name"
            placeholder="请填写姓名"
          />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select
            class='in-form-item'
            v-model="profileForm.entity.gender"
            placeholder="请选择"
          >
            <el-option
              v-for="item in genderTypeIndicator.entities.data"
              :key="item.key.string_id"
              :label="item.label"
              :value="item.key.string_id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="血型">
          <el-input
            class="in-form-item"
            v-model="form.name"
            disabled
            placeholder="暂时不支持，敬请期待"
          />
        </el-form-item>
        <el-form-item label="身份证号" prop="idNumber">
          <el-input
            class="in-form-item"
            v-model="profileForm.entity.idNumber"
            placeholder="请填写身份证号"
          />
        </el-form-item>
        <el-form-item label="生日" prop="birthday">
          <el-date-picker
            class="in-form-item"
            v-model="profileForm.entity.birthday"
            type="date"
            placeholder="选择日期"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>
        <el-divider content-position="left">个性信息</el-divider>
        <el-form-item label="每日格言">
          <el-input
            class="in-form-item"
            v-model="profileForm.entity.motd"
            type="textarea"
          ></el-input>
        </el-form-item>
      </el-form>
    </overlay-scrollbars>
    <div class="button-panel">
      <el-button
        type="primary"
        @click="handleSaveButtonClicked"
      >
        保存
      </el-button>
      <el-button
        type="danger"
        @click="handleCancelButtonClicked"
      >
        还原
      </el-button>
    </div>
  </div>
</template>

<script>
import { exists, inspect } from '@/api/clannad/profile';
import { all as allGenderTypeIndicator } from '@/api/clannad/genderTypeIndicator';

import resolveResponse from '@/util/response';

export default {
  name: 'ProfilePanel',
  props: {
    me: {
      type: String,
      default: '',
    },
  },
  watch: {
    me(value) {
      if (value === '') {
        return;
      }
      this.handleMyProfileSearch();
    },
  },
  data() {
    const idNumberValidator = (rule, value, callback) => {
      if (!this.isCardNo(value)) {
        callback(new Error('身份证无效'));
        return;
      }
      callback();
    };
    return {
      form: {
        name: '',
        region: '',
        date1: '',
        date2: '',
        delivery: false,
        type: [],
        resource: '',
        desc: '',
      },
      profileForm: {
        entity: {
          name: '',
          idNumber: '',
          motd: '',
          birthday: '',
          gender: '',
        },
        rules: {
          name: [
            { required: true, message: '名称不能为空', trigger: 'blur' },
          ],
          idNumber: [
            { required: true, message: '身份证不能为空', trigger: 'blur' },
            { validator: idNumberValidator, trigger: 'blur' },
          ],
          birthday: [
            { required: true, message: '生日不能为空', trigger: 'blur' },
          ],
          gender: [
            { required: true, message: '性别不能为空', trigger: 'blur' },
          ],
        },
      },
      genderTypeIndicator: {
        entities: {
          current_page: 0,
          total_pages: 0,
          rows: 0,
          count: '0',
          data: [],
        },
      },
    };
  },
  methods: {
    handleGenderTypeIndicatorSearch() {
      this.lookupAllGenderTypeIndicator();
    },
    lookupAllGenderTypeIndicator() {
      resolveResponse(this, allGenderTypeIndicator(0, 1000))
        .then(this.updateGenderTypeIndicatorObject)
        .catch(() => {
        });
    },
    updateGenderTypeIndicatorObject(res) {
      this.genderTypeIndicator.entities = res;
    },
    handleMyProfileSearch() {
      resolveResponse(this, exists(this.me))
        .then((res) => {
          if (res === false) {
            return Promise.resolve(null);
          }
          return resolveResponse(this, inspect(this.me));
        })
        .then(this.updateProfileForm)
        .catch(() => {
        });
    },
    updateProfileForm(res) {
      if (res === null) {
        this.profileForm.entity.name = '';
        this.profileForm.entity.idNumber = '';
        this.profileForm.entity.motd = '';
        this.profileForm.entity.birthday = '';
        this.profileForm.entity.gender = '';
      } else {
        this.profileForm.entity.name = res.name;
        this.profileForm.entity.idNumber = res.id_number;
        this.profileForm.entity.motd = res.motd;
        this.profileForm.entity.birthday = res.birthday;
        this.profileForm.entity.gender = res.gender;
      }
    },
    isCardNo(num) {
      let nTemp;
      let arrCh;
      let arrInt;
      let dtmBirth;
      let arrSplit;
      let duplicatedNum = num.toUpperCase();
      // 身份证号码为15位或者18位，15位时全为数字，18位前17位为数字，最后一位是校验位，可能为数字或字符X。
      if (!(/(^\d{15}$)|(^\d{17}([0-9]|X)$)/.test(duplicatedNum))) {
        return false;
      }
      // 校验位按照ISO 7064:1983.MOD 11-2的规定生成，X可以认为是数字10。
      // 下面分别分析出生日期和校验位
      let re;
      const len = duplicatedNum.length;
      if (len === 15) {
        re = new RegExp(/^(\d{6})(\d{2})(\d{2})(\d{2})(\d{3})$/);
        arrSplit = duplicatedNum.match(re);

        // 检查生日日期是否正确
        dtmBirth = new Date(`19${arrSplit[2]}/${arrSplit[3]}/${arrSplit[4]}`);
        const bCorrectDay = (dtmBirth.getYear() === Number(arrSplit[2]))
          && ((dtmBirth.getMonth() + 1) === Number(arrSplit[3]))
          && (dtmBirth.getDate() === Number(arrSplit[4]));
        if (!bCorrectDay) {
          return false;
        }
        // 将15位身份证转成18位
        // 校验位按照ISO 7064:1983.MOD 11-2的规定生成，X可以认为是数字10。
        arrInt = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
        arrCh = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
        nTemp = 0;
        let i;
        duplicatedNum = `${duplicatedNum.substr(0, 6)}19${duplicatedNum.substr(6, duplicatedNum.length - 6)}`;
        for (i = 0; i < 17; i += 1) {
          nTemp += duplicatedNum.substr(i, 1) * arrInt[i];
        }
        duplicatedNum += arrCh[nTemp % 11];
        return true;
      }
      if (len === 18) {
        re = new RegExp(/^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/);
        arrSplit = duplicatedNum.match(re);

        // 检查生日日期是否正确
        dtmBirth = new Date(`${arrSplit[2]}/${arrSplit[3]}/${arrSplit[4]}`);
        const bCorrectDay = (dtmBirth.getFullYear() === Number(arrSplit[2]))
          && ((dtmBirth.getMonth() + 1) === Number(arrSplit[3]))
          && (dtmBirth.getDate() === Number(arrSplit[4]));
        if (!bCorrectDay) {
          return false;
        }
        // 检验18位身份证的校验码是否正确。
        // 校验位按照ISO 7064:1983.MOD 11-2的规定生成，X可以认为是数字10。
        arrInt = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
        arrCh = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
        nTemp = 0;
        let i;
        for (i = 0; i < 17; i += 1) {
          nTemp += duplicatedNum.substr(i, 1) * arrInt[i];
        }
        const valNum = arrCh[nTemp % 11];
        return valNum === duplicatedNum.substr(17, 1);
      }
      return false;
    },
    handleSaveButtonClicked() {
      console.log(this.profileForm.entity.birthday);
    },
    handleCancelButtonClicked() {
      this.handleMyProfileSearch();
    },
  },
  mounted() {
    this.handleGenderTypeIndicatorSearch();
  },
};
</script>

<style scoped>
.profile-panel-container {
  width: 100%;
  height: 100%;
}

.layout-container {
  padding-left: 80px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.central-gap-container {
  padding-right: 20px;
  box-sizing: border-box;
  height: 0;
  flex-grow: 1;
}

.button-panel {
  padding-left: 80px;
  margin-top: 2px;
}

.in-form-item {
  width: min(100%, 550px);
}

/*noinspection CssUnusedSymbol*/
.profile-form >>> .el-divider:not(:first-child) {
  margin-top: 40px
}
</style>

<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row>
          <a-col :span="24">
            <a-form-model-item label="每日最多打卡次数" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="punchCount">
              <a-input-number v-model="model.punchCount" placeholder="请输入每日最多打卡次数" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="可打卡时段" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="status">
              <!-- <a-input-number v-model="model.punchTime" placeholder="请输入打卡积分" style="width: 100%" /> -->
              <a-radio-group v-model="model.status" name="radioGroup" @change="timeChange">
                <a-radio :value="0">全天</a-radio>
                <a-radio :value="1">自定义</a-radio>
              </a-radio-group>
            </a-form-model-item>
          </a-col>
          <a-col :span="24" v-if="model.status == 1">
            <div
              class="order"
              v-for="(item, index) in timeList"
              style=" margin:0 0 10px 160px;display: flex;justify-content: left; align-items: center;"
            >
              <div style="margin-right: 10px;">
                <!-- <a-form-model-item label="日期" :name="['formList', index, 'date']" :rules="rules.date"> -->
                <!-- <a-time-range-picker
                  format="HH:mm:ss"
                  :placeholder="['开始时间', '结束时间']"
                  v-model="item.date"
                /> -->
                <el-time-picker
                  is-range
                  v-model="item.date"
                  range-separator="至"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  placeholder="选择时间范围"
                  size="small"
                  value-format="HH:mm:ss"
                >
                </el-time-picker>
                <!-- </a-form-model-item> -->
              </div>
              <a-button style="margin-right: 10px;" type="primary" @click="addTable">新增</a-button>
              <a-button type="danger" v-if="timeList.length > 1" @click="deleteTable(index)">删除</a-button>
            </div>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="限制辖区" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="area">
              <!-- <a-input-number v-model="model.punchCardIntegral" placeholder="请输入打卡积分" style="width: 100%" /> -->
              <a-cascader
                v-model="model.area"
                :options="cityOptions"
                change-on-select
                :field-names="{ label: 'name', value: 'name', children: 'children' }"
                placeholder="请选择活动地址"
              />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item
              label="每次打卡可获得积分"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
              prop="punchCardIntegral"
            >
              <a-input-number v-model="model.punchCardIntegral" placeholder="请输入积分" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item
              label="是否需要审核"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
              prop="punchCardIntegral"
            >
              <a-radio-group v-model="model.status" name="radioGroup" @change="timeChange">
                <a-radio :value="1">是</a-radio>
                <a-radio :value="0">否</a-radio>
              </a-radio-group>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item
              label="是否同步圈子"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
              prop="punchCardIntegral"
            >
              <a-radio-group v-model="model.status" name="radioGroup" @change="timeChange">
                <a-radio :value="1">是</a-radio>
                <a-radio :value="0">否</a-radio>
              </a-radio-group>
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model>
    </j-form-container>
  </a-spin>
</template>

<script>
import { httpAction, getAction } from '@/api/manage'
// import { validateDuplicateValue } from '@/utils/util'
import cityJson from '@/assets/pcas-code.json'
import { message } from 'ant-design-vue'
export default {
  name: 'BkbPunchCardSettingForm',
  components: {},
  props: {
    //表单禁用
    disabled: {
      type: Boolean,
      default: false,
      required: false
    }
  },
  data() {
    return {
      cityOptions: cityJson,
      timeList: [
        {
          date: ''
        }
      ],
      model: {},
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      },
      confirmLoading: false,
      validatorRules: {
        punchCount: [
          { required: true, message: '请输入每日最多打卡次数!' },
          { pattern: /^-?\d+$/, message: '请输入整数!' }
        ],
        punchCardIntegral: [
          { required: true, message: '请输入打卡积分!' },
          { pattern: /^-?\d+$/, message: '请输入整数!' }
        ],
        punchTime: [{ required: true, message: '请选择可打卡时段!' }],
        area: [{ required: true, message: '请选择限制辖区!' }]
      },
      url: {
        add: '/mission/bkbPunchCardSetting/add',
        edit: '/mission/bkbPunchCardSetting/edit',
        queryById: '/mission/bkbPunchCardSetting/queryById'
      }
    }
  },
  watch: {
    model: {
      deep: true,
      immediate: true,
      handler(newValue) {
        if (newValue.status == 0 || (newValue.status == 1 && newValue.bkbSetTime.length <= 0)) {
          this.timeList = [{ date: '' }]
        } else {
          this.timeList = []
        }

        if (newValue.bkbSetTime)
          newValue.bkbSetTime.forEach(item => {
            this.timeList.push({
              date: [item.startTime, item.endTime]
            })
          })
      }
    }
  },
  computed: {
    formDisabled() {
      return this.disabled
    }
  },
  created() {
    //备份model原始值
    this.modelDefault = JSON.parse(JSON.stringify(this.model))
    console.log('this.model', this.model)
  },
  mounted() {
    console.log('mounted', this.model)
  },
  methods: {
    timeChange(e) {
      console.log('this.model.status', this.model.status)
      if (this.model.status == 1) this.timeList = [{ date: [] }]
    },
    addTable() {
      this.timeList.push({
        date: '',
        startTime: '',
        endTime: ''
      })
      console.log(this.timeList)
    },
    deleteTable(key) {
      this.timeList.splice(key, 1)
    },
    add() {
      this.edit(this.modelDefault)
    },
    edit(record) {
      this.model = Object.assign({}, record)
      this.visible = true
    },
    submitForm() {
      const that = this
      // 触发表单验证
      this.$refs.form.validate(valid => {
        if (valid) {
          if (this.model.status == 1 && this.timeList && this.timeList.length > 0 && !this.timeList[0].date) {
            message.error('请至少添加一个时段！')
            return
          }

          let data = this.model
          that.confirmLoading = true
          let httpurl = ''
          let method = ''
          if (!this.model.id) {
            httpurl += this.url.add
            method = 'post'
          } else {
            httpurl += this.url.edit
            let list = []
            this.timeList.forEach(item => {
              list.push({
                startTime: item.date[0],
                endTime: item.date[1]
              })
            })
            data = {
              bkbPunchCardSetting: {
                ...this.model
              },
              list
            }
            method = 'put'
          }
          httpAction(httpurl, data, method)
            .then(res => {
              if (res.success) {
                that.$message.success(res.message)
                that.$emit('ok')
              } else {
                that.$message.warning(res.message)
              }
            })
            .finally(() => {
              that.confirmLoading = false
            })
        }
      })
    }
  }
}
</script>

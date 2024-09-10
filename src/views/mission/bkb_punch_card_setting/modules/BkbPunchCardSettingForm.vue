<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row>
          <!-- <a-col :span="24">
            <a-form-model-item label="打卡天数" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="punchCardDay">
              <a-input-number v-model="model.punchCardDay" placeholder="请输入打卡天数" style="width: 100%" />
            </a-form-model-item>
          </a-col> -->
          <a-col :span="24">
            <a-form-model-item label="打卡积分" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="punchCardIntegral">
              <a-input-number v-model="model.punchCardIntegral" placeholder="请输入打卡积分" style="width: 100%" />
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model>
    </j-form-container>
  </a-spin>
</template>

<script>
import { httpAction, getAction } from '@/api/manage'
import { validateDuplicateValue } from '@/utils/util'

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
        punchCardDay: [
          { required: true, message: '请输入打卡天数!' },
          { pattern: /^-?\d+$/, message: '请输入整数!' }
        ],
        punchCardIntegral: [
          { required: true, message: '请输入打卡积分!' },
          { pattern: /^-?\d+$/, message: '请输入整数!' }
        ]
      },
      url: {
        add: '/mission/bkbPunchCardSetting/add',
        edit: '/mission/bkbPunchCardSetting/edit',
        queryById: '/mission/bkbPunchCardSetting/queryById'
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
  },
  methods: {
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
          that.confirmLoading = true
          let httpurl = ''
          let method = ''
          if (!this.model.id) {
            httpurl += this.url.add
            method = 'post'
          } else {
            httpurl += this.url.edit
            method = 'put'
          }
          httpAction(httpurl, this.model, method)
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

<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row>
          <a-col :span="24">
            <a-form-model-item label="操作积分" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="nowPoints">
              <a-input-number v-model="model.nowPoints" placeholder="请输入操作积分" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="手机号" :labelCol=1"labelCol" :wrapperCol="wrapperCol" prop="phone">
              <a-input v-model="model.phone" placeholder="请输入手机号"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="上次记录分数" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="oldPoints">
              <a-input-number v-model="model.oldPoints" placeholder="请输入上次记录分数" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="类型" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="addDiv">
              <a-input v-model="model.addDiv" placeholder="请输入类型"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="来源" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="fromType">
              <a-input v-model="model.fromType" placeholder="请输入来源"></a-input>
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
    name: 'BkbPointsListForm',
    components: {},
    props: {
      //表单禁用
      disabled: {
        type: Boolean,
        default: false,
        required: false,
      },
    },
    data() {
      return {
        model: {},
        labelCol: {
          xs: { span: 24 },
          sm: { span: 5 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 },
        },
        confirmLoading: false,
        validatorRules: {},
        url: {
          add: '/mission/bkbPointsList/add',
          edit: '/mission/bkbPointsList/edit',
          queryById: '/mission/bkbPointsList/queryById',
        },
      }
    },
    computed: {
      formDisabled() {
        return this.disabled
      },
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
        this.$refs.form.validate((valid) => {
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
              .then((res) => {
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
      },
    },
  }
</script>
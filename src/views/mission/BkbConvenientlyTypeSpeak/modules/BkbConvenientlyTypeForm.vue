<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row>
          <!-- <a-col :span="24">
            <a-form-model-item label="工单编号" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="problemNo">
              <a-input v-model="model.problemNo" placeholder="请输入工单编号"></a-input>
            </a-form-model-item>
          </a-col> -->
          <a-col :span="24">
            <a-form-model-item label="微信昵称" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="wxNickname">
              <a-input v-model="model.wxNickname" placeholder="请输入微信昵称"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="微信电话号码" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="wxPhone">
              <a-input v-model="model.wxPhone" placeholder="请输入微信电话号码"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="反馈内容" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="problemStatement">
              <a-input type="textarea" v-model="model.problemStatement" placeholder="请输入反馈内容"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="问题图片" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="problemFile">
              <j-image-upload v-model="model.problemFile"></j-image-upload>
            </a-form-model-item>
          </a-col>
          <!-- <a-col :span="24">
            <a-form-model-item label="随手拍，问，说类型" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="convenientlyType">
              <a-input v-model="model.convenientlyType" placeholder="请输入随手拍，问，说类型"  ></a-input>
            </a-form-model-item>
          </a-col> -->
          <!-- <a-col :span="24">
            <a-form-model-item label="问题分类" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="problemType">
              <a-select v-model:value="model.problemType" allowClear style="width: 100%" placeholder="请选择问题状态">
                <a-select-option value="URBAN_MANAGEMENT_COMPONENTS">城管事部件</a-select-option>
                <a-select-option value="GARBAGE_SORTING">垃圾分类</a-select-option>
                <a-select-option value="LIVELIHOOD_COMPLAINTS">民生投诉</a-select-option>
                <a-select-option value="OTHERS">其他</a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col> -->
          <!-- <a-col :span="24">
            <a-form-model-item label="问题定位经度" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="problemLongitude">
              <a-input v-model="model.problemLongitude" placeholder="请输入问题定位经度"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="问题定位纬度" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="problemLatitude">
              <a-input v-model="model.problemLatitude" placeholder="请输入问题定位纬度"  ></a-input>
            </a-form-model-item>
          </a-col> -->
          <!-- <a-col :span="24">
            <a-form-model-item label="问题提示" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="problemTips">
              <a-input v-model="model.problemTips" placeholder="请输入问题提示"  ></a-input>
            </a-form-model-item>
          </a-col> -->
          <!-- <a-col :span="24">
            <a-form-model-item label="详细地址" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="address">
              <a-input v-model="model.address" placeholder="请输入详细地址"></a-input>
            </a-form-model-item>
          </a-col> -->
        </a-row>
      </a-form-model>
    </j-form-container>
  </a-spin>
</template>

<script>
  import { httpAction, getAction } from '@/api/manage'
  import { validateDuplicateValue } from '@/utils/util'

  export default {
    name: 'BkbConvenientlyTypeForm',
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
          add: '/mission/bkbConvenientlyType/add',
          edit: '/mission/bkbConvenientlyType/edit',
          queryById: '/mission/bkbConvenientlyType/queryById',
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
    updated() {},
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

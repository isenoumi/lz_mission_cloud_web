<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail" :width="1000">
        <a-row>
          <a-col :span="24">
            <a-form-model-item label="知识标题" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="title">
              <a-input v-model="model.title" placeholder="请输入知识标题"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="知识类型" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="type">
              <j-category-select v-model="model.type" pcode="B03" placeholder="请选择知识类型" />
            </a-form-model-item>
          </a-col>
          <!--          <a-col :span="24">-->
          <!--            <a-form-model-item label="地区" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="region">-->
          <!--             <j-area-linkage type="cascader" v-model="model.region" placeholder="请输入省市区"  />-->
          <!--            </a-form-model-item>-->
          <!--          </a-col>-->
          <a-col :span="24">
            <a-form-model-item label="上传封面图" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="bgurl">
              <j-upload v-model="fileList" fileType="image" :number="1" fileDir="/BkpKnowledge/img"></j-upload>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="上传文件" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="files">
              <j-upload v-model="model.files" :value="fileList" fileType="file" :number="100"></j-upload>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="知识内容" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="content">
              <j-editor v-model="model.content" />
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model>
    </j-form-container>
  </a-spin>
</template>

<script>
import { httpAction, getAction } from '@api/manage'
import { validateDuplicateValue } from '@/utils/util'

export default {
  name: 'BkpKnowledgeForm',
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
        sm: { span: 3 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 19 }
      },
      confirmLoading: false,
      fileList: '',
      validatorRules: {
        title: [{ required: true, message: '请输入知识标题!' }],
        type: [{ required: true, message: '请输入知识类型!' }],
        region: [{ required: true, message: '请输入地区!' }],
        content: [{ required: true, message: '请输入知识内容!' }]
      },
      url: {
        add: '/mission/bkbKnowledge/add',
        edit: '/mission/bkbKnowledge/edit',
        queryById: '/mission/bkbKnowledge/queryById'
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
      getAction(this.url.queryById, { id: record.id }).then(res => {
        this.model = Object.assign({}, res.result)
        // this.model.files='文件.xlxs,文件.xlxs'
        this.fileList = res.success ? res.result.bgurl : ''
        this.visible = true
        console.log(res.result,'回显数据')
      })
    },
    submitForm() {
      const that = this
      this.model = { ...this.model, bgurl: this.fileList, files: this.model.files }
      // this.model = { ...this.model, bgurl: this.fileList }
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
    },
    handleCategoryChange(value, backObj) {
      this.model = Object.assign(this.model, backObj)
    }
  }
}
</script>

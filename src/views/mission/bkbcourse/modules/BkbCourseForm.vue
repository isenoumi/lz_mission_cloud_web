<template>
  <a-spin :spinning='confirmLoading'>
    <j-form-container :disabled='formDisabled'>
      <a-form-model ref='form' :model='model' :rules='validatorRules' slot='detail'>
        <a-row>
          <a-col :span='24'>
            <a-form-model-item label='课程名称' :labelCol='labelCol' :wrapperCol='wrapperCol' prop='name'>
              <a-input v-model='model.name' placeholder='请输入课程名称'></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span='24'>
            <a-form-model-item label='是否答题' :labelCol='labelCol' :wrapperCol='wrapperCol' prop='answer'>
              <j-dict-select-tag type='radio' v-model='model.answer' dictCode='yn' placeholder='请选择是否答题' />
            </a-form-model-item>
          </a-col>
          <a-col :span='24'>
            <a-form-model-item label='上传封面图' :labelCol='labelCol' :wrapperCol='wrapperCol' prop='bgurl'>
              <j-upload v-model='fileList' fileType='image' :number='1' fileDir='/BkbCourse/img'></j-upload>
            </a-form-model-item>
          </a-col>
          <a-col :span='24'>
            <a-form-model-item label='课程积分' :labelCol='labelCol' :wrapperCol='wrapperCol' prop='points'>
              <a-input-number id='inputNumber' v-model='model.points' :min='0' :max='10000'
              />
            </a-form-model-item>
          </a-col>
          <a-col :span='24'>
            <a-form-model-item label='获取规则' :labelCol='labelCol' :wrapperCol='wrapperCol' prop='pointsAcquisitionRule'>
              <a-radio-group v-model='model.pointsAcquisitionRule' :options='options' @change='onChangeRadio' />
            </a-form-model-item>
          </a-col>
          <a-col :span='24'>
            <a-form-model-item label='课程简介' :labelCol='labelCol' :wrapperCol='wrapperCol' prop='info'>
              <j-editor v-model='model.info' />
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
import { initDictOptions } from '@comp/dict/JDictSelectUtil'

export default {
  name: 'BkbCourseForm',
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
      searchOptions: [],
      options: [],
      model: {
        answer: 1
      },
      labelCol: {
        xs: { span: 24 },
        sm: { span: 2 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 21 }
      },
      confirmLoading: false,
      fileList: '',
      validatorRules: {
        name: [
          { required: true, message: '请输入课程名称!' }
        ],
        info: [
          { required: true, message: '请输入课程简介!' }
        ],
        answer: [
          { required: true, message: '请输入是否答题!' }
        ],
        pointsAcquisitionRule: [
          { required: false, message: '请选择类型!' }
        ],
        points: [
          { required: false, message: '请输入积分!' }
        ]
      },
      url: {
        add: '/mission/bkbCourse/add',
        edit: '/mission/bkbCourse/edit',
        queryById: '/mission/bkbCourse/queryById'
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
    this.initDictConfig()
  },
  methods: {
    //加载数据字典
    initDictConfig() {
      //初始化字典 - 商品类型
      initDictOptions('integral_get_type').then((res) => {
          if (res.success) {
            this.options = res.result.slice(0, 3)
            console.error(this.options, res.result.slice(0, 3))
          }
        }
      )
    },
    add() {
      this.edit(this.modelDefault)
    },
    edit(record) {
      getAction(this.url.queryById, { id: record.id }).then(res => {
        this.model = Object.assign({}, res.result)
        this.fileList = res.success ? res.result.bgurl : ''
        this.model.pointsAcquisitionRule = this.model.pointsAcquisitionRule + ''
        this.visible = true
      })
      console.warn(record)
    },
    submitForm() {
      const that = this
      this.model = { ...this.model, bgurl: this.fileList }
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
          httpAction(httpurl, this.model, method).then((res) => {
            if (res.success) {
              that.$message.success(res.message)
              that.$emit('ok')
            } else {
              that.$message.warning(res.message)
            }
          }).finally(() => {
            that.confirmLoading = false
          })
        }

      })
    }
  }
}
</script>
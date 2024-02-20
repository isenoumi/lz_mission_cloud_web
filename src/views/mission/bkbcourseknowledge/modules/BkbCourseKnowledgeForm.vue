<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row>
          <a-col :span="24">
            <a-form-model-item label="关联课程" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="courseId">
              <j-search-select-tag :key="key1"  v-model="model.courseId" :dictOptions="courseOptions"
                                   @change="areaCodeConfig(model.courseId)"/>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="知识库分类" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="knowledgeType">
              <j-category-select v-model="model.knowledgeType" pcode="B03" placeholder="请选择知识库分类"
                                 @change="knowTypeChange(model.knowledgeType)" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="关联知识库" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="knowledgeId">
              <j-search-select-tag :key="key" v-model="model.knowledgeId" :dictOptions="searchOptions"
                                   @change="knowledgeChange(model.knowledgeId)" />
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model>
      <BkpKnowledgeView :key="knowKey" v-if="knowledgeData" :knowledge-data="knowledgeData"></BkpKnowledgeView>
    </j-form-container>
  </a-spin>
</template>

<script>

import { httpAction, getAction } from '@/api/manage'
import BkpKnowledgeView from '../../bkbknowledge/modules/BkbKnowledgeView'
import Vue from 'vue'
import { USER_INFO } from '@/store/mutation-types'

export default {
  name: 'BkbCourseKnowledgeForm',
  components: {
    BkpKnowledgeView
  },
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
      user: Vue.ls.get(USER_INFO),
      knowledgeData: '',
      knowTypeData: '',
      searchOptions: [],
      courseOptions: [],
      dictData: '',
      key: 0,
      key1: 0,
      knowKey: 0,
      model: {},
      labelCol: {
        xs: { span: 24 },
        sm: { span: 2 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 21 }
      },
      confirmLoading: false,
      validatorRules: {
        courseId: [
          { required: true, message: '请输入关联课程!' }
        ],
        knowledgeId: [
          { required: true, message: '请输入关联知识库!' }
        ]
      },
      url: {
        add: '/mission/bkbCourseKnowledge/add',
        edit: '/mission/bkbCourseKnowledge/edit',
        areaCode: '/mission/bkbCourseKnowledge/areaCode',
        queryById: '/mission/bkbCourseKnowledge/queryById'
      },
      dicTXT: ''
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
    this.knowTypeChange()
    this.areaCodeConfig()
  },
  methods: {
    areaCodeConfig(v=undefined) {
      getAction('/mission/bkbCourse/areaCode').then(res => {
        if (res.success) {
          this.courseOptions = res.result
          this.model.courseId = v
          this.key1 += 1
        }
      })
    },
    // 分类类型改变,重载知识库下拉数据
    knowTypeChange(val) {
      getAction('/mission/bkbKnowledge/selectdata', { knowledgeType: val }).then(res => {
        this.searchOptions = res
        this.model.knowledgeId = undefined
        this.knowledgeData = ''
        this.key += 1
      })
    },
    // 知识库改变,加载知识库内容
    knowledgeChange(val) {
      if (val !== undefined) {
        getAction('/mission/bkbKnowledge/queryById', { id: val }).then(res => {
          if (res.success) {
            this.knowledgeData = { ...res.result, styleRolling: true }
            this.knowKey += 1
          }
        })
      } else {
        this.knowledgeData = ''
      }
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
    },
    handleCategoryChange(value, backObj) {
      this.model = Object.assign(this.model, backObj)
    }
  }
}
</script>
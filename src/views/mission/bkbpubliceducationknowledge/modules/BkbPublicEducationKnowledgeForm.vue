<template>
  <a-spin :spinning='confirmLoading'>
    <j-form-container :disabled='formDisabled'>
      <a-form-model ref='form' :model='model' :rules='validatorRules' slot='detail'>
        <a-row>
          <a-col :span='24'>
            <a-form-model-item label='知识库分类' :labelCol='labelCol' :wrapperCol='wrapperCol' prop='knowledgeType'>
              <j-category-select v-model='model.knowledgeType' pcode='B03' placeholder='请选择知识库分类'
                                 @change='knowTypeChange(model.knowledgeType)' />
            </a-form-model-item>
          </a-col>
          <a-col :span='24'>
            <a-form-model-item label='关联知识库' :labelCol='labelCol' :wrapperCol='wrapperCol' prop='knowledgeId'>
              <j-search-select-tag :key='key' v-model='model.knowledgeId' :dictOptions='searchOptions'
                                   @change='knowledgeChange(model.knowledgeId)' />
            </a-form-model-item>
          </a-col>
          <a-col :span='24'>
            <a-form-model-item label='宣教积分' :labelCol='labelCol' :wrapperCol='wrapperCol' prop='points'>
              <a-input-number id='inputNumber' v-model='model.points' :min='0' :max='10000'
                              @change='onChangeNumber' />
            </a-form-model-item>
          </a-col>
          <a-col :span='24'>
            <a-form-model-item label='获取规则' :labelCol='labelCol' :wrapperCol='wrapperCol' prop='pointsAcquisitionRule'>
              <a-radio-group v-model='model.pointsAcquisitionRule' :options='options' @change='onChangeRadio' />
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model>
      <BkpKnowledgeView :key='knowledgeData.id' v-if='knowledgeData' :knowledge-data='knowledgeData'></BkpKnowledgeView>
    </j-form-container>
  </a-spin>
</template>

<script>

import { httpAction, getAction } from '@api/manage'
import BkpKnowledgeView from '../../bkbknowledge/modules/BkbKnowledgeView'
import { initDictOptions } from '@comp/dict/JDictSelectUtil'

export default {
  name: 'BkbPublicEducationKnowledgeForm',
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
      knowledgeData: '',
      knowTypeData: '',
      searchOptions: [],
      value: 'Apple',
      options: [],
      key: 0,
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
        knowledgeId: [
          { required: true, message: '请输入关联知识库!' }
        ],
        pointsAcquisitionRule: [
          { required: false, message: '请选择类型!' }
        ],
        points: [
          { required: false, message: '请输入积分!' }
        ]
      },
      url: {
        add: '/mission/bkbPublicEducationKnowledge/add',
        edit: '/mission/bkbPublicEducationKnowledge/edit',
        queryById: '/mission/bkbPublicEducationKnowledge/queryById'
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
    this.knowTypeChange()
    this.initDictConfig()
  },
  methods: {
    //加载数据字典
    initDictConfig() {
      //初始化字典 - 商品类型
      initDictOptions('integral_get_type').then((res) => {
          if (res.success) {
            this.options = res.result.slice(0, 3)
            console.log(this.options, res.result.slice(0, 3))
          }
        }
      )
    },
    onChangeRadio(e) {
      // console.log(e.target.value)
      this.model.pointsAcquisitionRule = e.target.value
    },
    onChangeNumber(e) {
      // console.log(e)
      this.model.points = e
    }
    ,
    // 根据条件修改
    // 分类类型改变,重载知识库下拉数据
    knowTypeChange(val) {
      getAction('/mission/bkbKnowledge/selectdata', { knowledgeType: val }).then(res => {
        this.searchOptions = res
        this.model.knowledgeId = undefined
        this.knowledgeData = ''
        this.key += 1
      })
    }
    ,
    // 知识库改变,加载知识库内容
    knowledgeChange(val) {
      if (val !== undefined) {
        this.knowledgeData = { id: val, styleRolling: true }
      } else {
        this.knowledgeData = ''
      }
    }
    ,
    add() {
      this.edit(this.modelDefault)
    },
    edit(record) {
      this.model = Object.assign({}, record)
      this.model.pointsAcquisitionRule = this.model.pointsAcquisitionRule + ''
      this.visible = true
    }
    ,
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
    }
    ,
    handleCategoryChange(value, backObj) {
      this.model = Object.assign(this.model, backObj)
    }
  }
}
</script>
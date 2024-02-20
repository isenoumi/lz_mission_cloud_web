<template>
  <a-spin :spinning='confirmLoading'>
    <j-form-container :disabled='formDisabled'>
      <!-- 主表单区域 -->
      <a-form-model ref='form' :model='model' :rules='validatorRules' slot='detail'>
        <a-row>
          <a-col :span='24'>
            <a-form-model-item label='题标题' :labelCol='labelCol' :wrapperCol='wrapperCol' prop='choiceqstTitle'>
              <a-input v-model='model.choiceqstTitle' placeholder='请输入题标题'></a-input>
            </a-form-model-item>
          </a-col>
          <!--          <a-col :span="24">-->
          <!--            <a-form-model-item label="地区" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="region">-->
          <!--              <j-area-linkage type="cascader" v-model="model.region" placeholder="请输入省市区" />-->
          <!--            </a-form-model-item>-->
          <!--          </a-col>-->
          <a-col :span='24'>
            <a-form-model-item label='题型' :labelCol='labelCol' :wrapperCol='wrapperCol' prop='choiceType'>
              <j-dict-select-tag type='radio' v-model='model.choiceType' dictCode='answer_type'
                                 placeholder='请选择单选还是多选题' />
            </a-form-model-item>
          </a-col>
          <a-col :span='24'>
            <a-form-model-item label='题内容' :labelCol='labelCol' :wrapperCol='wrapperCol' prop='choiceqstContent'>
              <j-editor v-model='model.choiceqstContent' />
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model>
    </j-form-container>
    <!-- 子表单区域 -->
    <a-tabs v-model='activeKey' @change='handleChangeTabs'>
      <a-tab-pane tab='选择题答案' :key='refKeys[0]' :forceRender='true'>
        <j-vxe-table
          keep-source
          :ref='refKeys[0]'
          :loading='bkbChoiceqstAnswerTable.loading'
          :columns='bkbChoiceqstAnswerTable.columns'
          :dataSource='bkbChoiceqstAnswerTable.dataSource'
          :maxHeight='300'
          :disabled='formDisabled'
          :rowNumber='true'
          :rowSelection='true'
          :toolbar='true'
          :bordered='true'
        />
      </a-tab-pane>
    </a-tabs>
  </a-spin>
</template>

<script>

import { getAction } from '@/api/manage'
import { JVxeTableModelMixin } from '@/mixins/JVxeTableModelMixin.js'
import { JVXETypes } from '@/components/jeecg/JVxeTable'
import { getRefPromise, VALIDATE_FAILED } from '@/components/jeecg/JVxeTable/utils/vxeUtils.js'
import JFormContainer from '@/components/jeecg/JFormContainer'


export default {
  name: 'BkpChoiceqstAnswerForm',
  mixins: [JVxeTableModelMixin],
  components: {
    JFormContainer
  },
  data() {
    return {
      optionsData: [],
      searchOptions: [],
      labelCol: {
        xs: { span: 24 },
        sm: { span: 3 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 }
      },
      model: {},
      // 新增时子表默认添加几行空数据
      addDefaultRowNum: 1,
      validatorRules: {
        choiceqstTitle: [
          { required: true, message: '请输入题标题!' }
        ],
        region: [
          { required: true, message: '请输入地区!' }
        ],
        choiceType: [
          { required: true, message: '请输入单选还是多选题!' }
        ],
        choiceqstContent: [
          { required: true, message: '请输入题内容!' }
        ]
      },
      refKeys: ['bkbChoiceqstAnswer'],
      tableKeys: ['bkbChoiceqstAnswer'],
      activeKey: 'bkbChoiceqstAnswer',
      // 选择题答案
      bkbChoiceqstAnswerTable: {
        loading: false,
        dataSource: [],
        columns: [
          {
            title: '答案内容',
            key: 'content',
            type: JVXETypes.input,
            width: '200px',
            placeholder: '请输入${title}',
            defaultValue: '',
            validateRules: [{ required: true, message: '${title}不能为空' }]
          },
          {
            title: '是否正确答案',
            key: 'rightAnswer',
            type: JVXETypes.select,
            options: [],
            dictCode: 'yn',
            width: '200px',
            placeholder: '请输入${title}',
            defaultValue: '0',
            validateRules: [{ required: true, message: '${title}不能为空' }]
          },
          {
            title: '状态',
            key: 'status',
            type: JVXETypes.select,
            options: [],
            dictCode: 'tenant_status',
            width: '200px',
            placeholder: '请输入${title}',
            defaultValue: '1',
            validateRules: [{ required: true, message: '${title}不能为空' }]
          }
        ]
      },
      url: {
        add: '/mission/bkbChoiceqst_answer/add',
        edit: '/mission/bkbChoiceqst_answer/edit',
        queryById: '/mission/bkbChoiceqst_answer/queryById',
        bkbChoiceqstAnswer: {
          list: '/mission/bkbChoiceqst_answer/queryBkpChoiceqstAnswerByMainId'
        }
      }
    }
  },
  props: {
    //表单禁用
    disabled: {
      type: Boolean,
      default: false,
      required: false
    }
  },
  computed: {
    formDisabled() {
      return this.disabled
    }
  },
  created() {
    this.knowTypeChange()
  },
  methods: {
    knowTypeChange() {
      getAction('/mission/bkbKnowledge/areaRights').then((res) => {
        this.searchOptions = []
        if (res.success) {
          this.searchOptions.push(...res.result)
        }
      })
    },
    initDictConfig() {
      //初始化字典
      getAction('/mission/bkbKnowledge/areaRights').then((res) => {
        if (res.success) {
          this.optionsData = res.result
        }
      })
    },
    addBefore() {
      this.bkbChoiceqstAnswerTable.dataSource = []
    },
    getAllTable() {
      let values = this.tableKeys.map(key => getRefPromise(this, key))
      return Promise.all(values)
    },
    /** 调用完edit()方法之后会自动调用此方法 */
    editAfter() {
      this.$nextTick(() => {
      })
      // 加载子表数据
      if (this.model.id) {
        let params = { id: this.model.id }
        this.requestSubTableData(this.url.bkbChoiceqstAnswer.list, params, this.bkbChoiceqstAnswerTable)
      }
    },
    //校验所有一对一子表表单
    validateSubForm(allValues) {
      return new Promise((resolve, reject) => {
        Promise.all([]).then(() => {
          resolve(allValues)
        }).catch(e => {
          if (e.error === VALIDATE_FAILED) {
            // 如果有未通过表单验证的子表，就自动跳转到它所在的tab
            this.activeKey = e.index == null ? this.activeKey : this.refKeys[e.index]
          } else {
            console.error(e)
          }
        })
      })
    },
    /** 整理成formData */
    classifyIntoFormData(allValues) {
      let main = Object.assign(this.model, allValues.formValue)
      return {
        ...main, // 展开
        bkbChoiceqstAnswerList: allValues.tablesValue[0].tableData
      }
    },
    validateError(msg) {
      this.$message.error(msg)
    }

  }
}
</script>

<style scoped>
</style>
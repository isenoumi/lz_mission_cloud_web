<template>
  <a-spin :spinning='confirmLoading'>
    <j-form-container :disabled='formDisabled'>
      <a-form-model ref='form' :model='model' :rules='validatorRules' slot='detail'>
        <a-row>
          <a-col :span='24'>
            <a-form-model-item label='楼栋号' :labelCol='labelCol' :wrapperCol='wrapperCol' prop='floornumber'>
              <a-input v-model='model.floornumber' placeholder='请输入楼栋号'></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span='24'>
            <a-form-model-item label='楼栋住户数' :labelCol='labelCol' :wrapperCol='wrapperCol' prop='tenement'>
              <a-input-number v-model='model.tenement' placeholder='请输入楼栋住户数' style='width: 100%' />
            </a-form-model-item>
          </a-col>
          <a-col :span='24'>
            <a-form-model-item label='状态' :labelCol='labelCol' :wrapperCol='wrapperCol' prop='status'>
              <j-dict-select-tag type='radio' v-model='model.status' dictCode='tenant_status' placeholder='请选择状态' />
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model>
    </j-form-container>
    <a-tabs v-model='activeKey' @change='handleChangeTabs'>
      <a-tab-pane tab='单元列表' :key='refKeys[0]' :forceRender='true'>
        <j-vxe-table
          keep-source
          :ref='refKeys[0]'
          :loading='bkbCommunityUnitTable.loading'
          :columns='bkbCommunityUnitTable.columns'
          :dataSource='bkbCommunityUnitTable.dataSource'
          :maxHeight='300'
          :disabled='formDisabled'
          :rowNumber='true'
          :rowSelection='true'
          :toolbar='true'
          @valueChange='handleValueChange'
        />
      </a-tab-pane>
    </a-tabs>
  </a-spin>
</template>

<script>

import { JVxeTableModelMixin } from '@/mixins/JVxeTableModelMixin.js'
import { JVXETypes } from '@/components/jeecg/JVxeTable'
import { getRefPromise, VALIDATE_FAILED } from '@/components/jeecg/JVxeTable/utils/vxeUtils.js'
import JFormContainer from '@/components/jeecg/JFormContainer'

export default {
  name: 'BkbCommunityFloorForm',
  mixins: [JVxeTableModelMixin],
  components: {
    JFormContainer
  },
  data() {
    return {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      },
      model: {
        status: '1'
      },
      // 新增时子表默认添加几行空数据
      addDefaultRowNum: 0,
      confirmLoading: false,
      validatorRules: {
        floornumber: [
          { required: true, message: '请输入楼栋号!' }
        ],
        tenement: [
          { required: true, message: '请输入楼栋住户数!' }
        ],
        status: [
          { required: true, message: '请输入状态!' }
        ]
      },
      refKeys: ['bkbCommunityUnit'],
      tableKeys: ['bkbCommunityUnit'],
      activeKey: 'bkbCommunityUnit',
      // 楼栋
      bkbCommunityUnitTable: {
        loading: false,
        dataSource: [],
        columns: [
          {
            title: '单元号',
            key: 'unitnumber',
            type: JVXETypes.input,
            width: '200px',
            placeholder: '请输入${title}',
            defaultValue: '',
            validateRules: [{ required: true, message: '${title}不能为空' }]
          },
          {
            title: '单元住户数',
            key: 'tenement',
            type: JVXETypes.inputNumber,
            width: '200px',
            placeholder: '请输入${title}',
            defaultValue: 0,
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
        add: '/mission/bkbCommunity/addBkbCommunityFloor',
        edit: '/mission/bkbCommunity/editBkbCommunityFloor',
        queryById: '/mission/bkbCommunity/queryFloorById',
        bkbCommunityUnit: {
          list: '/mission/bkbCommunity/queryBkbCommunityUnitByMainId'
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
    },
    mainId: {
      type: String,
      required: false,
      default: ''
    }
  },
  computed: {
    formDisabled() {
      return this.disabled
    }
  },
  created() {
  },
  methods: {
    addBefore() {
      this.bkbCommunityUnitTable.dataSource = []
    },
    handleValueChange(val) {
      if (val.col.field === 'tenement') {
        let tableData = this.$refs.bkbCommunityUnit.getTableData()
        let sum = 0
        tableData.map(r => sum += Number.parseFloat(r.tenement))
        this.model.tenement = sum ? sum : 0
      }
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
        this.requestSubTableData(this.url.bkbCommunityUnit.list, params, this.bkbCommunityUnitTable)
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
      allValues.formValue.communityId = this.mainId
      let main = Object.assign(this.model, allValues.formValue)
      console.log(main)
      return {
        ...main, // 展开
        bkbCommunityUnitList: allValues.tablesValue[0].tableData
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
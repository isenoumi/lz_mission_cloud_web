<template>
  <a-spin :spinning='confirmLoading'>
    <j-form-container :disabled='formDisabled'>
      <a-form-model ref='form' :model='model' :rules='validatorRules' slot='detail'>
        <a-row>
          <a-col :span='24'>
            <a-form-model-item label='任务标题' :labelCol='labelCol' :wrapperCol='wrapperCol' prop='title'>
              <a-input v-model='model.title' placeholder='请输入任务标题'></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span='24'>
            <a-form-model-item label='督导员' :labelCol='labelCol' :wrapperCol='wrapperCol' prop='supervisorId'>
              <a-select
                v-model='model.supervisorId'
                show-search
                :disabled='!model.status || model.status!="1" '
                placeholder="请选择督导员"
                option-filter-prop="children"
                style="width: 100%"
                @change="handleChange"
              >
                <a-select-option :value='undefined'>请选择</a-select-option>
                <a-select-option v-for='(item, key) in dictOptions' :key='key' :value='item.id'>
                  <span style='display: inline-block;width: 100%' :title=' item.name '>
                    {{ item.name }}
                  </span>
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <a-col :span='24' hidden>
            <a-form-model-item label='督导员名称' :labelCol='labelCol' :wrapperCol='wrapperCol' prop='supervisorName'>
              <a-input v-model='model.supervisorName' placeholder='请输入督导员名称' disabled></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span='24'>
            <a-form-model-item label='督导员电话' :labelCol='labelCol' :wrapperCol='wrapperCol' prop='supervisorPhone'>
              <a-input v-model='model.supervisorPhone' placeholder='请输入督导员电话' disabled></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span='24'>
            <a-form-model-item label='任务户数' :labelCol='labelCol' :wrapperCol='wrapperCol' prop='tenement'>
              <a-input v-model='model.tenement' placeholder='请输入任务户数'></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span='24'>
            <a-form-model-item label='完成户数' :labelCol='labelCol' :wrapperCol='wrapperCol' prop='complete'>
              <a-input v-model='model.complete' placeholder='请输入完成户数' disabled></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span='24'>
            <a-form-model-item label='小区名称' :labelCol='labelCol' :wrapperCol='wrapperCol' prop='communityId'>
              <a-select
                v-model='model.communityId'
                show-search
                placeholder="请选择小区名称"
                option-filter-prop="children"
                style="width: 100%"
                @change='floorunit'
              >
                <a-select-option :value='undefined'>请选择</a-select-option>
                <a-select-option v-for='(item, key) in communityList' :key='key' :value='item.id'>
                  <span style='display: inline-block;width: 100%' :title=' item.name '>
                    {{ item.name }}
                  </span>
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <a-col :span="24" v-if='model.communityId'>
            <a-form-model-item label="选择楼栋和单元" :labelCol='labelCol' :wrapperCol='wrapperCol' prop="selectFloorUnit">
              <a-tree-select
                labelInValue
                v-model="model.selectFloorUnit"
                style="width: 100%"
                :tree-data="treeData"
                tree-checkable
                :show-checked-strategy="SHOW_CHILD"
                search-placeholder="请选择楼栋和单元"
                @change='unit'
              />
            </a-form-model-item>
          </a-col>
<!--          <a-col :span='24'>-->
<!--            <a-form-model-item label='状态' :labelCol='labelCol' :wrapperCol='wrapperCol' prop='status'>-->
<!--              <j-dict-select-tag type='radio' v-model='model.status' dictCode='task_status' placeholder='请选择状态' />-->
<!--            </a-form-model-item>-->
<!--          </a-col>-->
        </a-row>
      </a-form-model>
    </j-form-container>
  </a-spin>
</template>

<script>

import { httpAction, getAction } from '@/api/manage'
import { validateDuplicateValue } from '@/utils/util'
import { TreeSelect } from 'ant-design-vue';
const SHOW_CHILD = TreeSelect.SHOW_CHILD;
const treeData = [];
export default {
  name: 'BkbTaskForm',
  components: {
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
      treeData,
      SHOW_CHILD,
      dictOptions: [],
      communityList: [],
      model: {
        status: '1',
        complete: '0',
        selectFloorUnit: [],
      },
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
        title: [
          { required: true, message: '请输入任务标题!' }
        ],
        supervisorId: [
          { required: true, message: '请选择督导员!' }
        ],
        communityId: [
          { required: true, message: '请选择小区名称!' }
        ],
        supervisorName: [
          { required: true, message: '请输入督导员名称!' }
        ],
        supervisorPhone: [
          { required: true, message: '请输入督导员电话!' }
        ],
        tenement: [
          { required: true, message: '请输入任务户数!' },
          { pattern: /^-?\d+\.?\d*$/, message: '请输入数字!' }
        ],
        complete: [
          { required: true, message: '请输入完成户数!' },
          { pattern: /^-?\d+\.?\d*$/, message: '请输入数字!' }
        ],
        selectFloorUnit: [
          { required: true, message: '请选择楼栋和单元!' }
        ],
        status: [
          { required: true, message: '请输入状态!' }
        ]
      },
      url: {
        add: '/mission/bkbTask/add',
        edit: '/mission/bkbTask/edit',
        queryById: '/mission/bkbTask/queryById',
        querySupervisorItem: '/mission/bkbTask/querySupervisorItem',
        queryCommunityItem: '/mission/bkbTask/queryCommunityItem',
        queryFloorUnit: '/mission/bkbTask/queryFloorUnit'
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
    this.initSupervisor();
  },
  methods: {
    floorunit(value){
      getAction(this.url.queryFloorUnit, {id:value}).then(r => {
        if (r.success) {
          this.treeData = r.result
          this.model.selectFloorUnit = [];
        } else {
          that.$message.warning(res.message)
        }
      })
    },
    unit(value){
      if (value.length>0){
        let sum = 0
        value.map(r => {
          const patt = /\([0-9]*户\)/
          const a = r.label.match(patt)
          sum += Number.parseFloat(a[0].toString().substr(1,a[0].toString().length-3))
        })
        this.model.tenement = sum
      } else {
        this.model.tenement = 0
      }
    },
    handleChange(value) {
      const item = this.dictOptions.filter(r => r.id === value)
      this.model.supervisorName = item[0].name
      this.model.supervisorPhone = item[0].phone
    },
    initSupervisor() {
      getAction(this.url.querySupervisorItem).then(r => {
        if (r.success) {
          this.dictOptions = r.result
        } else {
          that.$message.warning(res.message)
        }
      })
      getAction(this.url.queryCommunityItem).then(r => {
        if (r.success) {
          this.communityList = r.result
        } else {
          that.$message.warning(res.message)
        }
      })
      if (this.model.communityId){
        this.floorunit(this.model.communityId);
        this.model.selectFloorUnit = this.model.selectFloorUnit.split(',')
      }
    },
    add() {
      this.edit(this.modelDefault)
    },
    edit(record) {
      this.model = Object.assign({}, record)
      if (this.model.communityId){
        getAction(this.url.queryFloorUnit, {id:this.model.communityId}).then(r => {
          if (r.success) {
            this.treeData = r.result
            let result = []
            let sfu = this.model.selectFloorUnit.split(',')
            let sfut = this.model.selectFloorUnitText.split(',')
            for (let i = 0; i <sfu.length; i++) {
              result.push({value: sfu[i], label:sfut[i]})
            }
            this.model.selectFloorUnit = result;
          } else {
            that.$message.warning(res.message)
          }
        })
      }
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
          let selectFloorUnit = []
          let selectFloorUnitText = []
          this.model.selectFloorUnit.map(r => {
            selectFloorUnit.push(r.value)
            selectFloorUnitText.push(r.label)
          })
          let result={}
          Object.assign(result, this.model);
          result.selectFloorUnit = selectFloorUnit.join(',')
          result.selectFloorUnitText = selectFloorUnitText.join(',')
          httpAction(httpurl, result, method).then((res) => {
            if (res.success) {
              that.$message.success(res.message)
              that.$emit('ok')
            } else {
              that.$message.warning(res.message)
            }
          }).finally(() => {
            that.confirmLoading = false
          })
          that.confirmLoading = false
        }

      })
    }
  }
}
</script>

<template>
  <j-modal
    :title="title"
    :width="width"
    :visible="visible"
    :confirmLoading="confirmLoading"
    switchFullscreen
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="关闭"
  >
    <a-spin :spinning="confirmLoading">
      <a-form-model ref="form" :model="model" :rules="validatorRules">
        <a-form-model-item label="活动名称" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="name">
          <a-input v-model="model.name" placeholder="请输入活动名称"></a-input>
        </a-form-model-item>
        <a-form-model-item label="类型" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="type">
          <j-dict-select-tag type="list" v-model="model.type" dictCode="activity_type" placeholder="请选择类型" />
        </a-form-model-item>

        <!--        <a-form-model-item label='计划时间' :labelCol='labelCol' :wrapperCol='wrapperCol' prop='startDate'>-->
        <!--          <j-date placeholder='计划开始日期' :disabled-date='disabledDate' v-model='model.startDate' :show-time='true'-->
        <!--                  date-format='YYYY-MM-DD HH:mm:ss' style='width: 48%' />-->
        <!--        </a-form-model-item>-->

        <a-form-model-item label="计划开始日期" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="startDate">
          <j-date
            placeholder="请选择计划开始日期"
            :disabled-date="disabledEndDate"
            v-model="model.startDate"
            :show-time="true"
            date-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </a-form-model-item>

        <a-form-model-item label="活动时长" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="activityTime">
          <a-input
            type="number"
            :min="0"
            :max="24"
            :step="0.5"
            v-model="model.activityTime"
            placeholder="请输入活动时长"
          ></a-input>
        </a-form-model-item>
        <a-form-model-item label="活动完成积分" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="phaseTotalPoint">
          <a-input type="number" :min="0" v-model="model.phaseTotalPoint" placeholder="请输入活动完成积分"></a-input>
        </a-form-model-item>
        <a-form-model-item label="活动地址" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="activitySite">
          <a-input v-model="model.activitySite" placeholder="请输入活动地址"></a-input>
        </a-form-model-item>
        <a-form-model-item
          v-if="
            model.portId !== 'C' && model.portId !== 'D' && (model.status == 10 || model.status == 30 || !model.status)
          "
          label="演讲员"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          prop="speakerId"
        >
          <j-dict-select-tag
            v-model="model.speakerId"
            :dictCode="`bkb_speaker,name,id,region='${customerRegion}'`"
            placeholder="请选择"
          />
        </a-form-model-item>
        <!--        <a-form-model-item label="状态" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="status">-->
        <!--          <j-dict-select-tag type="list" v-model="model.status" dictCode="activity_status" placeholder="请选择状态" />-->
        <!--        </a-form-model-item>-->
        <a-form-model-item label="活动内容" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="remark">
          <a-textarea v-model="model.remark" rows="4" placeholder="请输入活动内容" />
        </a-form-model-item>
      </a-form-model>
    </a-spin>
  </j-modal>
</template>

<script>
import { getAction, httpAction } from '@/api/manage'
import store from '@/store'
import moment from 'moment'

const customerRegion = store.getters.userInfo.customerRegion

export default {
  name: 'BkbActivityModal',
  components: {},
  data() {
    return {
      customerRegion,
      title: '操作',
      width: 800,
      data: {},
      visible: false,
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
        name: [{ required: true, message: '请输入活动名称!' }],
        type: [{ required: true, message: '请选择活动类型!' }],
        activitySite: [{ required: true, message: '请输入活动地址!' }],
        phaseTotalPoint: [{ required: true, message: '请输入活动完成积分!' }],
        activityTime: [
          { required: true, message: '请输入活动时长!' }
          // { validator: (_, v, c) => c(v <= 0 || v > 24 ? '活动时间不能为小于等于0或者大于24' : '') }
        ],
        startDate: [{ required: true, message: '请输入开始日期!' }],
        speakerId: [{ required: true, message: '请输入演讲员!' }],
        status: [{ required: true, message: '请输入状态!' }],
        remark: [{ required: true, message: '请输入活动内容!' }]
      },
      url: {
        add: '/mission/bkbActivity/add',
        edit: '/mission/bkbActivity/edit',
        edit_1: '/mission/bkbActivity/edit_son'
      },
      expandedRowKeys: [],
      pidField: ''
    }
  },
  created() {
    //备份model原始值
    this.model.startDate = this.moment(this.model.startDate, 'YYYY-MM-DD')
    this.modelDefault = JSON.parse(JSON.stringify(this.model))
  },
  methods: {
    moment,
    disabledDate(current) {
      let star = current && current < new Date(this.data.createTime)
      return star
    },
    range(start, end) {
      const result = []
      for (let i = start; i < end; i++) {
        result.push(i)
      }
      return result
    },
    disabledEndDate(val) {
      return (
        val <=
        moment(new Date(), 'YYYY-MM-DD HH:mm:ss')
          .subtract(1, 'day')
          .endOf('day')
      )
    },
    //结束时间验证
    disabledRangeTime(v, type) {
      // console.warn(type)
      // if (type === 'end') {
      //   return {
      //     disabledHours: () => this.range(0, 60).splice(24, 4),
      //     disabledMinutes: () => this.range(0, 60),
      //     disabledSeconds: () => [55, 56]
      //   }
      // }
      // console.error(new Date(this.model.startDate.replace(/-/g, '/')).getMinutes())

      let date_se = new Date(this.model.startDate.replace(/-/g, '/'))
      return {
        // disabledHours: () => this.range(parseInt(v.format('HH')), 24)
        disabledHours: () => this.range(0, date_se.getHours()),
        disabledMinutes: () => {
          //时间相等限制分钟
          if (parseInt(date_se.getHours()) === parseInt(v.format('HH'))) {
            return this.range(0, date_se.getMinutes())
          } else {
            return []
          }
        },
        disabledSeconds: () => {
          //时间相等限制秒
          if (
            parseInt(date_se.getMinutes()) === parseInt(v.format('mm')) &&
            parseInt(date_se.getHours()) === parseInt(v.format('HH'))
          ) {
            return this.range(0, date_se.getSeconds())
          } else {
            return []
          }
        }
      }
    },
    add(obj) {
      this.modelDefault.pid = ''
      this.edit(Object.assign(this.modelDefault, obj))
    },
    edit(record) {
      console.warn(record, this.title)
      if (record.portId === 'B') {
        getAction('mission/bkbActivity/theExonSubobject', { id: record.id })
          .then(res => {
            this.model = Object.assign({}, record)
            this.data = Object.assign({}, record)
            this.model.speakerId = res.toString()
          })
          .finally(() => {
            this.visible = true
          })
      } else {
        this.model = Object.assign({}, record)
        this.data = Object.assign({}, record)
      }
      this.visible = true
      // this.visible = true
    },
    close() {
      this.$emit('close')
      this.visible = false
      this.$refs.form.clearValidate()
    },
    handleOk() {
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
            if (this.model.portId === 'C' || this.model.portId === 'D') {
              httpurl += this.url.edit_1
            } else {
              httpurl += this.url.edit
            }
            console.error(httpurl, this.model.portId)
            method = 'put'
          }
          if (this.model.id && this.model.id === this.model[this.pidField]) {
            that.$message.warning('父级节点不能选择自己')
            that.confirmLoading = false
            return
          }

          httpAction(httpurl, this.model, method)
            .then(res => {
              if (res.success) {
                that.$message.success(res.message)
                this.$emit('ok')
              } else {
                that.$message.warning(res.message)
              }
            })
            .finally(() => {
              that.confirmLoading = false
              that.close()
            })
        } else {
          return false
        }
      })
    },
    handleCancel() {
      this.close()
    },
    submitSuccess(formData, flag) {
      if (!formData.id) {
        let treeData = this.$refs.treeSelect.getCurrTreeData()
        this.expandedRowKeys = []
        this.getExpandKeysByPid(formData[this.pidField], treeData, treeData)
        this.$emit('ok', formData, this.expandedRowKeys.reverse())
      } else {
        this.$emit('ok', formData, flag)
      }
    },
    getExpandKeysByPid(pid, arr, all) {
      if (pid && arr && arr.length > 0) {
        for (let i = 0; i < arr.length; i++) {
          if (arr[i].key == pid) {
            this.expandedRowKeys.push(arr[i].key)
            this.getExpandKeysByPid(arr[i]['parentId'], all, all)
          } else {
            this.getExpandKeysByPid(pid, arr[i].children, all)
          }
        }
      }
    }
  }
}
</script>

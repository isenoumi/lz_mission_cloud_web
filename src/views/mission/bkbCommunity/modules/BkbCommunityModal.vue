<template>
  <j-modal
    :title='title'
    :width='width'
    :visible='visible'
    :confirmLoading='confirmLoading'
    switchFullscreen
    @ok='handleOk'
    @cancel='handleCancel'
    cancelText='关闭'>
    <a-spin :spinning='confirmLoading'>
      <a-form-model ref='form' :model='model' :rules='validatorRules'>
        <a-row>
          <a-col :span='24'>
            <a-form-model-item label='小区名称' :labelCol='labelCol' :wrapperCol='wrapperCol' prop='name'>
              <a-input v-model='model.name' placeholder='请输入小区名称'></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span='24'>
            <a-form-model-item label='小区住址' :labelCol='labelCol' :wrapperCol='wrapperCol' prop='address'>
              <a-textarea v-model='model.address' rows='4' placeholder='请输入小区住址' />
            </a-form-model-item>
          </a-col>
          <a-col :span='24'>
            <a-form-model-item label='小区住户数' :labelCol='labelCol' :wrapperCol='wrapperCol' prop='tenement'>
              <a-input-number v-model='model.tenement' placeholder='请输入小区住户数' style='width: 100%' />
            </a-form-model-item>
          </a-col>
          <a-col :span='24'>
            <a-form-model-item label='状态' :labelCol='labelCol' :wrapperCol='wrapperCol' prop='status'>
              <j-dict-select-tag type='radio' v-model='model.status' dictCode='tenant_status' placeholder='请选择状态' />
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model>
    </a-spin>
  </j-modal>
</template>

<script>

import { httpAction } from '@/api/manage'

export default {
  name: 'BkbCommunityModal',
  components: {},
  data() {
    return {
      title: '操作',
      width: 800,
      visible: false,
      model: {
        status: '1'
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
        name: [
          { required: true, message: '请输入小区名称!' }
        ],
        address: [
          { required: true, message: '请输入小区住址!' }
        ],
        tenement: [
          { required: true, message: '请输入小区住户数!' },
          { pattern: /^-?\d+\.?\d*$/, message: '请输入数字!' }
        ],
        status: [
          { required: true, message: '请输入状态!' }
        ]
      },
      url: {
        add: '/mission/bkbCommunity/add',
        edit: '/mission/bkbCommunity/edit'
      }

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
      this.model = Object.assign({}, record)
      this.visible = true
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
            that.close()
          })
        } else {
          return false
        }
      })
    },
    handleCancel() {
      this.close()
    }


  }
}
</script>
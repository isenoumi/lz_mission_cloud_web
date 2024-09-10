<template>
  <j-modal
    :title="title"
    :width="width"
    :visible="showStage"
    :confirmLoading="confirmLoading"
    switchFullscreen
    @ok="handleOk"
    @cancel="close"
    cancelText="关闭"
  >
    <a-spin :spinning="confirmLoading">
      <div v-for="(item, index) in form" :key="index">
        <!-- <j-form-container :disabled="formDisabled"> -->
        <a-form-model ref="form" :model="item" :rules="validatorRules">
          <a-form-model-item label="阶段名称" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="name">
            <a-input v-model="item.name" placeholder="请输入阶段名称" :disabled="formDisabled"></a-input>
          </a-form-model-item>
          <a-form-model-item label="工作人员" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="userPhone">
            <a-select v-model:value="item.userPhone" placeholder="请选择工作人员" :disabled="formDisabled">
              <a-select-option v-for="item in userList" :value="item.phone" :key="item.id">{{
                item.name
              }}</a-select-option>
            </a-select>
          </a-form-model-item>
          <a-form-model-item label="积分" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="point">
            <a-input-number
              v-model="item.point"
              placeholder="请输入积分"
              style="width: 100%;"
              :disabled="formDisabled"
            ></a-input-number>
          </a-form-model-item>
          <a-form-model-item label="二维码" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="qrCodeUrl">
            <a-button v-if="!item.qrCodeUrl && !formDisabled" type="primary" @click="createQRCode(item)">
              生成二维码
            </a-button>
            <img
              v-else-if="item.qrCodeUrl"
              :src="item.qrCodeUrl"
              alt=""
              srcset=""
              style="height: 100px;width: 100px;"
            />
          </a-form-model-item>
        </a-form-model>
        <!-- </j-form-container> -->
        <div class="btnList" v-if="!formDisabled">
          <a-button v-if="form.length - 1 == index" type="primary" @click="addFormList()">新增</a-button>
          <a-button style="margin-left: 10px;" v-if="form.length > 1" @click.prevent="removeFormList(item)"
            >删除
          </a-button>
        </div>
      </div>
    </a-spin>
  </j-modal>
</template>

<script>
import { getAction, httpAction } from '@/api/manage'
import store from '@/store'
import moment from 'moment'

const customerRegion = store.getters.userInfo.customerRegion

export default {
  name: 'stage',
  props: ['showStage', 'activeId', 'formDisabled', 'stageModel'],
  components: {},
  data() {
    return {
      customerRegion,
      title: '新增阶段',
      width: 800,
      data: {},
      visible: false,
      form: [{ point: '', qrCodeUrl: '', userPhone: '', name: '', qrCodeId: '' }],
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
        name: [{ required: true, message: '请输入阶段名称!' }],
        userPhone: [{ required: true, message: '请选择工作人员!' }],
        point: [{ required: true, message: '请输入积分!' }]
        // qrCodeUrl: [{ required: true, message: '请生成二维码!' }]
        // activityTime: [
        //   { required: true, message: '请输入活动时长,此活动时长为B端活动至少需要进行多少小时!' },
        //   { validator: (_, v, c) => c(v <= 0 || v > 24 ? '活动时间不能为小于等于0或者大于24' : '') }
        // ],

        // speakerId: [{ required: true, message: '请输入演讲员!' }],
        // status: [{ required: true, message: '请输入状态!' }]
      },
      url: {
        add: '/mission/bkbActivity/add',
        edit: '/mission/bkbActivity/edit',
        edit_1: '/mission/bkbActivity/edit_son'
      },
      expandedRowKeys: [],
      pidField: '',
      userList: []
    }
  },
  mounted() {
    getAction('/mission/bkbActivePhaseUser/list').then(res => {
      this.userList = res.result.records
    })
  },
  created() {
    //备份model原始值
    this.model.startDate = this.moment(this.model.startDate, 'YYYY-MM-DD')
    this.modelDefault = JSON.parse(JSON.stringify(this.model))
  },
  watch: {
    stageModel: {
      handler(newV, oldV) {
        // console.log(newV, oldV)
        this.form = JSON.parse(JSON.stringify(newV))
      },
      deep: true
    }
  },
  methods: {
    createQRCode(item) {
      console.log('object', item)
      if (!item.userPhone) {
        this.$message.warning('请选择工作人员!')
        return
      }
      httpAction(
        '/mission/bkbActivePhase/qrCode',
        { activeId: this.$props.activeId, userPhone: item.userPhone },
        'post'
      ).then(res => {
        console.log(res)
        if (res.code == 200) {
          item.qrCodeUrl = JSON.parse(res.result).imgUrl
          item.qrCodeId = JSON.parse(res.result).qrCodeId
        }
      })
    },
    // 新增行
    addFormList() {
      this.form.push({
        point: '',
        qrCodeUrl: '',
        userPhone: '',
        name: '',
        qrCodeId: ''
      })
    },
    // 删除行
    removeFormList(item) {
      const index1 = this.form.indexOf(item)
      if (index1 !== -1) {
        this.form.splice(index1, 1)
      }
    },
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
      this.$emit('closeStage')
      this.visible = false
      this.form = [{ point: '', qrCodeUrl: '', userPhone: '', name: '', qrCodeId: '' }]
      // this.$refs.form.clearValidate()
    },
    handleOk() {
      console.log('this.form', this.form, this.model)
      console.log(' this.$refs.form', this.$refs.form)
      let flag = true
      this.$refs.form.map(item =>
        item.validate(valid => {
          if (!valid) flag = false
        })
      )
      if (flag) {
        httpAction('/mission/bkbActivePhase/add', { activeId: this.$props.activeId, phases: this.form }, 'post')
          .then(res => {
            if (res.success) {
              this.$message.success(res.message)
              this.$emit('closeStage')
            } else {
              this.$message.warning(res.message)
            }
          })
          .finally(() => {
            this.confirmLoading = false
            this.form = [{ point: '', qrCodeUrl: '', userPhone: '', name: '', qrCodeId: '' }]
            this.close()
          })
      }
      return
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

<style scoped>
.btnList {
  display: flex;
  justify-content: right;
}
</style>

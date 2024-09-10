<template>
  <el-dialog :modal="false" title="修改发货信息" :close-on-click-modal="false" :visible.sync="visible" width="30%">
    <el-form
      :model="dataForm"
      :rules="dataRule"
      ref="dataForm"
      @keyup.enter.native="dataFormSubmit()"
      label-width="100px"
    >
      <div v-if="dataForm.hasDummy == '虚拟产品'">
        <el-form-item label="商品兑换码" prop="redeemCodes">
          <el-input
            v-model="dataForm.redeemCodes"
            controls-position="right"
            :min="0"
            label="商品兑换码"
            style="width: 217px"
          ></el-input>
        </el-form-item>
        <el-form-item label="备注信息" prop="remarksInformation">
          <el-input
            v-model="dataForm.remarksInformation"
            controls-position="right"
            :min="0"
            label="备注信息"
            style="width: 217px"
          ></el-input>
        </el-form-item>
      </div>
      <div v-else>
        <el-form-item label="快递公司">
          <el-select v-model="dataForm.dvyId" placeholder="请选择">
            <el-option v-for="item in dataForm.dvyNames" :key="item.dvyId" :label="item.dvyName" :value="item.dvyId">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="快递单号" prop="dvyFlowId">
          <el-input
            v-model="dataForm.dvyFlowId"
            controls-position="right"
            :min="0"
            label="快递单号"
            style="width: 217px"
          ></el-input>
        </el-form-item>
      </div>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>
<script>
export default {
  data() {
    var validDvyFlowId = (rule, value, callback) => {
      if (!value.trim()) {
        callback(new Error('不能为空'))
      } else {
        callback()
      }
    }
    return {
      visible: false,
      dataForm: {
        dvyId: '',
        dvyFlowId: 0,
        dvyNames: [],
        orderNumber: 0,
        redeemCodes: '',
        remarksInformation: '',
        hasDummy: ''
      },
      dataRule: {
        dvyFlowId: [
          { required: true, message: '不能为空', trigger: 'blur' },
          { validator: validDvyFlowId, trigger: 'blur' }
        ],
        redeemCodes: [{ required: true, message: '不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    init(orderNumber, dvyId, dvyFlowId, hasDummy, redeemCodes, remarksInformation) {
      this.visible = true
      this.dataForm.orderNumber = orderNumber || ''
      this.dataForm.dvyId = dvyId || ''
      this.dataForm.dvyFlowId = dvyFlowId || ''
      this.dataForm.hasDummy = hasDummy || ''
      this.dataForm.redeemCodes = redeemCodes || ''
      this.dataForm.remarksInformation = remarksInformation || ''
      this.$httpShop({
        url: this.$httpShop.adornUrl('/admin/delivery/list'),
        method: 'get',
        params: this.$httpShop.adornParams()
      }).then(({ result }) => {
        this.dataForm.dvyNames = result
      })
    },
    // 表单提交
    dataFormSubmit() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          if (this.dataForm.hasDummy == '虚拟产品') {
            this.$httpShop({
              url: this.$httpShop.adornUrl(`/order/order/delivery`),
              method: 'put',
              data: this.$httpShop.adornData({
                orderNumber: this.dataForm.orderNumber,
                dvyId: '1',
                dvyFlowId: '1',
                redeemCodes: this.dataForm.redeemCodes,
                remarksInformation: this.dataForm.remarksInformation
              })
            }).then(({ data }) => {
              this.$messageE({
                message: '操作成功',
                type: 'success',
                duration: 1500,
                onClose: () => {
                  this.visible = false
                  this.$emit('refreshDataList')
                }
              })
            })
          } else {
            this.$httpShop({
              url: this.$httpShop.adornUrl(`/order/order/delivery`),
              method: 'put',
              data: this.$httpShop.adornData({
                orderNumber: this.dataForm.orderNumber,
                dvyId: this.dataForm.dvyId,
                dvyFlowId: this.dataForm.dvyFlowId
              })
            }).then(({ data }) => {
              this.$messageE({
                message: '操作成功',
                type: 'success',
                duration: 1500,
                onClose: () => {
                  this.visible = false
                  this.$emit('refreshDataList')
                }
              })
            })
          }
        }
      })
    }
  }
}
</script>

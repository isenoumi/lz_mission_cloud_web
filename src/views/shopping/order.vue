<template>
  <div class="mod-order-order">
    <el-card>
      <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList(this.page)">
        <el-form-item label="订单编号:">
          <el-input v-model="dataForm.orderNumber" size="small" placeholder="订单编号" clearable></el-input>
        </el-form-item>
        <el-form-item label="下单时间:">
          <el-date-picker
            size="small"
            v-model="dateRange"
            type="datetimerange"
            range-separator="至"
            value-format="yyyy-MM-dd HH:mm:ss"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="订单状态:">
          <template>
            <el-select v-model="dataForm.status" size="small" clearable placeholder="请选择订单状态">
              <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"> </el-option>
            </el-select>
          </template>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="small" @click="getDataList()">查询</el-button>
          <!-- <el-button @click="showConsignmentInfo()" type="primary" size="small">导出待发货订单</el-button> -->
          <!-- <el-button @click="getSoldExcel()" type="primary" size="small">导出兑换记录</el-button> -->
          <el-button @click="dialogVisible = true" type="primary" size="small">导出信息</el-button>
          <el-button @click="delivery()" type="primary" size="small">批量发货</el-button>
          <el-button @click="clearDatas()" size="small">清空</el-button>
        </el-form-item>
      </el-form>
      <div class="main">
        <div class="content">
          <div class="tit">
            <el-row style="width: 100%">
              <el-col :span="10"><span class="item product">商品</span></el-col>
              <el-col :span="3"><span class="item">单价/数量</span></el-col>
              <el-col :span="3"><span class="item">实付积分</span></el-col>
              <el-col :span="3"><span class="item">支付方式</span></el-col>
              <el-col :span="3"><span class="item">订单状态</span></el-col>
              <el-col :span="2"><span class="item">操作</span></el-col>
            </el-row>
          </div>
          <div class="prod" v-for="order in dataList" :key="order.orderId">
            <div class="prod-tit">
              <span>订单编号：{{ order.orderNumber }}</span>
              <span>下单时间：{{ order.createTime }}</span>
              <!-- <span>买家：19999999999</span>
            <span >联系电话：19999999999</span> -->
            </div>
            <div class="prod-cont">
              <el-row style="width: 100%">
                <el-col :span="12">
                  <div class="prod-item">
                    <div class="items name" v-for="orderItem in order.orderItems" :key="orderItem.orderItemId">
                      <div class="prod-image">
                        <img :src="orderItem.pic" style="height: 100px; width: 100px" />
                      </div>
                      <div class="prod-name">
                        <span>{{ orderItem.prodName }}</span>
                        <span class="prod-info">{{ orderItem.skuName }}</span>
                      </div>
                      <div class="prod-price">
                        <!-- <span>￥{{ orderItem.price }}</span> -->
                        <!-- {{ JSON.stringify(orderItem) }} -->
                        <span>{{ orderItem.points }}积分</span>
                        <!-- <span>×{{ orderItem.prodCount }}</span> -->
                        <span>×{{ order.productNums }}</span>
                      </div>
                    </div>
                  </div>
                </el-col>
                <el-col :span="3" style="height: 100%">
                  <div class="item">
                    <div>
                      <!-- <span class="totalprice">￥{{ order.actualTotal }}</span> -->
                      <span class="totalprice">{{ order.allPoints }}积分</span>
                      <!-- <span v-if="order.freightAmount">（含运费：￥{{ order.freightAmount }}）</span> -->
                      <span>共{{ order.productNums }}件</span>
                    </div>
                  </div>
                </el-col>
                <el-col :span="3" style="height: 100%">
                  <div class="item">
                    <div>
                      <span>积分兑换</span>
                      <!-- <span v-if="order.payType === 1">微信支付</span>
                      <span v-else-if="order.payType === 2">支付宝</span>
                      <span v-else>手动代付</span> -->
                    </div>
                  </div>
                </el-col>
                <el-col :span="3" style="height: 100%">
                  <div class="item">
                    <!-- <span v-if="order.status === 1" size="small" type="danger">待付款</span> -->
                    <span v-if="order.status === 0" size="small" type="danger">待发货</span>
                    <span v-else-if="order.status === 1" size="small" type="danger">已发货</span>
                    <!-- <span v-else-if="order.status === 4" size="small" type="danger">待评价</span> -->
                    <span v-else-if="order.status === 2" size="small" type="danger">已完成</span>
                    <!-- <span v-else size="small">失败</span> -->
                  </div>
                </el-col>
                <el-col :span="3" style="height: 100%">
                  <div class="item">
                    <div class="operate">
                      <!-- <button onclick="">打印订单</button><br> -->
                      <el-button type="text" size="small" @click="addOrUpdateHandle(order.orderNumber)">查看</el-button>
                    </div>
                  </div>
                </el-col>
              </el-row>
            </div>
            <div class="remark">
              <div class="buyer-remark">
                <span>备注:{{ order.remarks }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 空 -->
      <div class="empty-tips" v-if="dataList.length == 0">暂无数据</div>
      <el-pagination
        @size-change="sizeChangeHandle"
        @current-change="currentChangeHandle"
        :current-page="page.pageIndex"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="page.pageSize"
        :total="page.total"
        layout="total, sizes, prev, pager, next, jumper"
      >
      </el-pagination>
      <!-- 弹窗, 新增 / 修改 -->
      <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList"></add-or-update>
      <consignment-info
        v-if="consignmentInfoVisible"
        ref="consignmentInfo"
        @inputCallback="getWaitingConsignmentExcel"
      ></consignment-info>
    </el-card>
    <div>
      <el-dialog
        :before-close="
          () => {
            radio = 0
            dialogVisible = false
          }
        "
        title="提示"
        :visible.sync="dialogVisible"
        width="20%"
      >
        <el-radio-group v-model="radio">
          <el-radio :label="1">导出待发货清单</el-radio>
          <el-radio :label="2">导出已发货清单</el-radio>
        </el-radio-group>
        <span slot="footer" class="dialog-footer">
          <el-button
            size="small"
            @click="
              () => {
                radio = 0
                dialogVisible = false
              }
            "
            >取 消</el-button
          >
          <el-button size="small" type="primary" @click="exportOrder">确 定</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import AddOrUpdate from './orderInfo'
import ConsignmentInfo from './consignment-info'
import { MessageBox } from 'element-ui'
export default {
  data() {
    return {
      dataForm: {},
      dateRange: [],
      options: [
        // {
        //   value: 1,
        //   label: '待付款',
        // },
        {
          value: 0,
          label: '待发货'
        },
        {
          value: 1,
          label: '已发货'
        },
        // {
        //   value: 4,
        //   label: '待评价',
        // },
        {
          value: 2,
          label: '已完成'
        }
        // {
        //   value: 6,
        //   label: '失败',
        // },
      ],
      resourcesUrl: process.env.VUE_APP_RESOURCES_URL,
      dataList: [],
      page: {
        total: 0, // 总页数
        currentPage: 1, // 当前页数
        pageSize: 10 // 每页显示多少条
      },
      dataListLoading: false,
      dataListSelections: [],
      addOrUpdateVisible: false,
      consignmentInfoVisible: false,
      radio: '',
      dialogVisible: false
    }
  },
  components: {
    AddOrUpdate,
    ConsignmentInfo
  },
  activated() {
    // this.getDataList(this.page)
  },
  mounted() {
    this.getDataList(this.page)
  },
  methods: {
    //跳到页顶
    scrollTop(selector) {
      let element = (selector && document.querySelector(selector)) || window
      element.scrollTo(0, 0)
    },
    delivery() {
      MessageBox.confirm('是否将所有除“虚拟产品”外的订单状态修改为已发货状态？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$httpShop({
            url: this.$httpShop.adornUrl(`/order/order/allShipsAreShipped`),
            method: 'get'
          }).then(({ result }) => {
            // this.$httpShop({
            //   url: this.$httpShop.adornUrl(`/order/order/batchDelivery`),
            //   method: 'put',
            //   data: { deliveryOrderParams: result }
            // }).then(({ data }) => {})
            this.$messageE({
              message: '修改成功',
              type: 'success',
              duration: 1500,
              onClose: () => {
                this.getDataList(this.page)
              }
            })
          })
        })
        .catch(() => {})
    },
    exportOrder() {
      if (this.radio === 1) {
        this.$httpShop({
          url: this.$httpShop.adornUrl('/order/order/outExcel'),
          method: 'post',
          // params: this.$httpShop.adornParams({
          //   startTime: this.dateRange === null ? null : this.dateRange[0], // 开始时间
          //   endTime: this.dateRange === null ? null : this.dateRange[1] // 结束时间
          // }),
          responseType: 'blob' // 解决文件下载乱码问题
        }).then(({ data }) => {
          var blob = new Blob([data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8'
          })
          const fileName = '待发货清单.xls'
          const elink = document.createElement('a')
          if ('download' in elink) {
            // 非IE下载
            elink.download = fileName
            elink.style.display = 'none'
            elink.href = URL.createObjectURL(blob)
            document.body.appendChild(elink)
            elink.click()
            URL.revokeObjectURL(elink.href) // 释放URL 对象
            document.body.removeChild(elink)
          } else {
            // IE10+下载
            navigator.msSaveBlob(blob, fileName)
          }
        })
      } else if (this.radio === 2) {
        this.$httpShop({
          url: this.$httpShop.adornUrl('/order/order/shippedExcel'),
          method: 'post',
          // params: this.$httpShop.adornParams({
          //   startTime: this.dateRange === null ? null : this.dateRange[0], // 开始时间
          //   endTime: this.dateRange === null ? null : this.dateRange[1] // 结束时间
          // }),
          responseType: 'blob' // 解决文件下载乱码问题
        }).then(({ data }) => {
          var blob = new Blob([data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8'
          })
          const fileName = '已发货清单.xls'
          const elink = document.createElement('a')
          if ('download' in elink) {
            // 非IE下载
            elink.download = fileName
            elink.style.display = 'none'
            elink.href = URL.createObjectURL(blob)
            document.body.appendChild(elink)
            elink.click()
            URL.revokeObjectURL(elink.href) // 释放URL 对象
            document.body.removeChild(elink)
          } else {
            // IE10+下载
            navigator.msSaveBlob(blob, fileName)
          }
        })
      } else if (!this.radio || this.radio == 0) {
        this.$messageE({
          type: 'warning',
          message: '请选择导出的清单!'
        })
        return
      }

      // this.$messageE({
      //   type: 'success',
      //   message: '发货成功!'
      // })
    },
    // 获取数据列表
    getDataList(page, params, done) {
      page = page === undefined ? this.page : page
      this.dataListLoading = true
      this.$httpShop({
        url: this.$httpShop.adornUrl('/order/order/page'),
        method: 'get',
        params: this.$httpShop.adornParams(
          Object.assign(
            {
              current: page == null ? this.page.currentPage : page.currentPage,
              size: page == null ? this.page.pageSize : page.pageSize,
              orderNumber: this.dataForm.orderNumber,
              status: this.dataForm.status,
              startTime: this.dateRange === null ? null : this.dateRange[0], // 开始时间
              endTime: this.dateRange === null ? null : this.dateRange[1] // 结束时间
            },
            params
          ),
          false
        )
      }).then(({ result }) => {
        this.dataList = result.records
        this.page.total = result.total
        this.dataListLoading = false

        if (done) {
          done()
        }
      })
    },
    // 清除数据
    clearDatas() {
      this.dataForm = {}
      this.dateRange = []
    },
    // 每页数
    sizeChangeHandle(val) {
      this.page.pageSize = val
      this.page.currentPage = 1
      this.getDataList(this.page)
    },
    // 当前页
    currentChangeHandle(val) {
      this.page.currentPage = val
      this.getDataList(this.page)
      this.scrollTop()
    },
    // 多选
    selectionChangeHandle(val) {
      this.dataListSelections = val
    },
    orderStatus() {},
    // 新增 / 修改
    addOrUpdateHandle(val) {
      this.addOrUpdateVisible = true
      this.$nextTick(() => {
        this.$refs.addOrUpdate.init(val)
      })
    },
    // 删除
    deleteHandle(id) {
      var ids = id
        ? [id]
        : this.dataListSelections.map(item => {
            return item.orderId
          })
      this.$confirm(`确定进行[${id ? '删除' : '批量删除'}]操作?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$httpShop({
            url: this.$httpShop.adornUrl(`/prod/spec/${ids}`),
            method: 'delete',
            data: this.$httpShop.adornData(ids, false)
          }).then(({ data }) => {
            this.$messageE({
              message: '操作成功',
              type: 'success',
              duration: 1500,
              onClose: () => {
                this.getDataList(this.page)
              }
            })
          })
        })
        .catch(() => {})
    },
    showConsignmentInfo() {
      this.consignmentInfoVisible = true
      this.$nextTick(() => {
        this.$refs.consignmentInfo.init()
      })
    },
    getWaitingConsignmentExcel(consignmentInfo) {
      this.$httpShop({
        url: this.$httpShop.adornUrl('/order/order/waitingConsignmentExcel'),
        method: 'get',
        params: this.$httpShop.adornParams({
          consignmentName: consignmentInfo.consignmentName,
          consignmentMobile: consignmentInfo.consignmentMobile,
          consignmentAddr: consignmentInfo.consignmentAddr,
          startTime: this.dateRange === null ? null : this.dateRange[0], // 开始时间
          endTime: this.dateRange === null ? null : this.dateRange[1] // 结束时间
        }),
        responseType: 'blob' // 解决文件下载乱码问题
      }).then(({ data }) => {
        var blob = new Blob([data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8'
        })
        const fileName = '待发货信息整理.xls'
        const elink = document.createElement('a')
        if ('download' in elink) {
          // 非IE下载
          elink.download = fileName
          elink.style.display = 'none'
          elink.href = URL.createObjectURL(blob)
          document.body.appendChild(elink)
          elink.click()
          URL.revokeObjectURL(elink.href) // 释放URL 对象
          document.body.removeChild(elink)
        } else {
          // IE10+下载
          navigator.msSaveBlob(blob, fileName)
        }
      })
    },
    getSoldExcel() {
      this.$httpShop({
        url: this.$httpShop.adornUrl('/order/order/soldExcel'),
        method: 'get',
        params: this.$httpShop.adornParams({
          startTime: this.dateRange === null ? null : this.dateRange[0], // 开始时间
          endTime: this.dateRange === null ? null : this.dateRange[1] // 结束时间
        }),
        responseType: 'blob' // 解决文件下载乱码问题
      }).then(({ data }) => {
        var blob = new Blob([data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8'
        })
        const fileName = '销售信息整理.xls'
        const elink = document.createElement('a')
        if ('download' in elink) {
          // 非IE下载
          elink.download = fileName
          elink.style.display = 'none'
          elink.href = URL.createObjectURL(blob)
          document.body.appendChild(elink)
          elink.click()
          URL.revokeObjectURL(elink.href) // 释放URL 对象
          document.body.removeChild(elink)
        } else {
          // IE10+下载
          navigator.msSaveBlob(blob, fileName)
        }
      })
    }
  }
}
</script>
<style lang="less">
.mod-order-order {
  .tit {
    display: flex;
    height: 45px;
    align-items: center;
  }
  .tit .item {
    padding: 0 10px;
    width: 10%;
    text-align: center;
  }
  .tit .product {
    width: 25%;
  }
  .prod-tit {
    padding: 10px;
    background: #f8f8f9;
    border-left: 1px solid #dddee1;
    border-top: 1px solid #dddee1;
    border-right: 1px solid #dddee1;
  }
  .prod-tit span {
    margin-right: 15px;
  }
  .prod-cont {
    display: flex;
    border-top: 1px solid #dddee1;
    border-bottom: 1px solid #dddee1;
    border-left: 1px solid #dddee1;
    color: #495060;
  }
  .prod-cont .item {
    display: flex;
    display: -webkit-flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
    // width: 10%;
    border-right: 1px solid #dddee1;
    text-align: center;
    height: 100%;
  }
  .prod-cont .item span {
    display: block;
  }
  .prod-cont .prod-item {
    // width: 38%;
    display: flex;
    flex-direction: column;
    border-right: 1px solid #dddee1;
  }
  .prod-name {
    width: 55%;
    text-align: left;
  }
  .prod-price {
    position: absolute;
    right: 40px;
    text-align: right;
  }
  .prod-price span {
    display: block;
    margin-bottom: 10px;
  }
  .prod-name .prod-info {
    display: block;
    color: #80848f;
    margin-top: 30px;
  }
  .prod-cont .items.name {
    display: flex;
    position: relative;
    padding: 20px;
    // height: 100px;
    border-bottom: 1px solid #dddee1;
  }
  .prod-cont .items.name:last-child {
    border-bottom: none;
  }
  .prod-image {
    margin-right: 20px;
    width: 100px;
    height: 100px;
  }
  .prod-image img {
    width: 100px;
    height: 100px;
  }
  .item span {
    display: block;
    margin-bottom: 10px;
  }
  .item .operate {
    color: #2d8cf0;
  }
  .item .totalprice {
    color: #c00;
  }
  .prod .remark {
    width: 100%;
    height: 50px;
    line-height: 50px;
    background-color: #e8f7f6;
    border-left: 1px solid #dddee1;
    border-right: 1px solid #dddee1;
    border-bottom: 1px solid #dddee1;
    margin-bottom: 20px;
  }
  .buyer-remark {
    padding: 0 20px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .empty-tips {
    display: block;
    width: 100%;
    text-align: center;
    margin: 50px 0;
    color: #999;
  }
}
</style>

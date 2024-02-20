<template>
  <div class="mod-prod">
    <el-card>
      <avue-crud
        ref="crud"
        :page="page"
        :data="dataList"
        :table-loading="dataListLoading"
        :option="tableOption"
        @search-change="searchChange"
        @selection-change="selectionChange"
        @on-load="getDataList"
      >
        <template slot="menuLeft">
          <el-button type="primary" icon="el-icon-plus" size="small" @click.stop="addOrUpdateHandle()">新增</el-button>

          <el-button type="danger" @click="deleteHandle()" size="small" :disabled="dataListSelections.length <= 0"
            >批量删除</el-button
          >
        </template>

        <template slot-scope="scope" slot="status">
          <el-tag v-if="scope.row.status === 1" size="small">上架</el-tag>
          <el-tag v-else size="small">未上架</el-tag>
        </template>

        <template slot-scope="scope" slot="menu">
          <el-button type="primary" icon="el-icon-edit" size="small" @click="addOrUpdateHandle(scope.row.prodId)"
            >修改</el-button
          >
          <el-button type="danger" icon="el-icon-delete" size="small" @click="deleteHandle(scope.row.prodId)"
            >删除</el-button
          >
        </template>
      </avue-crud>
    </el-card>
  </div>
</template>

<script>
import { tableOption } from '@/crud/prod/prodList'
export default {
  data() {
    return {
      dataForm: {
        prodName: '',
      },
      dataList: [],
      page: {
        total: 0, // 总页数
        currentPage: 1, // 当前页数
        pageSize: 10, // 每页显示多少条
      },
      dataListSelections: [],
      dataListLoading: false,
      tableOption: tableOption,
      resourcesUrl: process.env.VUE_APP_RESOURCES_URL,
    }
  },
  activated() {
    this.getDataList({
      total: 0, // 总页数
      currentPage: 1, // 当前页数
      pageSize: 10, // 每页显示多少条
    })
  },
  methods: {
    // 获取数据列表
    getDataList(page, params, done) {
      this.dataListLoading = true
      this.$httpShop({
        url: this.$httpShop.adornUrl('/prod/prod/page'),
        method: 'get',
        params: this.$httpShop.adornParams(
          Object.assign(
            {
              current: page == null ? this.page.currentPage : page.currentPage,
              size: page == null ? this.page.pageSize : page.pageSize,
            },
            params
          )
        ),
      }).then(({ result }) => {
        // console.log(result);
        this.dataList = result.records
        console.log(this.dataList)
        for (const key in this.dataList) {
          if (this.dataList.hasOwnProperty(key)) {
            const element = this.dataList[key]
            element.imgs = element.imgs.split(',')[0]
          }
        }
        this.page.total = result.total
        this.dataListLoading = false
        if (done) {
          done()
        }
      })
    },
    // 新增 / 修改
    addOrUpdateHandle(id) {
      this.$router.push({
        path: '/prodInfo/prodInfo',
        query: { prodId: id },
      })
    },
    // 删除和批量删除
    deleteHandle(id) {
      let prodIds = this.getSeleProdIds()
      if (id) {
        prodIds.push(id)
      }
      prodIds = prodIds.filter(function (item, index) {
        return prodIds.indexOf(item) === index // 因为indexOf 只能查找到第一个
      })

      this.$confirmE(`确定进行[${id ? '删除' : '批量删除'}]操作?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.$httpShop({
            url: this.$httpShop.adornUrl(`/prod/prod`),
            method: 'delete',
            data: this.$httpShop.adornData(prodIds, false),
          }).then(({ data }) => {
            this.$messageE({
              message: '操作成功',
              type: 'success',
              duration: 1500,
              onClose: () => {
                this.getDataList(this.page)
              },
            })
          })
        })
        .catch(() => {})
    },
    // 条件查询
    searchChange(params, done) {
      this.getDataList(this.page, params, done)
    },
    // 多选变化
    selectionChange(val) {
      this.dataListSelections = val
    },
    // 获取选中的商品Id列表
    getSeleProdIds() {
      return this.dataListSelections.map((item) => {
        return item.prodId
      })
    },
  },
}
</script>

<template>
  <div class="mod-category">
    <el-form :inline="true" :model="dataForm">
      <el-form-item>
        <el-button type="primary" icon="el-icon-plus" size="small" @click="addOrUpdateHandle()">新增</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="dataList" border row-key="categoryId" style="width: 100%">
      <el-table-column prop="categoryName" header-align="center" treeKey="categoryId" width="150" label="分类名称">
      </el-table-column>
      <el-table-column prop="pic" header-align="center" align="center" label="图片">
        <template slot-scope="scope">
          <img :src="resourcesUrl + scope.row.pic" />
        </template>
      </el-table-column>
      <el-table-column prop="status" header-align="center" align="center" label="状态">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === 0" size="small" type="danger">下线</el-tag>
          <el-tag v-else size="small">正常</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="seq" header-align="center" align="center" label="排序号"> </el-table-column>
      <el-table-column header-align="center" align="center" label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="addOrUpdateHandle(scope.row.categoryId)">修改</el-button>
          <el-button type="danger" size="small" @click="deleteHandle(scope.row.categoryId)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 弹窗, 新增 / 修改 -->
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList"></add-or-update>
  </div>
</template>

<script>
import AddOrUpdate from './category-add-or-update'
import { treeDataTranslate } from '@/utils/index2.js'

export default {
  data() {
    return {
      dataForm: {},
      dataList: [],
      dataListLoading: false,
      addOrUpdateVisible: false,
      resourcesUrl: process.env.VUE_APP_RESOURCES_URL,
    }
  },
  components: {
    AddOrUpdate,
  },
  activated() {
    // this.getDataList()
  },
  mounted() {
    this.getDataList()
  },
  methods: {
    // 获取数据列表
    getDataList() {
      this.dataListLoading = true
      this.$httpShop({
        url: this.$httpShop.adornUrl('/prod/category/table'),
        method: 'get',
        params: this.$httpShop.adornParams(),
      }).then(({ result }) => {
        this.dataList = treeDataTranslate(result, 'categoryId', 'parentId')
        this.dataListLoading = false
      })
    },
    // 新增 / 修改
    addOrUpdateHandle(id) {
      this.addOrUpdateVisible = true
      this.$nextTick(() => {
        this.$refs.addOrUpdate.init(id)
      })
    },
    // 删除
    deleteHandle(id) {
      this.$confirm(`确定进行删除操作?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.$httpShop({
          url: this.$httpShop.adornUrl(`/prod/category/${id}`),
          method: 'delete',
          data: this.$httpShop.adornData(),
        }).then(({ data }) => {
          this.$messageE({
            message: '操作成功',
            type: 'success',
            duration: 1500,
            onClose: () => {
              this.getDataList()
            },
          })
        })
      })
    },
  },
}
</script>
<style lang="less">
.mod-category {
  img {
    height: 80px;
    width: 200px;
  }
}
</style>

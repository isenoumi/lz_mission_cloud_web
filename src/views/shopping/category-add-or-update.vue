<template>
  <el-dialog
    :title="!dataForm.currentId ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible"
    width="40%"
  >
    <el-form
      :model="dataForm"
      :rules="dataRule"
      ref="dataForm"
      @keyup.enter.native="dataFormSubmit()"
      label-width="80px"
    >
      <el-form-item v-if="dataForm.type !== 2" label="分类图片" prop="pic">
        <pic-upload v-model="dataForm.pic"></pic-upload>
      </el-form-item>
      <el-form-item v-if="dataForm.type !== 2" label="分类名称" prop="categoryName">
        <el-input
          v-model="dataForm.categoryName"
          controls-position="right"
          :min="0"
          label="分类名称"
          style="width: 217px"
        ></el-input>
      </el-form-item>
      <!-- <el-form-item label="上级分类">
        <el-cascader
          expand-trigger="hover"
          :options="categoryList"
          :props="categoryTreeProps"
          change-on-select
          :clearable="true"
          v-model="selectedCategory"
          @change="handleChange"
        >
        </el-cascader>
      </el-form-item> -->
      <el-form-item v-if="dataForm.type !== 2" label="排序号" prop="seq">
        <el-input-number
          v-model="dataForm.seq"
          controls-position="right"
          :min="0"
          label="排序号"
          style="width: 217px"
        ></el-input-number>
      </el-form-item>
      <el-form-item label="状态" size="mini" prop="status">
        <el-radio-group v-model="dataForm.status">
          <el-radio :label="0">下线</el-radio>
          <el-radio :label="1">正常</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="visible = false">取消</el-button>
      <el-button size="small" type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { treeDataTranslate, idList } from '@/utils/index2.js'
import PicUpload from '@/components/pic-upload'
import { Debounce } from '@/utils/debounce'
export default {
  data() {
    return {
      visible: false,
      dataForm: {
        categoryId: 0,
        currentId: 0,
        grade: 0,
        categoryName: '',
        seq: 1,
        status: 1,
        parentId: 0,
        pic: '',
      },
      dataRule: {
        categoryName: [
          { required: true, message: '分类名称不能为空', trigger: 'blur' },
          { pattern: /\s\S+|S+\s|\S/, message: '请输入正确的分类名称', trigger: 'blur' },
        ],
        pic: [{ required: true, message: '分类图片不能为空', trigger: 'blur' }],
      },
      categoryList: [],
      selectedCategory: [],
      categoryTreeProps: {
        value: 'categoryId',
        label: 'categoryName',
      },
      isSubmit: false,
    }
  },
  components: {
    PicUpload,
  },
  methods: {
    init(id) {
      this.dataForm.currentId = id || 0
      this.dataForm.categoryId = id || 0
      this.$httpShop({
        url: this.$httpShop.adornUrl('/prod/category/listCategory'),
        method: 'get',
        params: this.$httpShop.adornParams(),
      })
        .then(({ result }) => {
          this.categoryList = treeDataTranslate(result, 'categoryId', 'parentId')
        })
        .then(() => {
          this.visible = true
          this.$nextTick(() => {
            this.$refs['dataForm'].resetFields()
            this.selectedCategory = []
          })
        })
        .then(() => {
          if (this.dataForm.categoryId) {
            // 修改
            this.$httpShop({
              url: this.$httpShop.adornUrl(`/prod/category/info/${this.dataForm.categoryId}`),
              method: 'get',
              params: this.$httpShop.adornParams(),
            }).then(({ result }) => {
              this.dataForm.categoryId = result.categoryId
              this.dataForm.categoryName = result.categoryName
              this.dataForm.seq = result.seq
              this.dataForm.pic = result.pic
              this.dataForm.parentId = result.parentId
              this.dataForm.status = result.status
              this.selectedCategory = idList(this.categoryList, result.parentId, 'categoryId', 'children').reverse()
            })
          }
        })
    },
    handleChange(val) {
      this.dataForm.parentId = val[val.length - 1]
    },
    // 表单提交
    dataFormSubmit: Debounce(function () {
      if (this.selectedCategory.length === 1) {
        this.dataForm.grade = 0
      }
      if (this.selectedCategory.length === 2) {
        this.dataForm.grade = 1
      }
      if (this.selectedCategory.length === 3) {
        this.dataForm.grade = 2
      }
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if (this.isSubmit) {
            return
          }
          this.isSubmit = true
          this.$httpShop({
            url: this.$httpShop.adornUrl(`/prod/category`),
            method: this.dataForm.categoryId ? 'put' : 'post',
            data: this.$httpShop.adornData({
              categoryId: this.dataForm.categoryId || undefined,
              categoryName: this.dataForm.categoryName,
              status: this.dataForm.status,
              seq: this.dataForm.seq,
              grade: this.dataForm.grade,
              parentId: this.dataForm.parentId,
              pic: this.dataForm.pic,
            }),
          }).then(({ result }) => {
            this.$messageE({
              message: '操作成功',
              type: 'success',
              duration: 1000,
              onClose: () => {
                this.isSubmit = false
                this.visible = false
                this.$emit('refreshDataList')
              },
            })
          })
        }
      })
    }),
  },
}
</script>

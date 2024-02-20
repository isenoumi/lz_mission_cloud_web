<template>
  <div class="mod-prod-info">
    <el-card>
      <el-form :model="dataForm" ref="dataForm" label-width="100px">
        <el-form-item label="产品图片">
          <mul-pic-upload v-model="dataForm.imgs" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="dataForm.status">
            <el-radio :label="1">上架</el-radio>
            <el-radio :label="0">下架</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="产品分类" :rules="[{ required: true, message: '请选择产品分类' }]" prop="categoryId">
          <el-col :span="8">
            <el-cascader
              expand-trigger="hover"
              :options="category.list"
              :props="category.props"
              v-model="category.selected"
              change-on-select
              @change="handleCategoryChange"
            >
            </el-cascader>
          </el-col>
        </el-form-item>
        <!-- <el-form-item label="产品分组" :rules="[{ required: true, message: '请选择产品分组' }]">
          <el-col :span="8">
            <el-select v-model="dataForm.tagList" multiple style="width: 250px" placeholder="请选择">
              <el-option v-for="item in this.tags" :key="item.id" :label="item.title" :value="item.id"> </el-option>
            </el-select>
          </el-col>
        </el-form-item> -->
        <el-form-item
          label="产品名称"
          prop="prodName"
          :rules="[
            { required: true, message: '产品名称不能为空' },
            { pattern: /\s\S+|S+\s|\S/, message: '请输入正确的产品名称', trigger: 'blur' },
          ]"
        >
          <el-col :span="8">
            <el-input v-model="dataForm.prodName" placeholder="产品名称" maxlength="50"></el-input>
          </el-col>
        </el-form-item>
        <el-form-item
          label="产品卖点"
          prop="brief"
          :rules="[{ required: false, pattern: /\s\S+|S+\s|\S/, message: '请输入正确的产品卖点', trigger: 'blur' }]"
        >
          <el-col :span="8">
            <el-input
              v-model="dataForm.brief"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 4 }"
              placeholder="产品卖点"
            ></el-input>
          </el-col>
        </el-form-item>
        <el-form-item label="配送方式">
          <!-- <el-checkbox v-model="dataForm.deliveryMode.hasShopDelivery">商家配送</el-checkbox> -->
          <!-- <el-checkbox v-model="dataForm.deliveryMode.hasUserPickUp">用户自提</el-checkbox> -->
          <div>商家配送</div>
        </el-form-item>
        <!-- <prod-transport
          v-show="dataForm.deliveryMode.hasShopDelivery"
          v-model="dataForm.deliveryTemplateId"
        ></prod-transport> -->
        <prod-transport v-model="dataForm.deliveryTemplateId"></prod-transport>
        <sku-tag ref="skuTag" :skuList="dataForm.skuList" @change="skuTagChangeSkuHandler"></sku-tag>
        <sku-table ref="skuTable" v-model="dataForm.skuList" :prodName.sync="dataForm.prodName"></sku-table>

        <el-form-item label="产品详情" prop="content" v-if="tinyShow">
          <!-- <tiny-mce v-model="dataForm.content" ref="content" style="width: 1000px"></tiny-mce> -->
          <!-- <tiny-mce v-model="dataForm.content" ref="content" style="width: 1000px"></tiny-mce> -->
          <JEditor v-model="dataForm.content" width="100%" ref="content" v-if="tinyShow" :key="tinyShow" />
          <!-- <myTiny v-model="dataForm.content" ref="mytinyRef"></myTiny> -->
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { treeDataTranslate, idList } from '@/utils/index2.js'
import MulPicUpload from '@/components/mul-pic-upload'
import ProdTransport from './prod-transport'
import SkuTag from './sku-tag'
import SkuTable from './sku-table'
import TinyMce from '@/components/tiny-mce'
import { Debounce } from '@/utils/debounce'
import myTiny from '../../components/mytiny/mytiny.vue'
import JEditor from '@/components/jeecg/JEditor.vue'
export default {
  inject: ['closeCurrent'],
  data() {
    return {
      tinyShow: false,
      // 分类树展示与回显
      category: {
        list: [],
        selected: [],
        props: {
          value: 'categoryId',
          label: 'categoryName',
        },
      },
      // 规格列表
      dataForm: {
        prodName: '',
        brief: '',
        pic: '',
        imgs: '',
        categoryId: 0,
        prodId: 0,
        skuList: [],
        tagList: [],
        content: '',
        status: 1,
        deliveryMode: {
          hasShopDelivery: false,
          hasUserPickUp: false,
        },
        deliveryTemplateId: null,
      },
      tags: [],
      resourcesUrl: process.env.VUE_APP_RESOURCES_URL,
    }
  },
  components: {
    MulPicUpload,
    ProdTransport,
    TinyMce,
    myTiny,
    SkuTag,
    SkuTable,
    JEditor,
  },
  computed: {
    defalutSku() {
      return this.$store.state.prod.defalutSku
    },
  },
  created() {},
  activated() {
    this.tinyShow = false
    this.dataForm.prodId = this.$route.query.prodId
    this.getDataList()
  },
  mounted() {
    // this.dataForm.prodId = this.$route.query.prodId
    // console.log(this.$route, this.$route.query.prodId)
    // this.getDataList()
  },
  methods: {
    // 获取分类数据
    getDataList() {
      this.tinyShow = false
      this.$nextTick(() => {
        this.tinyShow = true
      })
      this.getTagList()
      this.getCategoryList().then(() => {
        if (this.dataForm.prodId) {
          // 获取产品数据
          this.$httpShop({
            url: this.$httpShop.adornUrl(`/prod/prod/info/${this.dataForm.prodId}`),
            method: 'get',
            params: this.$httpShop.adornParams(),
          }).then(({ result }) => {
            this.dataForm = result
            this.dataForm.deliveryMode = JSON.parse(result.deliveryMode)
            this.$refs.skuTag.init(result.skuList)
            this.$refs.skuTable.init()
            this.category.selected = idList(
              this.category.list,
              this.dataForm.categoryId,
              'categoryId',
              'children'
            ).reverse()
            this.dataForm.tagList = result.tagList
            this.$nextTick(() => {
              // this.$refs.content.setContent(this.dataForm.content)
              console.log(this.dataForm.content)
            })
          })
        } else {
          this.$nextTick(() => {
            this.$refs['dataForm'].resetFields()
            this.$refs.skuTag.init()
            this.dataForm.pic = ''
            this.dataForm.imgs = ''
            this.category.selected = ''
            this.dataForm.content = ''
          })
        }
      })
    },
    // 获取分类信息
    getCategoryList() {
      return this.$httpShop({
        url: this.$httpShop.adornUrl('/prod/category/listCategory'),
        method: 'get',
        params: this.$httpShop.adornParams(),
      }).then(({ result }) => {
        this.category.list = treeDataTranslate(result, 'categoryId', 'parentId')
      })
    },
    // 选择分类改变事件
    handleCategoryChange(val) {
      this.dataForm.categoryId = val[val.length - 1]
    },
    // 表单提交
    dataFormSubmit: Debounce(function () {
      this.dataForm.deliveryMode.hasShopDelivery = true
      this.$refs['dataForm'].validate((valid) => {
        if (!valid) {
          return
        }
        if (!this.dataForm.imgs) {
          this.errorMsg('请选择图片上传')
          return
        }
        if (!this.dataForm.deliveryMode) {
          this.errorMsg('请选择配送方式')
          return
        }
        // if (this.dataForm.deliveryMode.hasShopDelivery && !this.dataForm.deliveryTemplateId) {
        //   this.errorMsg('请选择运费模板')
        //   return
        // }
        let param = Object.assign({}, this.dataForm)
        // 设置价格和库存
        this.paramSetPriceAndStocks(param)

        param.deliveryMode = undefined
        param.deliveryModeVo = this.dataForm.deliveryMode
        // 商品主图
        param.pic = this.dataForm.imgs.split(',')[0]
        this.$httpShop({
          url: this.$httpShop.adornUrl(`/prod/prod`),
          method: param.prodId ? 'put' : 'post',
          data: this.$httpShop.adornData(param),
        }).then(({ data }) => {
          this.$messageE({
            message: '操作成功',
            type: 'success',
            duration: 1500,
            onClose: () => {
              this.visible = false
              // this.$store.commit('common/removeMainActiveTab')
              this.closeCurrent()
              this.tinyShow = false
              this.$emit('refreshDataList')
              this.$router.push('/prodList')
            },
          })
        })
      })
    }),
    paramSetPriceAndStocks(param) {
      console.log('this.dataForm.skuList', this.dataForm.skuList[0].points)

      // 商品积分
      param.points = this.dataForm.skuList[0].points
      // 获取规格属性信息
      // param.skuList = this.$refs.prodSpec.getTableSpecData()
      // 商品库存
      param.totalStocks = 0
      // 商品价格
      param.price = 0
      // 商品原价
      param.oriPrice = 0
      // 商品实际库存
      for (let i = 0; i < param.skuList.length; i++) {
        const element = param.skuList[i]
        if (element.status !== 1) {
          continue
        }
        if (param.price === 0) {
          param.price = element.price ? Number.parseFloat(element.price) : 0
        }
        // 商品价格为最低价的那件商品的价格
        param.price = Math.min(param.price, element.price)
        if (param.price === element.price) {
          param.oriPrice = element.oriPrice ? Number.parseFloat(element.oriPrice) : 0
        }
        param.totalStocks += element.stocks ? Number.parseInt(element.stocks) : 0
      }
      // 如果sku没有商品名称，则使用商品的商品名称
      if (param.skuList.length === 1) {
        param.skuList[0].prodName = this.dataForm.prodName
      }
    },
    skuTagChangeSkuHandler(skuList) {
      const prodName = this.dataForm.prodName
      skuList.forEach((sku) => {
        if (sku.properties) {
          sku.skuName = ''
          let properties = sku.properties.split(';')
          for (const propertiesKey in properties) {
            sku.skuName += properties[propertiesKey].split(':')[1] + ' '
          }
          sku.prodName = prodName + ' ' + sku.skuName
        }
      })
      this.dataForm.skuList = skuList
    },
    errorMsg(message) {
      this.$messageE({
        message: message,
        type: 'error',
        duration: 1500,
      })
    },
    // 获取所有的分组信息
    getTagList() {
      // this.$httpShop({
      //   url: this.$httpShop.adornUrl('/prod/prodTag/listTagList'),
      //   method: 'get',
      //   params: this.$httpShop.adornParams(),
      // }).then(({ data }) => {
      //   this.tags = data
      // })
    },
  },
}
</script>

<style>
</style>

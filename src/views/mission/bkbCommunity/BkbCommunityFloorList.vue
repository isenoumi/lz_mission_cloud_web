<template>
  <a-card :bordered='false' :class="'cust-erp-sub-tab'">
    <!-- 查询区域 -->
    <div class='table-page-search-wrapper'>
      <a-form layout='inline' @keyup.enter.native='searchQuery'>
        <a-row :gutter='24'>
        </a-row>
      </a-form>
    </div>
    <!-- 查询区域-END -->

    <!-- 操作按钮区域 -->
    <div class='table-operator' v-if='mainId'>
      <a-button @click='handleAdd' type='primary' icon='plus'>新增</a-button>
      <a-button type='primary' icon='download' @click="handleExportXls('楼栋')">导出</a-button>
      <a-upload
        name='file'
        :showUploadList='false'
        :multiple='false'
        :headers='tokenHeader'
        :action='importExcelUrl'
        @change='handleImportExcel'>
        <a-button type='primary' icon='import'>导入</a-button>
      </a-upload>
<!--      <a-button @click='openFloorAndUnit()' type='link' icon='plus'>生成楼栋和单元</a-button>-->
      <a-dropdown v-if='selectedRowKeys.length > 0'>
        <a-menu slot='overlay'>
          <a-menu-item key='1' @click='batchDel'>
            <a-icon type='delete' />
            删除
          </a-menu-item>
        </a-menu>
        <a-button style='margin-left: 8px'> 批量操作
          <a-icon type='down' />
        </a-button>
      </a-dropdown>
    </div>

    <!-- table区域-begin -->
    <div>
      <div class='ant-alert ant-alert-info' style='margin-bottom: 16px;'>
        <i class='anticon anticon-info-circle ant-alert-icon'></i> 已选择 <a
        style='font-weight: 600'>{{ selectedRowKeys.length }}</a>项
        <a style='margin-left: 24px' @click='onClearSelected'>清空</a>
      </div>

      <a-table
        ref='table'
        size='middle'
        bordered
        rowKey='id'
        :scroll='{x:true}'
        :columns='columns'
        :dataSource='dataSource'
        :pagination='ipagination'
        :loading='loading'
        :rowSelection='{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}'
        @change='handleTableChange'>

        <template slot='htmlSlot' slot-scope='text'>
          <div v-html='text'></div>
        </template>
        <template slot='imgSlot' slot-scope='text,record'>
          <span v-if='!text' style='font-size: 12px;font-style: italic;'>无图片</span>
          <img v-else :src='getImgView(text)' :preview='record.id' height='25px' alt=''
               style='max-width:80px;font-size: 12px;font-style: italic;' />
        </template>
        <template slot='fileSlot' slot-scope='text'>
          <span v-if='!text' style='font-size: 12px;font-style: italic;'>无文件</span>
          <a-button
            v-else
            :ghost='true'
            type='primary'
            icon='download'
            size='small'
            @click='downloadFile(text)'>
            下载
          </a-button>
        </template>

        <span slot='action' slot-scope='text, record'>
          <a @click='handleEdit(record)'>编辑</a>
          <a-divider type='vertical' />
          <a-popconfirm title='确定删除吗?' @confirm='() => handleDelete(record.id)'>
            <a>删除</a>
          </a-popconfirm>
        </span>

      </a-table>
    </div>

    <bkbCommunityFloor-modal ref='modalForm' @ok='modalFormOk' :mainId='mainId'></bkbCommunityFloor-modal>
    <!--    // 查看模态框-->
    <a-modal
      title='生成楼栋和单元'
      :visible='checkVisible'
      :confirm-loading='confirmLoading'
      @ok='handleOk'
      @cancel='handleCancel'
      :width='1300'
    >
      <a-spin :spinning='confirmLoading'>
        <a-form-model ref='form' :model='model' :rules='validatorRules'>
          <a-row>
            <a-col :span='8'>
              <a-form-model-item label='楼栋开始编号' :labelCol='labelCol' :wrapperCol='wrapperCol' prop='floorStart'>
                <a-input-number v-model='model.floorStart' placeholder='请输入楼栋开始编号' suffix='栋' style='width: 100%' />
              </a-form-model-item>
            </a-col>
            <a-col :span='8'>
              <a-form-model-item label='楼栋结束编号' :labelCol='labelCol' :wrapperCol='wrapperCol' prop='floorEnd'>
                <a-input-number v-model='model.floorEnd' placeholder='请输入楼栋结束编号' suffix='栋' style='width: 100%' />
              </a-form-model-item>
            </a-col>
            <a-col :span='8'>
              <a-form-model-item label='楼栋户数' :labelCol='labelCol' :wrapperCol='wrapperCol' prop='floorTenement'>
                <a-input-number v-model='model.floorTenement' placeholder='请输入楼栋户数' suffix='户' style='width: 100%' />
              </a-form-model-item>
            </a-col>
            <a-col :span='8'>
              <a-form-model-item label='单元开始编号' :labelCol='labelCol' :wrapperCol='wrapperCol' prop='unitStart'>
                <a-input-number v-model='model.unitStart' placeholder='请输入单元开始编号' suffix='单元' style='width: 100%' />
              </a-form-model-item>
            </a-col>
            <a-col :span='8'>
              <a-form-model-item label='单元结束编号' :labelCol='labelCol' :wrapperCol='wrapperCol' prop='unitEnd'>
                <a-input-number v-model='model.unitEnd' placeholder='请输入单元结束编号' suffix='单元' style='width: 100%' />
              </a-form-model-item>
            </a-col>
            <a-col :span='8'>
              <a-form-model-item label='单元户数' :labelCol='labelCol' :wrapperCol='wrapperCol' prop='unitTenement'>
                <a-input-number v-model='model.unitTenement' placeholder='请输入单元户数' suffix='户' style='width: 100%' />
              </a-form-model-item>
            </a-col>
          </a-row>
        </a-form-model>
      </a-spin>
    </a-modal>
  </a-card>
</template>

<script>

import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import BkbCommunityFloorModal from './modules/BkbCommunityFloorModal'
import { postAction } from '../../../api/manage'

export default {
  name: 'BkbCommunityFloorList',
  mixins: [JeecgListMixin],
  components: { BkbCommunityFloorModal },
  props: {
    mainId: {
      type: String,
      default: '',
      required: false
    }
  },
  watch: {
    mainId: {
      immediate: true,
      handler(val) {
        if (!this.mainId) {
          this.clearList()
        } else {
          this.queryParam['communityId'] = val
          this.loadData(1)
        }
      }
    }
  },
  data() {
    return {
      description: '小区管理页面',
      disableMixinCreated: true,
      checkVisible: false,// false 时模态框关闭
      confirmLoading: false,
      // 表头
      columns: [
        {
          title: '#',
          dataIndex: '',
          key: 'rowIndex',
          width: 60,
          align: 'center',
          customRender: function(t, r, index) {
            return parseInt(index) + 1
          }
        },
        {
          title: '楼栋号',
          align: 'center',
          sorter: true,
          dataIndex: 'floornumber'
        },
        {
          title: '楼栋住户数',
          align: 'center',
          sorter: true,
          dataIndex: 'tenement'
        },
        {
          title: '状态',
          align: 'center',
          sorter: true,
          dataIndex: 'status_dictText'
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          fixed: 'right',
          width: 147,
          scopedSlots: { customRender: 'action' }
        }
      ],
      url: {
        list: '/mission/bkbCommunity/listBkbCommunityFloorByMainId',
        delete: '/mission/bkbCommunity/deleteBkbCommunityFloor',
        deleteBatch: '/mission/bkbCommunity/deleteBatchBkbCommunityFloor',
        exportXlsUrl: '/mission/bkbCommunity/exportBkbCommunityFloor',
        importUrl: '/mission/bkbCommunity/importBkbCommunityFloor',
        floorAndUnitUrl: '/mission/bkbCommunity/addBkbCommunityFloorUnit'
      },
      dictOptions: {
        status: []
      },
      model: {
        floorStart: 1,
        floorEnd: 10,
        unitStart: 1,
        unitEnd: 5,
        floorTenement: 1000,
        unitTenement: 0,
        communityId: this.mainId
      },
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      },
      validatorRules: {
        floorStart: [
          { required: true, message: '请输入楼栋开始编号!' }
        ],
        floorEnd: [
          { required: true, message: '请输入楼栋结束编号!' }
        ],
        floorTenement: [
          { required: true, message: '请输入楼栋户数!' }
        ],
        unitStart: [
          { required: true, message: '请输入单元开始编号!' }
        ],
        unitEnd: [
          { required: true, message: '请输入单元结束编号!' }
        ]
      }
    }
  },
  created() {
  },
  computed: {
    importExcelUrl() {
      return `${window._CONFIG['domianURL']}/${this.url.importUrl}/${this.mainId}`
    }
  },
  methods: {
    clearList() {
      this.dataSource = []
      this.selectedRowKeys = []
      this.ipagination.current = 1
    },
    openFloorAndUnit() {
      this.checkVisible = true
    },
    handleOk(e) {
      this.confirmLoading = true
      this.model.communityId = this.mainId
      postAction(this.url.floorAndUnitUrl, this.model).then((res) => {
        if (res.success) {
          this.checkVisible = false
          this.confirmLoading = false
          this.reCalculatePage(1)
          this.loadData()
        } else {
          this.$message.warning(res.message)
          this.checkVisible = false
          this.confirmLoading = false
        }
      })
    },
    handleCancel(e) {
      this.checkVisible = false
    }
  }
}
</script>
<style scoped>
@import '~@assets/less/common.less';
</style>

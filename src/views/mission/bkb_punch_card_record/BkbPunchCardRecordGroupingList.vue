<template>
  <a-card :bordered='false'>
    <!-- 查询区域 -->
    <div class='table-page-search-wrapper'>
      <a-form layout='inline' @keyup.enter.native='searchQuery'>
        <a-row :gutter='24'>
          <a-col :xl='8' :lg='8' :md='8' :sm='24'>
            <a-form-item label='打卡用户手机号'>
              <a-input placeholder='请输入打卡用户手机号' v-model='queryParam.punchCardPhone'></a-input>
            </a-form-item>
          </a-col>
          <a-col :xl='6' :lg='7' :md='8' :sm='24'>
            <span style='float: left;overflow: hidden;' class='table-page-search-submitButtons'>
              <a-button type='primary' @click='g_searchQuery' icon='search'>查询</a-button>
              <a-button type='primary' @click='g_searchReset' icon='reload' style='margin-left: 8px'>重置</a-button>
            </span>
          </a-col>
          <a-col :xl='6' :lg='7' :md='8' :sm='24' :offset='4'>
            <a-descriptions title='' bordered>
              <a-descriptions-item label='总积分'>
                {{ pointsSummary.dk }}
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <!-- 查询区域-END -->

    <!-- 操作按钮区域 -->
    <div class='table-operator'>
      <!--      <a-button @click='handleAdd' type='primary' icon='plus'>新增</a-button>-->
      <!--      <a-button type="primary" icon="download" @click="handleExportXls('打卡记录')">导出</a-button>-->
      <!--      <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrl" @change="handleImportExcel">-->
      <!--        <a-button type="primary" icon="import">导入</a-button>-->
      <!--      </a-upload>-->
      <!--      &lt;!&ndash; 高级查询区域 &ndash;&gt;-->
      <!--      <j-super-query :fieldList="superFieldList" ref="superQueryModal" @handleSuperQuery="handleSuperQuery"></j-super-query>-->
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
      <a-table
        ref='table'
        size='middle'
        :scroll='{x:true}'
        bordered
        rowKey='id'
        :columns='columns'
        :dataSource='dataSource'
        :pagination='ipagination'
        :loading='loading'
        class='j-table-force-nowrap'
        @change='handleTableChange2'>

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
                          <a @click='handleDetail(record)'>详情</a>

        </span>

      </a-table>
    </div>

    <bkb-punch-card-record-grouping-modal ref='modalForm' @ok='modalFormOk'></bkb-punch-card-record-grouping-modal>
  </a-card>
</template>

<script>

import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import BkbPunchCardRecordGroupingModal from './modules/BkbPunchCardRecordGroupingModal'
import { getAction } from '../../../api/manage'

export default {
  name: 'BkbPunchCardRecordGroupingList',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    BkbPunchCardRecordGroupingModal
  },
  data() {
    return {
      //积分汇总
      pointsSummary: {},
      description: '打卡记录管理页面',
      // 表头
      columns: [
        {
          title: '序号',
          dataIndex: '',
          key: 'rowIndex',
          width: 60,
          align: 'center',
          customRender: function(t, r, index) {
            return parseInt(index) + 1
          }
        },
        {
          title: '打卡用户手机号',
          align: 'center',
          dataIndex: 'punchCardPhone'
        },
        {
          title: '累计打卡次数',
          align: 'center',
          dataIndex: 'punchCardIntegral'
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
        list: '/mission/bkbPunchCardRecord/list',
        list_group: '/mission/bkbPunchCardRecord/list_group',
        integralRecordSummation: '/mission/bkbOperatingRecord/integralRecordSummation',
        delete: '/mission/bkbPunchCardRecord/delete',
        deleteBatch: '/mission/bkbPunchCardRecord/deleteBatch',
        exportXlsUrl: '/mission/bkbPunchCardRecord/exportXls',
        importExcelUrl: 'mission/bkbPunchCardRecord/importExcel'

      },
      dictOptions: {},
      superFieldList: []
    }
  },
  created() {
    this.getSuperFieldList()
  },
  computed: {
    importExcelUrl: function() {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
    }
  },
  methods: {
    initDictConfig() {
      this.is_loading = false
      getAction(this.url.list_group).then(res => {
        if (res.success) {
          console.error(res)
          this.dataSource = res.result.records
        }
      })
      //积分汇总
      getAction(this.url.integralRecordSummation).then(res => {
        if (res.success) {
          console.error(res)
          this.pointsSummary = res.result
        }
      })
    },
    g_searchQuery() {
      this.g_loadData(1)
      this.selectedRowKeys = []
      this.selectionRows = []
    },
    g_searchReset() {
      this.queryParam = {}
      this.g_loadData(1)
    },
    g_loadData(arg) {
      if (!this.url.list_group) {
        this.$message.error('请设置url.list属性!')
        return
      }
      //加载数据 若传入参数1则加载第一页的内容
      if (arg === 1) {
        this.ipagination.current = 1
      }
      let params = this.getQueryParams()//查询条件
      this.loading = true
      getAction(this.url.list_group, params).then((res) => {
        if (res.success) {
          //update-begin---author:zhangyafei    Date:20201118  for：适配不分页的数据列表------------
          this.dataSource = res.result.records || res.result
          if (res.result.total) {
            this.ipagination.total = res.result.total
          } else {
            this.ipagination.total = 0
          }
          //update-end---author:zhangyafei    Date:20201118  for：适配不分页的数据列表------------
        } else {
          this.$message.warning(res.message)
        }
      }).finally(() => {
        this.loading = false
      })
    },
    //重新定义分页事件
    handleTableChange2(pagination, filters, sorter) {
      //分页、排序、筛选变化时触发
      //TODO 筛选
      console.error(pagination)
      if (Object.keys(sorter).length > 0) {
        this.isorter.column = sorter.field
        this.isorter.order = 'ascend' == sorter.order ? 'asc' : 'desc'
      }
      this.ipagination = pagination
      this.g_loadData()
    },
    getSuperFieldList() {
      let fieldList = []
      fieldList.push({ type: 'string', value: 'punchCardPhone', text: '打卡用户手机号', dictCode: '' })
      fieldList.push({ type: 'string', value: 'punchCardDescribe', text: '打卡描述', dictCode: '' })
      fieldList.push({ type: 'int', value: 'punchCardIntegral', text: '打卡积分', dictCode: '' })
      fieldList.push({ type: 'string', value: 'punchCardArrayUrl', text: '打卡图片', dictCode: '' })
      this.superFieldList = fieldList
    }
  }
}
</script>
<style scoped>
@import '~@assets/less/common.less';
</style>
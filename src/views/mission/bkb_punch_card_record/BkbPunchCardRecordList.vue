<template>
  <a-card :bordered='false'>
    <!-- 操作按钮区域 -->
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
                          <a @click='handleDetail(record)'>详情</a>
        </span>

      </a-table>
    </div>

    <bkb-punch-card-record-modal ref='modalForm' @ok='modalFormOk'></bkb-punch-card-record-modal>
  </a-card>
</template>

<script>

import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import BkbPunchCardRecordModal from './modules/BkbPunchCardRecordModal'

export default {
  name: 'BkbPunchCardRecordList',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    BkbPunchCardRecordModal
  },
  data() {
    return {
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
          title: '打卡时间',
          align: 'center',
          dataIndex: 'createTime'
        },
        {
          title: '打卡用户手机号',
          align: 'center',
          dataIndex: 'punchCardPhone'
        },
        {
          title: '打卡描述',
          align: 'center',
          dataIndex: 'punchCardDescribe'
        },
        {
          title: '打卡积分',
          align: 'center',
          dataIndex: 'punchCardIntegral'
        },
        {
          title: '打卡图片',
          align: 'center',
          dataIndex: 'punchCardArrayUrl',
          scopedSlots: { customRender: 'imgSlot' }
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
    this.initDictConfig()
  },
  computed: {
    importExcelUrl: function() {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
    }
  },
  methods: {
    initDictConfig() {
      this.is_loading = false
    },
    load_data(v) {
      this.queryParam.punchCardPhone = v.punchCardPhone
      this.$nextTick(() => {
        this.searchQuery()
      })
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
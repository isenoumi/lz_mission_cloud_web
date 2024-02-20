<template>
  <a-card :bordered='false'>

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

    <bkb-inviter-record-modal ref='modalForm' @ok='modalFormOk'></bkb-inviter-record-modal>
  </a-card>
</template>

<script>

import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import BkbInviterRecordModal from './modules/BkbInviterRecordModal'

export default {
  name: 'BkbInviterRecordList',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    BkbInviterRecordModal
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
          title: '被邀请人手机号',
          align: 'center',
          dataIndex: 'inviteOpenid'
        },
        {
          title: '所获得积分',
          align: 'center',
          dataIndex: 'getIntegral'
        },
        {
          title: '邀请日期',
          align: 'center',
          dataIndex: 'createTime'
        }
      ],
      url: {
        list: '/mission/bkbInviterRecord/list',
        delete: '/mission/bkbInviterRecord/delete',
        deleteBatch: '/mission/bkbInviterRecord/deleteBatch',
        exportXlsUrl: '/mission/bkbInviterRecord/exportXls',
        importExcelUrl: 'mission/bkbInviterRecord/importExcel'
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
      this.queryParam.theInvitePhone = v.theInvitePhone
      this.$nextTick(() => {
        this.searchQuery()
      })
    },
    getSuperFieldList() {
      let fieldList = []
      fieldList.push({ type: 'string', value: 'theInvitePhone', text: '邀请人手机号', dictCode: '' })
      fieldList.push({ type: 'string', value: 'invitePhone', text: '被邀请人手机号', dictCode: '' })
      fieldList.push({ type: 'int', value: 'activityIntegral', text: '活动积分', dictCode: '' })
      fieldList.push({ type: 'int', value: 'getIntegral', text: '所获得积分', dictCode: '' })
      fieldList.push({ type: 'datetime', value: 'dateInvitation', text: '邀请日期' })
      this.superFieldList = fieldList
    }
  }
}
</script>
<style scoped>
@import '~@assets/less/common.less';
</style>
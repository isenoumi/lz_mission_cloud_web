<template>
  <a-card :bordered='false'>
    <!-- 查询区域 -->
    <div class='table-page-search-wrapper'>
      <a-form layout='inline' @keyup.enter.native='searchQuery'>
        <a-row :gutter='24'>
          <a-col :xl='6' :lg='7' :md='8' :sm='24'>
            <a-form-item label='手机号'>
              <a-input placeholder='请输入邀请人手机号' v-model='queryParam.theInvitePhone'></a-input>
            </a-form-item>
          </a-col>
          <!--          <a-col :xl='6' :lg='7' :md='8' :sm='24'>-->
          <!--            <a-form-item label='邀请日期'>-->
          <!--              <j-date :show-time='true' date-format='YYYY-MM-DD HH:mm:ss' placeholder='请选择邀请日期'-->
          <!--                      v-model='queryParam.dateInvitation'></j-date>-->
          <!--            </a-form-item>-->
          <!--          </a-col>-->
          <a-col :xl='6' :lg='7' :md='8' :sm='24'>
            <span style='float: left;overflow: hidden;' class='table-page-search-submitButtons'>
              <a-button type='primary' @click='g_searchQuery' icon='search'>查询</a-button>
              <a-button type='primary' @click='g_searchReset' icon='reload' style='margin-left: 8px'>重置</a-button>
              <!--              <a @click='handleToggleSearch' style='margin-left: 8px'>-->
              <!--                {{ toggleSearchStatus ? '收起' : '展开' }}-->
              <!--                <a-icon :type="toggleSearchStatus ? 'up' : 'down'" />-->
              <!--              </a>-->
            </span>
          </a-col>

          <a-col :xl='6' :lg='7' :md='8' :sm='24' :offset="6">
            <a-descriptions title="" bordered>
              <a-descriptions-item label="总积分">
                {{ jf_sum() }}
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
      <!--      <a-button type='primary' icon='download' @click="handleExportXls('打卡记录')">导出</a-button>-->
      <!--      <a-upload name='file' :showUploadList='false' :multiple='false' :headers='tokenHeader' :action='importExcelUrl'-->
      <!--                @change='handleImportExcel'>-->
      <!--        <a-button type='primary' icon='import'>导入</a-button>-->
      <!--      </a-upload>-->
      <!--      &lt;!&ndash; 高级查询区域 &ndash;&gt;-->
      <!--      <j-super-query :fieldList='superFieldList' ref='superQueryModal'-->
      <!--                     @handleSuperQuery='handleSuperQuery'></j-super-query>-->
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
      <!--      <div class='ant-alert ant-alert-info' style='margin-bottom: 16px;'>-->
      <!--        <i class='anticon anticon-info-circle ant-alert-icon'></i> 已选择 <a-->
      <!--        style='font-weight: 600'>{{ selectedRowKeys.length }}</a>项-->
      <!--        <a style='margin-left: 24px' @click='onClearSelected'>清空</a>-->
      <!--      </div>-->

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
        :rowSelection='{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}'
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
          <!--          <a @click="handleEdit(record)">编辑</a>-->

          <!--          <a-divider type="vertical" />-->
          <!--          <a-dropdown>-->
          <!--            <a class="ant-dropdown-link">更多 <a-icon type="down" /></a>-->
          <!--            <a-menu slot="overlay">-->
          <!--              <a-menu-item>-->
          <!--                <a @click="handleDetail(record)">详情</a>-->
          <!--              </a-menu-item>-->
          <!--              <a-menu-item>-->
          <!--                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">-->
          <!--                  <a>删除</a>-->
          <!--                </a-popconfirm>-->
          <!--              </a-menu-item>-->
          <!--            </a-menu>-->
          <!--          </a-dropdown>-->
        </span>

      </a-table>
    </div>

    <bkb-inviter-record-grouping-modal ref='modalForm' @ok='modalFormOk'></bkb-inviter-record-grouping-modal>
  </a-card>
</template>

<script>

import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import BkbInviterRecordGroupingModal from './modules/BkbInviterRecordGroupingModal'
import { getAction } from '../../../api/manage'

export default {
  name: 'BkbInviterRecordGroupingList',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    BkbInviterRecordGroupingModal
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
          title: '邀请人手机号',
          align: 'center',
          dataIndex: 'theInvitePhone'
        },
        {
          title: '邀请人数',
          align: 'center',
          dataIndex: 'activityIntegral'
        },
        {
          title: '活动积分',
          align: 'center',
          dataIndex: 'getIntegral'
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
        list: '/mission/bkbInviterRecord/list',
        list_group: '/mission/bkbInviterRecord/list_group',
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
  },
  computed: {
    importExcelUrl: function() {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
    }
  },
  methods: {
    jf_sum() {
      return this.dataSource.reduce((accumulator, currentObject) => {
        return accumulator + currentObject.getIntegral
      }, 0)
    },
    initDictConfig() {
      this.is_loading = false
      getAction(this.url.list_group).then(res => {
        if (res.success) {
          console.error(res)
          this.dataSource = res.result.records
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
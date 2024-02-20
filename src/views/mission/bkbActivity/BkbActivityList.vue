<template>
  <a-card :bordered='false'>
    <!-- 查询区域 -->
    <div class='table-page-search-wrapper'>
      <a-form layout='inline' @keyup.enter.native='searchQuery'>
        <a-row :gutter='24'>
          <a-col :xl='6' :lg='7' :md='8' :sm='24'>
            <a-form-item label='活动名称'>
              <a-input placeholder='请输入活动名称' v-model='queryParam.name'></a-input>
            </a-form-item>
          </a-col>

          <!--          <template v-if="toggleSearchStatus">-->
          <!--          <a-col :xl="6" :lg="7" :md="8" :sm="24">-->
          <!--            <a-form-item label="演讲员">-->
          <!--              <j-dict-select-tag placeholder="请输入演讲员" v-model="queryParam.speakerId"-->
          <!--                                 dictCode="bkb_speaker,name,id,id" />-->
          <!--            </a-form-item>-->
          <!--          </a-col>-->
          <a-col :xl='6' :lg='7' :md='8' :sm='24'>
            <a-form-item label='状态'>
              <j-dict-select-tag placeholder='请选择状态' v-model='queryParam.status' dictCode='activity_status' />
            </a-form-item>
          </a-col>
          <a-col :xl='6' :lg='7' :md='8' :sm='24'>
            <a-form-item label='计划开始日期'>
              <j-date placeholder='请选择计划开始日期'
                      :show-time="{ format: 'HH:mm' }"
                      date-format='YYYY-MM-DD HH:mm'
                      v-model='queryParam.startDate'></j-date>
            </a-form-item>
          </a-col>
          <!--          </template>-->
          <a-col :xl='6' :lg='7' :md='8' :sm='24'>
            <span style='float: left;overflow: hidden;' class='table-page-search-submitButtons'>
              <a-button type='primary' @click='searchQuery' icon='search'>查询</a-button>
              <a-button type='primary' @click='searchReset' icon='reload' style='margin-left: 8px'>重置</a-button>
              <!--              <a @click="handleToggleSearch" style="margin-left: 8px">-->
              <!--                {{ toggleSearchStatus ? '收起' : '展开' }}-->
              <!--                <a-icon :type="toggleSearchStatus ? 'up' : 'down'" />-->
              <!--              </a>-->
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <!-- 查询区域-END -->

    <!-- 操作按钮区域 -->
    <div class='table-operator'>
      <a-button @click='handleAdd' type='primary' icon='plus'>新增</a-button>
      <a-button type='primary' icon='download' @click="handleExportXls('bkb_activity')">导出</a-button>
      <a-upload name='file' :showUploadList='false' :multiple='false' :headers='tokenHeader' :action='importExcelUrl'
                @change='handleImportExcel'>
        <!--        <a-button type="primary" icon="import">导入</a-button>-->
      </a-upload>
      <!-- 高级查询区域 -->
      <j-super-query :fieldList='superFieldList' ref='superQueryModal'
                     @handleSuperQuery='handleSuperQuery'></j-super-query>
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
        rowKey='id'
        class='j-table-force-nowrap'
        :scroll='{x:true}'
        :columns='columns'
        :dataSource='dataSource'
        :pagination='ipagination'
        :loading='loading'
        :expandedRowKeys='expandedRowKeys'
        @change='handleTableChange'
        @expand='handleExpand'
        v-bind='tableProps'>

        <template slot='imgSlot' slot-scope='text,record'>
          <span v-if='!text' style='font-size: 12px;font-style: italic;'>无图片</span>
          <img v-else :src='getImgView(text)' :preview='record.id' height='25px' alt=''
               style='max-width:80px;font-size: 12px;font-style: italic;' />
        </template>

        <template slot='speakerId' slot-scope='text, record'>
          <a-tag v-for="(action, index) in record.speakerId?record.speakerId.split(','):[]" :key='index'>
            {{ label(action) }}
          </a-tag>
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
<!--          <div v-if="record.portId === 'B'">-->
          <!--              <span v-if="record.status === 20">-->
          <!--                <a @click="handleAddChild(record)">新增</a>-->
          <!--              </span>-->
          <!--          </div> -->

          <div>
              <span v-if='username===record.createBy'>
                <a @click='handleEdit(record)'>编辑</a>
                <a-divider type='vertical' />
              </span>
              <span v-if='username===record.createBy && record.portId === "B" && record.status === 30'>
                <a-popconfirm title='确定要下发任务吗?' @confirm='() => sendActivity(record)' placement='topLeft'>
                  <a>下发</a>
                </a-popconfirm>
                <a-divider type='vertical' />
              </span>

              <span>
                    <a @click='view(record)'>详情</a>
              </span>
            <!--                <span>-->
            <!--                      <a @click='handleAddChild(record)'>添加下级</a>-->
            <!--                       <a-divider type='vertical' />-->
            <!--                </span>-->
            <!--                  <span v-if='record.status === 10'>-->
                  <span v-if='username===record.createBy && record.portId === "B" && record.status === 30'>
                                    <a-divider type='vertical' />
                        <a-popconfirm title='确定删除吗?' @confirm='() => handleDeleteNode(record.id)'
                                      placement='topLeft'>
                          <a>删除</a>
                        </a-popconfirm>
                  </span>
          </div>
        </span>

      </a-table>
    </div>

    <BkbActivityView ref='modalView'></BkbActivityView>
    <bkbActivity-modal ref='modalForm' @ok='modalFormOk'></bkbActivity-modal>
  </a-card>
</template>

<script>

import { deleteAction, getAction, postAction } from '@/api/manage'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import BkbActivityModal from './modules/BkbActivityModal'
import { filterObj } from '@/utils/util'
import store from '@/store'
import BkbActivityView from '@views/mission/bkbActivity/modules/BkbActivityView'

const username = store.getters.userInfo.username

export default {
  name: 'BkbActivityList',
  mixins: [JeecgListMixin],
  components: {
    BkbActivityModal,
    BkbActivityView
  },
  data() {
    return {
      username,
      description: 'bkb_activity管理页面',
      // 表头
      columns: [
        {
          title: '活动名称',
          align: 'left',
          dataIndex: 'name'
        },
        {
          title: '类型',
          align: 'left',
          dataIndex: 'type_dictText'
        },
        {
          title: '计划开始日期',
          align: 'left',
          dataIndex: 'startDate'
          // customRender: function(text) {
          //   return !text ? '' : (text.length > 10 ? text.substr(0, 10) : text)
          // }
        },
        // {
        //   title: '计划开始时间',
        //   align: 'left',
        //   dataIndex: 'startTime',
        //   // customRender: function(text) {
        //   //   return !text ? '' : (text.length > 10 ? text.substr(0, 10) : text)
        //   // }
        // },
        {
          title: '活动时长',
          align: 'left',
          dataIndex: 'activityTime'
        },
        {
          title: '状态',
          align: 'left',
          dataIndex: 'status_dictText'
        },
        // {
        //   title: '更新人',
        //   align: 'left',
        //   dataIndex: 'updateBy'
        // },
        {
          title: '演讲员',
          align: 'left',
          dataIndex: 'speakerId',
          scopedSlots: { customRender: 'speakerId' }
        },
        // {
        //   title: '备注',
        //   align: 'left',
        //   dataIndex: 'remark'
        // },
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
        list: '/mission/bkbActivity/rootList',
        childList: '/mission/bkbActivity/childList',
        reception: '/mission/bkbActivity/acceptanceOfActivities',
        getChildListBatch: '/mission/bkbActivity/getChildListBatch',
        delete: '/mission/bkbActivity/delete',
        sendActivity: '/mission/bkbActivity/send_activity',
        deleteBatch: '/mission/bkbActivity/deleteBatch',
        queryingAllLabels: '/mission/bkbSpeaker/queryingAllLabels',
        exportXlsUrl: '/mission/bkbActivity/exportXls',
        importExcelUrl: 'mission/bkbActivity/importExcel'
      },
      tag_data: [],// 标签组
      expandedRowKeys: [],
      hasChildrenField: 'hasChild',
      pidField: 'pid',
      dictOptions: {},
      loadParent: false,
      superFieldList: []
    }
  },
  created() {
    this.getSuperFieldList()
  },
  computed: {
    importExcelUrl() {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
    },
    tableProps() {
      let _this = this
      return {
        // 列表项是否可选择
        rowSelection: {
          selectedRowKeys: _this.selectedRowKeys,
          onChange: (selectedRowKeys) => _this.selectedRowKeys = selectedRowKeys
        }
      }
    }
  },
  methods: {
    loadData(arg) {
      if (arg == 1) {
        this.ipagination.current = 1
      }
      this.loading = true
      let params = this.getQueryParams()
      params.hasQuery = 'true'
      getAction(this.url.queryingAllLabels).then(res => {
        if (res.success) {
          this.tag_data = res.result
        }
      })
      getAction(this.url.list, params).then(res => {
        if (res.success) {
          let result = res.result
          if (Number(result.total) > 0) {
            this.ipagination.total = Number(result.total)
            this.dataSource = this.getDataByResult(res.result.records)
            return this.loadDataByExpandedRows(this.dataSource)
          } else {
            this.ipagination.total = 0
            this.dataSource = []
          }
        } else {
          this.$message.warning(res.message)
        }
      }).finally(() => {
        this.loading = false
      })
    },
    view(record) {
      this.loadParent = true
      this.$refs.modalView.view(record, record.portId === 'C' || record.portId === 'D')
      this.loadData()
    },
    reception(record) {
      this.loadParent = true
      console.warn(record)
      getAction(this.url.reception, { id: record.id }).then((res) => {
        if (res.success) {
          if (res.result.records) {
            this.$message.success('接收活动成功!')
          }
        } else {
          this.$message.warning('接收活动失败!')
        }
      }).finally(() => {
        this.loadData()
      })
    },
    label(v) {
      this.tag_data.filter(value => {
        if (value.value == v) {
          v = value.label
        }
      })
      return v
    },
    // 根据已展开的行查询数据（用于保存后刷新时异步加载子级的数据）
    loadDataByExpandedRows(dataList) {
      if (this.expandedRowKeys.length > 0) {
        return getAction(this.url.getChildListBatch, { parentIds: this.expandedRowKeys.join(',') }).then(res => {
          if (res.success && res.result.records.length > 0) {
            //已展开的数据批量子节点
            let records = res.result.records
            const listMap = new Map()
            for (let item of records) {
              let pid = item[this.pidField]
              if (this.expandedRowKeys.join(',').includes(pid)) {
                let mapList = listMap.get(pid)
                if (mapList == null) {
                  mapList = []
                }
                mapList.push(item)
                listMap.set(pid, mapList)
              }
            }
            let childrenMap = listMap
            let fn = (list) => {
              if (list) {
                list.forEach(data => {
                  if (this.expandedRowKeys.includes(data.id)) {
                    data.children = this.getDataByResult(childrenMap.get(data.id))
                    fn(data.children)
                  }
                })
              }
            }
            fn(dataList)
          }
        })
      } else {
        return Promise.resolve()
      }
    },
    getQueryParams(arg) {
      //获取查询条件
      let sqp = {}
      let param = {}
      if (this.superQueryParams) {
        sqp['superQueryParams'] = encodeURI(this.superQueryParams)
        sqp['superQueryMatchType'] = this.superQueryMatchType
      }
      if (arg) {
        param = Object.assign(sqp, this.isorter, this.filters)
      } else {
        param = Object.assign(sqp, this.queryParam, this.isorter, this.filters)
      }
      if (JSON.stringify(this.queryParam) === '{}' || arg) {
        param.hasQuery = 'false'
      } else {
        param.hasQuery = 'true'
      }
      param.field = this.getQueryField()
      param.pageNo = this.ipagination.current
      param.pageSize = this.ipagination.pageSize
      return filterObj(param)
    },
    searchReset() {
      //重置
      this.expandedRowKeys = []
      this.queryParam = {}
      this.loadData(1)
    },
    getDataByResult(result) {
      if (result) {
        return result.map(item => {
          //判断是否标记了带有子节点
          if (item[this.hasChildrenField] == '1') {
            let loadChild = { id: item.id + '_loadChild', name: 'loading...', isLoading: true }
            item.children = [loadChild]
          }
          return item
        })
      }
    },
    handleExpand(expanded, record) {
      // 判断是否是展开状态
      if (expanded) {
        this.expandedRowKeys.push(record.id)
        if (record.children.length > 0 && record.children[0].isLoading === true) {
          let params = this.getQueryParams(1)//查询条件
          params[this.pidField] = record.id
          params.hasQuery = 'false'
          params.superQueryParams = ''
          getAction(this.url.childList, params).then((res) => {
            if (res.success) {
              if (res.result.records) {
                record.children = this.getDataByResult(res.result.records)
                this.dataSource = [...this.dataSource]
              } else {
                record.children = ''
                record.hasChildrenField = '0'
              }
            } else {
              this.$message.warning(res.message)
            }
          })
        }
      } else {
        let keyIndex = this.expandedRowKeys.indexOf(record.id)
        if (keyIndex >= 0) {
          this.expandedRowKeys.splice(keyIndex, 1)
        }
      }
    },
    handleAddChild(record) {
      this.loadParent = true
      let obj = {}
      obj[this.pidField] = record['id']
      this.$refs.modalForm.add_father(obj, record)
    },
    sendActivity(value) {
      if (!this.url.sendActivity) {
        this.$message.error('请设置url.dsendActivity属性!')
        return
      }
      let that = this
      postAction(that.url.sendActivity, value).then((res) => {
        if (res.success) {
          that.$message.success(res.message)
          // that.loadData()
        } else {
          that.$message.error(res.message)
        }
      }).finally(() => {
        that.loadData()
      })
    },
    handleDeleteNode(id) {
      if (!this.url.delete) {
        this.$message.error('请设置url.delete属性!')
        return
      }
      var that = this
      deleteAction(that.url.delete, { id: id }).then((res) => {
        if (res.success) {
          that.loadData(1)
        } else {
          that.$message.warning(res.message)
        }
      })
    },
    batchDel() {
      if (this.selectedRowKeys.length <= 0) {
        this.$message.warning('请选择一条记录！')
        return false
      } else {
        let ids = ''
        let that = this
        that.selectedRowKeys.forEach(function(val) {
          ids += val + ','
        })
        that.$confirm({
          title: '确认删除',
          content: '是否删除选中数据?',
          onOk: function() {
            that.handleDeleteNode(ids)
            that.onClearSelected()
          }
        })
      }
    },
    getSuperFieldList() {
      let fieldList = []
      fieldList.push({ type: 'string', value: 'name', text: '活动名称', dictCode: '' })
      fieldList.push({ type: 'date', value: 'startDate', text: '计划开始日期' })
      fieldList.push({ type: 'string', value: 'activityTime', text: '活动时长', dictCode: '' })
      fieldList.push({ type: 'string', value: 'speakerId', text: '演讲员', dictCode: 'bkb_speaker,name,id' })
      fieldList.push({ type: 'int', value: 'status', text: '状态', dictCode: 'activity_status' })
      fieldList.push({ type: 'Text', value: 'remark', text: '备注', dictCode: '' })
      this.superFieldList = fieldList
    }
  }
}
</script>
<style scoped>
@import '~@assets/less/common.less';
</style>
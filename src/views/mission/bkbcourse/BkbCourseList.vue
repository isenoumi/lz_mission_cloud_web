<template>
  <a-card :bordered='false'>
    <!-- 查询区域 -->
    <div class='table-page-search-wrapper'>
      <a-form layout='inline' @keyup.enter.native='searchQuery'>
        <a-row :gutter='24'>
          <a-col :xl='6' :lg='7' :md='8' :sm='24'>
            <a-form-item label='课程名称'>
              <a-input placeholder='请输入课程名称' v-model='queryParam.name'></a-input>
            </a-form-item>
          </a-col>
          <a-col :xl='6' :lg='7' :md='8' :sm='24'>
            <a-form-item label='是否答题'>
              <j-dict-select-tag placeholder='请选择是否答题' v-model='queryParam.answer' dictCode='yn' />
            </a-form-item>
          </a-col>
          <a-col :xl='6' :lg='7' :md='8' :sm='24'>
            <a-form-item label='积分获取规则'>
              <j-search-select-tag :dictOptions='searchOptions' v-model='queryParam.pointsAcquisitionRule'
                                   placeholder='请选择积分获取规则' />
            </a-form-item>
          </a-col>
          <template v-if='toggleSearchStatus'>
            <a-col :xl='6' :lg='7' :md='8' :sm='24'>
              <a-form-item label='状态'>
                <j-dict-select-tag placeholder='请选择状态' v-model='queryParam.status'
                                   dictCode='publish_type_status'></j-dict-select-tag>
              </a-form-item>
            </a-col>
          </template>
          <a-col :xl='6' :lg='7' :md='8' :sm='24'>
            <span style='float: left;overflow: hidden;' class='table-page-search-submitButtons'>
              <a-button type='primary' @click='searchQuery' icon='search'>查询</a-button>
              <a-button type='primary' @click='searchReset' icon='reload' style='margin-left: 8px'>重置</a-button>
              <a @click='handleToggleSearch' style='margin-left: 8px'>
                {{ toggleSearchStatus ? '收起' : '展开' }}
                <a-icon :type="toggleSearchStatus ? 'up' : 'down'" />
              </a>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <!-- 查询区域-END -->

    <!-- 操作按钮区域 -->
    <div class='table-operator'>
      <a-button @click='handleAdd' type='primary' icon='plus'>新增</a-button>
<!--      <a-button type='primary' icon='download' @click="handleExportXls('课程信息表')">导出</a-button>-->
<!--      <a-upload name='file' :showUploadList='false' :multiple='false' :headers='tokenHeader' :action='importExcelUrl'-->
<!--                @change='handleImportExcel'>-->
<!--        <a-button type='primary' icon='import'>导入</a-button>-->
<!--      </a-upload>-->
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
        :scroll='{x:true}'
        bordered
        rowKey='id'
        :columns='columns'
        :dataSource='dataSource'
        :pagination='ipagination'
        :loading='loading'
        :rowSelection='{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}'
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

        <template slot='pcaSlot' slot-scope='text'>
          <div>{{ getPcaText(text) }}</div>
        </template>


        <span slot='action' slot-scope='text, record'>
          <a @click='check(record)'>查看</a>
          <a-divider type='vertical' />
          <span v-if='record.status === 1 || record.status === 2'>
            <a @click='handleEdit(record)'>编辑</a>
            <a-divider type='vertical' />
          </span>
          <a-dropdown>
            <a class='ant-dropdown-link'>更多 <a-icon type='down' /></a>
            <a-menu slot='overlay'>
              <a-menu-item v-if='record.status === 1 || record.status === 2'>
                <a-popconfirm title='确认发布吗?发布后无法关联题库和知识库,并且无法被删除!。' @confirm='() => handlePublish(record.id)'>
                  <a>发布</a>
                </a-popconfirm>
              </a-menu-item>
              <a-menu-item v-if='record.status === 0'>
                <a-popconfirm title='确认作废吗?' @confirm='() => handleAbandon(record.id)'>
                  <a>作废</a>
                </a-popconfirm>
              </a-menu-item>
              <a-menu-item v-if='record.status === 1'>
                <a-popconfirm title='确定删除吗?' @confirm='() => handleDelete(record.id)'>
                  <a>删除</a>
                </a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>

      </a-table>
    </div>

    <bkb-course-modal ref='modalForm' @ok='modalFormOk'></bkb-course-modal>
    <!--    // 查看模态框-->
    <a-modal
      title='查看'
      :visible='checkVisible'
      @ok='checkVisible = false'
      @cancel='checkVisible = false'
      :footer='null'
      :width='1300'
    >
      <BkbCourseView v-if='checkVisible' :course-id='courseId'></BkbCourseView>
    </a-modal>
  </a-card>
</template>

<script>

import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import BkbCourseModal from './modules/BkbCourseModal'
import BkbCourseView from './modules/BkbCourseView'
import Area from '@comp/_util/Area'
import { getAction } from '@api/manage'
import { initDictOptions } from '@comp/dict/JDictSelectUtil'

export default {
  name: 'BkbCourseList',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    BkbCourseModal,
    BkbCourseView
  },
  data() {
    return {
      searchOptions: [],
      description: '课程信息表管理页面',
      checkVisible: false,
      courseId: '',
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
          title: '课程名称',
          align: 'center',
          dataIndex: 'name'
        },
        {
          title: '是否答题',
          align: 'center',
          dataIndex: 'answer_dictText'
        },
        {
          title: '课程积分',
          align: 'center',
          dataIndex: 'points'
        },
        {
          title: '课程积分',
          align: 'center',
          dataIndex: 'pointsAcquisitionRule_dictText'
        },
        // {
        //   title:'地区',
        //   align:"center",
        //   dataIndex: 'region',
        //   scopedSlots: {customRender: 'pcaSlot'}
        // },
        {
          title: '状态',
          align: 'center',
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
        list: '/mission/bkbCourse/list',
        delete: '/mission/bkbCourse/delete',
        deleteBatch: '/mission/bkbCourse/deleteBatch',
        exportXlsUrl: '/mission/bkbCourse/exportXls',
        importExcelUrl: 'mission/bkbCourse/importExcel',
        publish: '/mission/bkbCourse/publish',
        abandon: '/mission/bkbCourse/abandon'
      },
      dictOptions: {},
      superFieldList: []
    }
  },
  created() {
    this.pcaData = new Area()
    this.getSuperFieldList()
  },
  computed: {
    importExcelUrl: function() {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
    }
  },
  methods: {
    handleEditData(record) {
      getAction('/mission/bkbCourse/queryById', { id: record.id }).then(res => {
        return res.result
      })
    },
    // 点击查看的方法
    check(record) {
      this.checkVisible = true
      this.courseId = record.id
    },
    getPcaText(code) {
      return this.pcaData.getText(code)
    },
    initDictConfig() {
      //初始化字典 - 商品类型
      initDictOptions('integral_get_type').then((res) => {
          if (res.success) {
            this.$set(this.searchOptions, 'pointsAcquisitionRule', res.result)
            this.searchOptions = res.result
          }
        }
      )
    },
    getSuperFieldList() {
      let fieldList = []
      fieldList.push({ type: 'string', value: 'name', text: '课程名称', dictCode: '' })
      fieldList.push({ type: 'int', value: 'answer', text: '是否答题', dictCode: 'yn' })
      fieldList.push({
        type: 'sel_search',
        value: 'pointsAcquisitionRule',
        text: '积分获取规则',
        dictCode: 'integral_get_type'
      })

      // fieldList.push({type:'pca',value:'region',text:'地区'})
      fieldList.push({ type: 'int', value: 'status', text: '状态', dictCode: 'publish_type_status' })
      this.superFieldList = fieldList
    }
  }
}
</script>
<style scoped>
@import '~@assets/less/common.less';
</style>
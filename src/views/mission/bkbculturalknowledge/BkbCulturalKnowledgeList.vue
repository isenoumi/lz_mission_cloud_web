<template>
  <a-card :bordered='false'>
    <!-- 查询区域 -->
    <div class='table-page-search-wrapper'>
      <a-form layout='inline' @keyup.enter.native='searchQuery'>
        <a-row :gutter='24'>
          <a-col :xl='6' :lg='7' :md='8' :sm='24'>
            <a-form-item label='知识库标题'>
              <a-input placeholder='请输入知识库标题' v-model='queryParam.knowledgeTitle'></a-input>
            </a-form-item>
          </a-col>
          <a-col :xl='6' :lg='7' :md='8' :sm='24'>
            <a-form-item label='知识库分类'>
              <j-category-select placeholder='请选择知识库分类' v-model='queryParam.knowledgeType' pcode='B03' />
            </a-form-item>
          </a-col>
          <a-col :xl='6' :lg='7' :md='8' :sm='24'>
            <a-form-item label='积分获取规则'>
              <j-search-select-tag :dictOptions='searchOptions' v-model='queryParam.pointsAcquisitionRule'
                                   placeholder='请选择积分获取规则' />
            </a-form-item>
          </a-col>
          <template v-if='toggleSearchStatus'>

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
<!--      <a-button type='primary' icon='download' @click="handleExportXls('文化知识管理')">导出</a-button>-->
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
          <a-divider type="vertical" />
          <span>
            <a @click="handleEdit(record)">编辑</a>
            <a-divider type="vertical" />
          </span>

          <a-popconfirm title='确定删除吗?' @confirm='() => handleDelete(record.id)'>
            <a>删除</a>
          </a-popconfirm>
        </span>

      </a-table>
    </div>

    <bkb-cultural-knowledge-modal ref='modalForm' @ok='modalFormOk'></bkb-cultural-knowledge-modal>
    <!--    // 查看模态框-->
    <a-modal
      title='查看'
      :visible='checkVisible'
      @ok='checkVisible = false'
      @cancel='checkVisible = false'
      :footer='null'
      :width='1300'
    >
      <BkpKnowledgeView v-if='checkVisible' :knowledgeData='knowledgeData'></BkpKnowledgeView>
    </a-modal>
  </a-card>
</template>

<script>

import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import BkbCulturalKnowledgeModal from './modules/BkbCulturalKnowledgeModal'
import BkpKnowledgeView from '../bkbknowledge/modules/BkbKnowledgeView'
import { loadCategoryData } from '@/api/api'
import { filterMultiDictText, initDictOptions } from '@/components/dict/JDictSelectUtil'
import Vue from 'vue'
import { USER_INFO } from '@/store/mutation-types'
import Area from '@comp/_util/Area'
import { getAction } from '@api/manage'

export default {
  name: 'BkbCulturalKnowledgeList',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    BkbCulturalKnowledgeModal,
    BkpKnowledgeView
  },
  data() {
    return {
      description: '文化知识管理管理页面',
      user: Vue.ls.get(USER_INFO),
      searchOptions: [],
      pcaData: '',
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
          title: '知识库分类',
          align: 'center',
          dataIndex: 'knowledgeType',
          customRender: (text) => (text ? filterMultiDictText(this.dictOptions['knowledgeType'], text) : '')
        },
        {
          title: '知识库标题',
          align: 'center',
          dataIndex: 'knowledgeTitle'
        },
        // {
        //   title:'地区',
        //   align:"center",
        //   dataIndex: 'region',
        //   scopedSlots: {customRender: 'pcaSlot'}
        // },
        {
          title: '创建人',
          align: 'center',
          dataIndex: 'createBy'
        },
        {
          title: '创建日期',
          align: 'center',
          dataIndex: 'createTime'
        },
        {
          title: '文化知识积分',
          align: 'center',
          dataIndex: 'points'
        },
        {
          title: '积分获取规则',
          align: 'center',
          dataIndex: 'pointsAcquisitionRule_dictText'
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
        list: '/mission/bkbCulturalKnowledge/list',
        delete: '/mission/bkbCulturalKnowledge/delete',
        deleteBatch: '/mission/bkbCulturalKnowledge/deleteBatch',
        exportXlsUrl: '/mission/bkbCulturalKnowledge/exportXls',
        importExcelUrl: 'mission/bkbCulturalKnowledge/importExcel'

      },
      dictOptions: {},
      superFieldList: [],
      knowledgeData: '',
      checkVisible: false// false 时模态框关闭
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
    // 点击查看的方法
    check(record) {
      getAction('/mission/bkbKnowledge/queryById', { id: record.knowledgeId }).then(res => {
        if (res.success) {
          this.knowledgeData = res.result
          this.checkVisible = true
        }
      })
    },
    getPcaText(code) {
      return this.pcaData.getText(code)
    },
    initDictConfig() {
      loadCategoryData({ code: 'B03' }).then((res) => {
        if (res.success) {
          this.$set(this.dictOptions, 'knowledgeType', res.result)
        }
      })
      //初始化字典 - 商品类型
      initDictOptions('integral_get_type').then((res) => {
          if (res.success) {
            this.$set(this.searchOptions, 'pointsAcquisitionRule', res.result.slice(0,2))
            this.searchOptions = res.result.slice(0,2)
          }
        }
      )
    },
    getSuperFieldList() {
      let fieldList = []
      fieldList.push({ type: 'string', value: 'knowledgeType', text: '知识库分类' })
      fieldList.push({
        type: 'sel_search',
        value: 'knowledgeId',
        text: '关联知识库',
        dictTable: 'bkb_knowledge',
        dictText: 'title',
        dictCode: 'id'
      })
      fieldList.push({ type: 'string', value: 'knowledgeTitle', text: '知识库标题', dictCode: '' })
      fieldList.push({ type: 'sel_search', value: 'pointsAcquisitionRule', text: '积分获取规则', dictCode: 'integral_get_type'  })
      // fieldList.push({type:'pca',value:'region',text:'地区'})
      fieldList.push({ type: 'string', value: 'createBy', text: '创建人', dictCode: '' })
      fieldList.push({ type: 'datetime', value: 'createTime', text: '创建日期' })
      this.superFieldList = fieldList
    }
  }
}
</script>
<style scoped>
@import '~@assets/less/common.less';
</style>
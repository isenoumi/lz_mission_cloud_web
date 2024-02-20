<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="关联课程">
              <j-search-select-tag placeholder="请选择关联课程" v-model="queryParam.courseId" dict="bkb_course,name,id"/>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="知识库分类">
              <j-category-select placeholder="请选择知识库分类" v-model="queryParam.knowledgeType" pcode="B03"/>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
              <a @click="handleToggleSearch" style="margin-left: 8px">
                {{ toggleSearchStatus ? '收起' : '展开' }}
                <a-icon :type="toggleSearchStatus ? 'up' : 'down'"/>
              </a>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <!-- 查询区域-END -->

    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>
<!--      <a-button type="primary" icon="download" @click="handleExportXls('课程知识库')">导出</a-button>-->
<!--      <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrl" @change="handleImportExcel">-->
<!--        <a-button type="primary" icon="import">导入</a-button>-->
<!--      </a-upload>-->
      <!-- 高级查询区域 -->
      <j-super-query :fieldList="superFieldList" ref="superQueryModal" @handleSuperQuery="handleSuperQuery"></j-super-query>
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel"><a-icon type="delete"/>删除</a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button>
      </a-dropdown>
    </div>

    <!-- table区域-begin -->
    <div>
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择 <a style="font-weight: 600">{{ selectedRowKeys.length }}</a>项
        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
      </div>

      <a-table
        ref="table"
        size="middle"
        :scroll="{x:true}"
        bordered
        rowKey="id"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
        class="j-table-force-nowrap"
        @change="handleTableChange">

        <template slot="htmlSlot" slot-scope="text">
          <div v-html="text"></div>
        </template>
        <template slot="imgSlot" slot-scope="text,record">
          <span v-if="!text" style="font-size: 12px;font-style: italic;">无图片</span>
          <img v-else :src="getImgView(text)" :preview="record.id" height="25px" alt="" style="max-width:80px;font-size: 12px;font-style: italic;"/>
        </template>
        <template slot="fileSlot" slot-scope="text">
          <span v-if="!text" style="font-size: 12px;font-style: italic;">无文件</span>
          <a-button
            v-else
            :ghost="true"
            type="primary"
            icon="download"
            size="small"
            @click="downloadFile(text)">
            下载
          </a-button>
        </template>

        <span slot="action" slot-scope="text, record">
          <a @click="check(record)">查看</a>

          <a-divider type="vertical" />
          <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
            <a>删除</a>
          </a-popconfirm>
        </span>

      </a-table>
    </div>

    <bkb-course-knowledge-modal ref="modalForm" @ok="modalFormOk"></bkb-course-knowledge-modal>
    <!--    // 查看模态框-->
    <a-modal
      title="查看"
      :visible="checkVisible"
      @ok="checkVisible = false"
      @cancel="checkVisible = false"
      :footer="null"
      :width="1300"
    >
      <BkpKnowledgeView v-if="checkVisible" :knowledgeData="knowledgeData"></BkpKnowledgeView>
    </a-modal>
  </a-card>
</template>

<script>

  import '@/assets/less/TableExpand.less'
  import { mixinDevice } from '@/utils/mixin'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import BkbCourseKnowledgeModal from './modules/BkbCourseKnowledgeModal'
  import BkpKnowledgeView from '../bkbknowledge/modules/BkbKnowledgeView'
  import { loadCategoryData } from '@/api/api'
  import {filterMultiDictText} from '@/components/dict/JDictSelectUtil'
  import { getAction } from '@api/manage'

  export default {
    name: 'BkbCourseKnowledgeList',
    mixins:[JeecgListMixin, mixinDevice],
    components: {
      BkbCourseKnowledgeModal,
      BkpKnowledgeView
    },
    data () {
      return {
        description: '课程知识库管理页面',
        knowledgeData: "",
        checkVisible:false,// false 时模态框关闭
        // 表头
        columns: [
          {
            title: '#',
            dataIndex: '',
            key:'rowIndex',
            width:60,
            align:"center",
            customRender:function (t,r,index) {
              return parseInt(index)+1;
            }
          },
          {
            title:'关联课程',
            align:"center",
            dataIndex: 'courseId_dictText'
          },
          {
            title:'知识库分类',
            align:"center",
            dataIndex: 'knowledgeType',
            customRender: (text) => (text ? filterMultiDictText(this.dictOptions['knowledgeType'], text) : '')
          },
          {
            title:'关联知识库',
            align:"center",
            dataIndex: 'knowledgeId_dictText'
          },
          {
            title:'创建人',
            align:"center",
            dataIndex: 'createBy'
          },
          {
            title:'创建日期',
            align:"center",
            dataIndex: 'createTime'
          },
          {
            title: '操作',
            dataIndex: 'action',
            align:"center",
            fixed:"right",
            width:147,
            scopedSlots: { customRender: 'action' }
          }
        ],
        url: {
          list: "/mission/bkbCourseKnowledge/list",
          delete: "/mission/bkbCourseKnowledge/delete",
          deleteBatch: "/mission/bkbCourseKnowledge/deleteBatch",
          exportXlsUrl: "/mission/bkbCourseKnowledge/exportXls",
          importExcelUrl: "mission/bkbCourseKnowledge/importExcel",

        },
        dictOptions:{},
        superFieldList:[],
      }
    },
    created() {
    this.getSuperFieldList();
    },
    computed: {
      importExcelUrl: function(){
        return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
      },
    },
    methods: {
      // 点击查看的方法
      check(record){
        this.knowledgeData = { id: record.knowledgeId };
        this.checkVisible = true;
      },
      initDictConfig(){
        loadCategoryData({code:'B03'}).then((res) => {
          if (res.success) {
            this.$set(this.dictOptions, 'knowledgeType', res.result)
          }
        })
      },
      getSuperFieldList(){
        let fieldList=[];
        fieldList.push({type:'sel_search',value:'courseId',text:'关联课程',dictTable:"bkb_course", dictText:'name', dictCode:'id'})
        fieldList.push({type:'string',value:'knowledgeType',text:'知识库分类'})
        fieldList.push({type:'sel_search',value:'knowledgeId',text:'关联知识库',dictTable:"bkb_knowledge", dictText:'title', dictCode:'id'})
        fieldList.push({type:'string',value:'createBy',text:'创建人',dictCode:''})
        fieldList.push({type:'datetime',value:'createTime',text:'创建日期'})
        this.superFieldList = fieldList
      },
    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less';
</style>
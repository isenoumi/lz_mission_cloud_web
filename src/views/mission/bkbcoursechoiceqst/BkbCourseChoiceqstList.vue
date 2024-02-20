<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="关联课程">
              <j-search-select-tag placeholder="请选择关联课程" v-model="queryParam.courseId" dict="bkb_course where status != 0,name,id"/>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="题型">
              <j-dict-select-tag placeholder="请选择题型" v-model="queryParam.choiceqstType" dictCode="choice_question_type"/>
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
<!--      <a-button @click="addVisible = true" type="primary" icon="plus">一键获取</a-button>-->
<!--      <a-button type="primary" icon="download" @click="handleExportXls('课程题库')">导出</a-button>-->
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

    <bkb-course-choiceqst-modal ref="modalForm" @ok="modalFormOk"></bkb-course-choiceqst-modal>
    <!--    // 查看模态框-->
    <a-modal
      title="查看"
      :visible="checkVisible"
      @ok="checkVisible = false"
      @cancel="checkVisible = false"
      :footer="null"
      :width="1300"
    >
      <BkpChoiceqstView v-if="checkVisible" :choiceqst-data="choiceqstData"></BkpChoiceqstView>
    </a-modal>
    <a-modal
      title="一键添加"
      :visible="addVisible"
      @ok="autoAdd"
      @cancel="addVisible = false"
      :width="800"
    >
      <j-form-container>
        <a-form-model ref="form" :model="model" slot="detail">
          <a-row>
            <a-col :span="24">
              <a-form-model-item label="关联课程" prop="courseId">
                <j-search-select-tag v-model="model.courseId" :dict="dictData"  />
              </a-form-model-item>
            </a-col>
          </a-row>
        </a-form-model>
      </j-form-container>
    </a-modal>
  </a-card>
</template>

<script>

  import '@/assets/less/TableExpand.less'
  import { mixinDevice } from '@/utils/mixin'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import BkbCourseChoiceqstModal from './modules/BkbCourseChoiceqstModal'
  import BkpChoiceqstView from '../bkbchoiceqst/modules/BkbChoiceqstView'
  import { getAction } from '@api/manage'
  import Vue from 'vue'
  import { USER_INFO } from '@/store/mutation-types'

  export default {
    name: 'BkbCourseChoiceqstList',
    mixins:[JeecgListMixin, mixinDevice],
    components: {
      BkbCourseChoiceqstModal,
      BkpChoiceqstView
    },
    data () {
      return {
        user: Vue.ls.get(USER_INFO),
        description: '课程题库管理页面',
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
            title:'题型',
            align:"center",
            dataIndex: 'choiceqstType_dictText'
          },
          {
            title:'关联题库',
            align:"center",
            dataIndex: 'choiceqstId_dictText'
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
          list: "/mission/bkbCourseChoiceqst/list",
          delete: "/mission/bkbCourseChoiceqst/delete",
          deleteBatch: "/mission/bkbCourseChoiceqst/deleteBatch",
          exportXlsUrl: "/mission/bkbCourseChoiceqst/exportXls",
          importExcelUrl: "mission/bkbCourseChoiceqst/importExcel",

        },
        dictOptions:{},
        superFieldList:[],
        checkVisible: false,
        choiceqstData: '',
        addVisible: false,
        dictData: '',
        model:{},
      }
    },
    created() {
    this.getSuperFieldList();
      this.dictData = "bkb_course where status != 0 and region = " + this.user.customerRegion + ",name,id";
    },
    computed: {
      importExcelUrl: function(){
        return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
      },
    },
    methods: {
      autoAdd() {
        getAction('/mission/bkbCourseChoiceqst/autoAdd', { id: this.model.courseId}).then(res => {
          if (res.success) {
            this.$message.success(res.message);
            this.addVisible = false;
            this.loadData();
          } else {
            this.$message.warning(res.message);
          }
        });
      },
      // 点击查看的方法
      check(record){
        getAction('/mission/bkbChoiceqst/queryById', { id: record.choiceqstId }).then(res => {
          if (res.success) {
            this.choiceqstData = res.result;
            this.checkVisible = true;
          }
        });
      },
      initDictConfig(){
      },
      getSuperFieldList(){
        let fieldList=[];
        fieldList.push({type:'sel_search',value:'courseId',text:'关联课程',dictTable:"bkb_course where status != 0", dictText:'name', dictCode:'id'})
        fieldList.push({type:'string',value:'choiceqstType',text:'题型',dictCode:'choice_question_type'})
        fieldList.push({type:'sel_search',value:'choiceqstId',text:'关联题库',dictTable:"bkb_choiceqst,choiceqst_title,id", dictText:'title', dictCode:'id'})
        fieldList.push({type:'string',value:'createBy',text:'创建人',dictCode:''})
        fieldList.push({type:'datetime',value:'createTime',text:'创建日期'})
        this.superFieldList = fieldList
      }
    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less';
</style>
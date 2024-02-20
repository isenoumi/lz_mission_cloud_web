<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="任务标题">
              <a-input placeholder="请输入任务标题" v-model="queryParam.title"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="督导员名称">
              <a-input placeholder="请输入督导员名称" v-model="queryParam.supervisorName"></a-input>
            </a-form-item>
          </a-col>
          <template v-if="toggleSearchStatus">
<!--            <a-col :xl="6" :lg="7" :md="8" :sm="24">-->
<!--              <a-form-item label="关联地区">-->
<!--                <a-input placeholder="请输入关联地区" v-model="queryParam.region"></a-input>-->
<!--              </a-form-item>-->
<!--            </a-col>-->
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="关联客户">
                <j-dict-select-tag placeholder="请选择关联客户" v-model="queryParam.customerId" dictCode="sys_user where customer_admin=1,customer_name,customer_id"/>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="状态">
                <j-dict-select-tag placeholder="请选择状态" v-model="queryParam.status" dictCode="task_status"/>
              </a-form-item>
            </a-col>
          </template>
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
      <a-button type="primary" icon="download" @click="handleExportXls('任务信息')">导出</a-button>
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
          <a @click="handleEdit(record)">编辑</a>

          <a-divider type="vertical" />
          <a-dropdown>
            <a class="ant-dropdown-link">更多 <a-icon type="down" /></a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a @click="handleDetail(record)">详情</a>
              </a-menu-item>
              <a-menu-item>
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                  <a>删除</a>
                </a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>

      </a-table>
    </div>

    <bkb-task-modal ref="modalForm" @ok="modalFormOk"></bkb-task-modal>
  </a-card>
</template>

<script>

  import '@/assets/less/TableExpand.less'
  import { mixinDevice } from '@/utils/mixin'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import BkbTaskModal from './modules/BkbTaskModal'
  import {filterMultiDictText} from '@/components/dict/JDictSelectUtil'

  export default {
    name: 'BkbTaskList',
    mixins:[JeecgListMixin, mixinDevice],
    components: {
      BkbTaskModal
    },
    data () {
      return {
        description: '任务信息管理页面',
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
            title:'任务标题',
            align:"center",
            dataIndex: 'title'
          },
          // {
          //   title:'督导员',
          //   align:"center",
          //   dataIndex: 'supervisorId_dictText'
          // },
          {
            title:'督导员名称',
            align:"center",
            dataIndex: 'supervisorName'
          },
          {
            title:'督导员电话',
            align:"center",
            dataIndex: 'supervisorPhone'
          },
          {
            title:'任务户数',
            align:"center",
            dataIndex: 'tenement'
          },
          {
            title:'完成户数',
            align:"center",
            dataIndex: 'complete'
          },
          {
            title:'状态',
            align:"center",
            dataIndex: 'status_dictText'
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
          list: "/mission/bkbTask/list",
          delete: "/mission/bkbTask/delete",
          deleteBatch: "/mission/bkbTask/deleteBatch",
          exportXlsUrl: "/mission/bkbTask/exportXls",
          importExcelUrl: "mission/bkbTask/importExcel",

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
      initDictConfig(){
      },
      getSuperFieldList(){
        let fieldList=[];
        fieldList.push({type:'string',value:'title',text:'任务标题',dictCode:''})
        // fieldList.push({type:'string',value:'supervisorId',text:'督导员',dictCode:"bkb_supervisor,name,id"})
        fieldList.push({type:'string',value:'supervisorName',text:'督导员名称',dictCode:''})
        fieldList.push({type:'string',value:'supervisorPhone',text:'督导员电话',dictCode:''})
        fieldList.push({type:'string',value:'tenement',text:'任务户数',dictCode:''})
        fieldList.push({type:'string',value:'complete',text:'完成户数',dictCode:''})
        // fieldList.push({type:'string',value:'region',text:'关联地区',dictCode:''})
        fieldList.push({type:'string',value:'customerId',text:'关联客户',dictCode:"sys_user where customer_admin=1,customer_name,customer_id"})
        fieldList.push({type:'string',value:'status',text:'状态',dictCode:'task_status'})
        this.superFieldList = fieldList
      }
    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less';
</style>
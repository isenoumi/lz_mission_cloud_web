<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="题标题">
              <a-input placeholder="请输入题标题" v-model="queryParam.choiceqstTitle"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="关联知识库">
              <j-dict-select-tag placeholder="请选择关联知识库" v-model="queryParam.knowledgeId" dictCode="bkb_knowledge,title,id"/>
            </a-form-item>
          </a-col>
          <template v-if="toggleSearchStatus">
<!--            <a-col :xl="6" :lg="7" :md="8" :sm="24">-->
<!--              <a-form-item label="地区">-->
<!--                <j-search-select-tag :dictOptions='searchOptions'  v-model="queryParam.region" placeholder="请选择省市区"/>-->
<!--              </a-form-item>-->
<!--            </a-col>-->
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="题型">
                <j-dict-select-tag placeholder="请选择单选还是多选题" v-model="queryParam.choiceType" dictCode="choice_question_type"/>
              </a-form-item>
            </a-col>
             <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="状态">
                <j-dict-select-tag placeholder="请选择状态" v-model="queryParam.status" dictCode="publish_type_status"/>
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
      <a-button type="primary" icon="download" @click="handleExportXls('题库')">导出</a-button>
      <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrl" @change="handleImportExcel">
        <a-button type="primary" icon="import">导入</a-button>
      </a-upload>
      <!-- 高级查询区域 -->
      <j-super-query :fieldList="superFieldList" ref="superQueryModal" @handleSuperQuery="handleSuperQuery"></j-super-query>
<!--      <a-button type="primary" icon="cloud-sync" :loading="iconLoading" @click="updateKnowledge()">-->
<!--        同步数据-->
<!--      </a-button>-->
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
        bordered
        rowKey="id"
        class="j-table-force-nowrap"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
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
        <template slot="pcaSlot" slot-scope="text">
          <div>{{ getPcaText(text) }}</div>
        </template>

        <span slot="action" slot-scope="text, record">
          <a @click="check(record)">查看</a>
          <a-divider type="vertical" />
          <span v-if="record.status === 1 || record.status === 2">
            <a @click="handleEdit(record)">编辑</a>
            <a-divider type="vertical" />
          </span>
          <a-dropdown>
            <a class="ant-dropdown-link">更多 <a-icon type="down" /></a>
            <a-menu slot="overlay">
              <a-menu-item v-if="record.status === 1 || record.status === 2">
                <a-popconfirm title="确认发布吗?发布后无法删除。" @confirm="() => handlePublish(record.id)">
                  <a>发布</a>
                </a-popconfirm>
              </a-menu-item>
              <a-menu-item v-if="record.status === 0">
                <a-popconfirm title="确认作废吗?作废后无法进行绑定。" @confirm="() => handleAbandon(record.id)">
                  <a>作废</a>
                </a-popconfirm>
              </a-menu-item>
              <a-menu-item v-if="record.status === 1">
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                  <a>删除</a>
                </a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>

      </a-table>
    </div>

    <bkp-choiceqst-modal ref="modalForm" @ok="modalFormOk"/>
    <!--    // 查看模态框-->
    <a-modal
      title="查看"
      :visible="checkVisible"
      :confirm-loading="confirmLoading"
      @ok="checkVisible = false"
      @cancel="checkVisible = false"
      :footer="null"
      :width="1300"
    >
      <BkpChoiceqstView v-if="checkVisible" :choiceqstData="choiceqstData"></BkpChoiceqstView>
    </a-modal>
  </a-card>
</template>

<script>

  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import BkpChoiceqstView from './modules/BkbChoiceqstView'
  import Area from '@comp/_util/Area'
  import '@assets/less/TableExpand.less'
  import { getAction } from '@api/manage'
  import Vue from 'vue'
  import { USER_INFO } from '@/store/mutation-types'
  import BkpChoiceqstModal from '@views/mission/bkbchoiceqst/modules/BkpChoiceqstModal'

  export default {
    name: "BkpChoiceqstList",
    mixins:[JeecgListMixin],
    components: {
      BkpChoiceqstView,
      BkpChoiceqstModal
    },
    data () {
      return {
        user: Vue.ls.get(USER_INFO),
        description: '题库管理页面',
        checkVisible:false,// false 时模态框关闭
        confirmLoading:false,
        choiceqstData: "",
        searchOptions: "",
        iconLoading: false,
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
            title:'题标题',
            align:"center",
            dataIndex: 'choiceqstTitle',
            ellipsis: true,
          },
          // {
          //   title:'地区',
          //   align:"center",
          //   dataIndex: 'region',
          //   scopedSlots: {customRender: 'pcaSlot'}
          // },
          {
            title:'单选还是多选题',
            align:"center",
            dataIndex: 'choiceType_dictText'
          },
          {
            title:'关联知识库标题',
            align:"center",
            dataIndex: 'knowledgeTitle',
            ellipsis: true,
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
            scopedSlots: { customRender: 'action' },
          }
        ],
        url: {
          list: "/mission/bkbChoiceqst/list",
          exportXlsUrl: "/mission/bkbChoiceqst/exportXls",

          delete: "/mission/bkbChoiceqst/delete",
          deleteBatch: "/mission/bkbChoiceqst/deleteBatch",
          importExcelUrl: "mission/bkbChoiceqst/importExcel",
          publish: '/mission/bkbChoiceqst/publish',
          freeze: '/mission/bkbChoiceqst/freeze',
          abandon: '/mission/bkbChoiceqst/abandon'
        },
        superFieldList:[],
      }
    },
    created() {
      this.pcaData = new Area()
      this.getSuperFieldList();
      // this.searchOptions = [
      //   {
      //     text: "公共区域",
      //     value: "100011"
      //   },
      //   {
      //     text: "本地区",
      //     value: this.user.customerRegion,
      //   }
      // ];
    },
    computed: {
      importExcelUrl: function(){
        return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
      }
    },
    methods: {
      // 同步数据
      updateKnowledge() {
        this.iconLoading = true;
        getAction("/mission/bkbChoiceqst/updatedata").then(res => {});
        this.$message.success("同步指令已在后台执行,请稍后刷新页面!");
        setTimeout(()=>{
          this.iconLoading = false;
        }, 1000);
      },
      // 点击查看的方法
      check(record){
        this.choiceqstData = record;
        this.checkVisible = true;
      },
      getPcaText(code){
        return this.pcaData.getText(code);
      },
      initDictConfig(){
      },
      getSuperFieldList(){
        let fieldList=[];
        fieldList.push({type:'string',value:'choiceqstTitle',text:'题标题',dictCode:''})
        fieldList.push({type:'int',value:'knowledgeId',text:'关联知识库',dictCode:"bkb_knowledge,title,id"})
        // fieldList.push({type:'pca',value:'region',text:'地区'})
        fieldList.push({type:'int',value:'choiceType',text:'单选还是多选题',dictCode:'choice_question_type'})
        fieldList.push({type:'string',value:'knowledgeTitle',text:'关联知识库标题',dictCode:''})
        fieldList.push({type:'int',value:'status',text:'状态',dictCode:'publish_type_status'})
        this.superFieldList = fieldList
      }
    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less';
</style>
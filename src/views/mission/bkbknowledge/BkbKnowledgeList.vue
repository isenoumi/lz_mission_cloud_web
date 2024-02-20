<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row>
          <a-col :span="5">
            <a-form-item label="知识标题" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input placeholder="请输入知识标题" v-model="queryParam.title"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="5">
            <a-form-item label="知识类型" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <j-category-select placeholder="请选择知识类型" v-model="queryParam.type" pcode="B03" />
            </a-form-item>
          </a-col>
          <a-col :span="5">
            <a-form-item label="知识状态" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <j-dict-select-tag placeholder="请选择知识状态" v-model="queryParam.status" dictCode="publish_type_status" />
            </a-form-item>
          </a-col>
          <!--          <a-col :xl="6" :lg="7" :md="8" :sm="24">-->
          <!--            <a-form-item label="地区">-->
          <!--              <j-search-select-tag :dictOptions='searchOptions'  v-model="queryParam.region" placeholder="请选择省市区"/>-->
          <!--            </a-form-item>-->
          <!--          </a-col>-->
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <!-- 查询区域-END -->

    <!--     操作按钮区域 -->
    <div class="table-operator">
      <!-- 高级查询区域 -->
      <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>
      <j-super-query style="margin-left: 8px" :fieldList="superFieldList" ref="superQuegryModal"
        @handleSuperQuery="handleSuperQuery"></j-super-query>

      <!--      <a-button type="primary" icon="cloud-sync" :loading="iconLoading" @click="updateKnowledge()">-->
      <!--        同步数据-->
      <!--      </a-button>-->
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel">
            <a-icon type="delete" />
            删除
          </a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px">
          批量操作
          <a-icon type="down" />
        </a-button>
      </a-dropdown>
    </div>

    <!-- table区域-begin -->
    <div>
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择
        <a style="font-weight: 600">{{ selectedRowKeys.length }}</a>项
        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
      </div>

      <a-table ref="table" size="middle" bordered rowKey="id" :columns="columns" :dataSource="dataSource"
        :pagination="ipagination" :loading="loading"
        :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }" class="j-table-force-nowrap"
        @change="handleTableChange">
        <template slot="htmlSlot" slot-scope="text">
          <div v-html="text"></div>
        </template>
        <template slot="imgSlot" slot-scope="text, record">
          <span v-if="!text" style="font-size: 12px;font-style: italic;">无图片</span>
          <img v-else :src="getImgView(text)" :preview="record.id" height="25px" alt=""
            style="max-width:80px;font-size: 12px;font-style: italic;" />
        </template>
        <template slot="pcaSlot" slot-scope="text">
          <div>{{ getPcaText(text) }}</div>
        </template>
        <template slot="fileSlot" slot-scope="text">
          <span v-if="!text" style="font-size: 12px;font-style: italic;">无文件</span>
          <a-button v-else :ghost="true" type="primary" icon="download" size="small"
            @click="downloadFile(text, '附件.xlsx')">
            下载
          </a-button>
          <!-- <div v-else>
            <label>文件：</label>
            <a :href="addurl(text)">{{ text }}</a>
          </div> -->
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
              <!--              <a-menu-item>-->
              <!--                <a @click="handleDetail(record)">详情</a>-->
              <!--              </a-menu-item>-->
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
    <bkp-knowledge-modal ref="modalForm" @ok="modalFormOk"></bkp-knowledge-modal>

    <!--    // 查看模态框-->
    <a-modal title="查看" :visible="checkVisible" :confirm-loading="confirmLoading" @ok="checkVisible = false"
      @cancel="checkVisible = false" :footer="null" :width="1300">
      <BkpKnowledgeView v-if="checkVisible" :knowledgeData="knowledgeData"></BkpKnowledgeView>
    </a-modal>
  </a-card>
</template>

<script>
import '@assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
// 这个就是引用组件
import { loadCategoryData } from '@api/api'
import { filterMultiDictText } from '@comp/dict/JDictSelectUtil'
import Area from '@comp/_util/Area'
import BkpKnowledgeView from './modules/BkbKnowledgeView'
import { getAction, downloadFile, postAction, downFilePostAction, getFileAccessHttpUrl } from '@api/manage'
import Vue from 'vue'
import { USER_INFO } from '@/store/mutation-types'
import BkpKnowledgeModal from '@views/mission/bkbknowledge/modules/BkpKnowledgeModal'
import axios from 'axios'
import getFileType from '@/utils/getFileType'
export default {
  name: 'BkpKnowledgeList',
  // 这个mixin就是公用方法
  mixins: [JeecgListMixin, mixinDevice],
  // 这里要注册
  components: {
    BkpKnowledgeModal,
    BkpKnowledgeView
  },
  data() {
    return {
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 }
      },
      labelCol: {
        xs: { span: 24 },
        sm: { span: 3 }
      },
      user: Vue.ls.get(USER_INFO),
      checkVisible: false, // false 时模态框关闭
      confirmLoading: false,
      description: '知识库管理页面',
      knowledgeData: '',
      searchOptions: '',
      // 表头
      columns: [
        {
          title: '序号',
          dataIndex: '',
          key: 'rowIndex',
          width: 60,
          align: 'center',
          customRender: function (t, r, index) {
            return parseInt(index) + 1
          }
        },
        {
          title: '知识标题',
          align: 'center',
          dataIndex: 'title'
        },
        {
          title: '知识类型',
          align: 'center',
          dataIndex: 'type',
          customRender: text => (text ? filterMultiDictText(this.dictOptions['type'], text) : '')
        },
        {
          title: '知识状态',
          align: 'center',
          dataIndex: 'status_dictText'
        },
        // {
        //   title: '附件',
        //   align: 'center',
        //   dataIndex: 'files',
        //   scopedSlots: { customRender: 'fileSlot' }
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
        list: '/mission/bkbKnowledge/list',
        exportXlsUrl: '/mission/bkbKnowledge/exportXls',
        delete: '/mission/bkbKnowledge/delete',
        deleteBatch: '/mission/bkbKnowledge/deleteBatch',
        publish: '/mission/bkbKnowledge/publish',
        importExcelUrl: 'mission/bkbKnowledge/importExcel',
        abandon: '/mission/bkbKnowledge/abandon'
      },
      dictOptions: {},
      pcaData: '',
      superFieldList: [],
      iconLoading: false
    }
  },
  created() {
    this.pcaData = new Area()
    this.getSuperFieldList()
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
    importExcelUrl: function () {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
    }
  },
  methods: {
    addurl(filename) {
      return getFileAccessHttpUrl(filename)
    },
    downloadFile(url) {
      var arr = url.split(",");
      arr.map((v) => {
        const formData = new FormData()
        formData.append('fileUrl', v)
        axios({
          url: '/api/mission_b/mission/file/download',
          data: formData,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Access-Token': JSON.parse(localStorage.getItem('pro__Access-Token')).value
          },
          responseType: 'blob',
          method: 'post'
        }).then(res => {
          console.log(res)
          const blob = new Blob([res.data], {
            type: getFileType(v)
          })
          console.log(blob)
          const objectUrl = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.download = '附件'
          a.href = objectUrl
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
        })
      })

    },
    // 点击查看的方法
    check(record) {
      this.knowledgeData = record
      this.checkVisible = true
    },
    getPcaText(code) {
      return this.pcaData.getText(code)
    },
    initDictConfig() {
      loadCategoryData({ code: 'B03' }).then(res => {
        if (res.success) {
          this.$set(this.dictOptions, 'type', res.result)
        }
      })
    },
    getSuperFieldList() {
      let fieldList = []
      fieldList.push({ type: 'string', value: 'title', text: '知识标题', dictCode: '' })
      fieldList.push({ type: 'string', value: 'type', text: '知识类型', dictCode: 'B03' })
      fieldList.push({ type: 'int', value: 'status', text: '知识状态', dictCode: 'publish_type_status' })
      // fieldList.push({type:'pca',value:'region',text:'地区'})
      this.superFieldList = fieldList
    }
  }
}
</script>
<style scoped>
@import '~@assets/less/common.less';
</style>

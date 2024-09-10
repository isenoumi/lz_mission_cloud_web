<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="电话号码">
              <a-input placeholder="请输入电话号码" v-model="queryParam.wxPhone"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="姓名">
              <a-input placeholder="请输入姓名" v-model="queryParam.wxNickname"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="反馈内容">
              <a-input placeholder="请输入反馈内容" v-model="queryParam.problemStatement"></a-input>
            </a-form-item>
          </a-col>

          <template v-if="toggleSearchStatus"> </template>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
              <!-- <a @click="handleToggleSearch" style="margin-left: 8px">
                {{ toggleSearchStatus ? '收起' : '展开' }}
                <a-icon :type="toggleSearchStatus ? 'up' : 'down'"/>
              </a> -->
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <!-- 查询区域-END -->

    <!-- 操作按钮区域 -->
    <!-- <div class="table-operator">
      <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>
      <a-button type="primary" icon="download" @click="handleExportXls('随手拍，问，说')">导出</a-button>
      <a-upload
        name="file"
        :showUploadList="false"
        :multiple="false"
        :headers="tokenHeader"
        :action="importExcelUrl"
        @change="handleImportExcel"
      >
        <a-button type="primary" icon="import">导入</a-button>
      </a-upload>
      <j-super-query
        :fieldList="superFieldList"
        ref="superQueryModal"
        @handleSuperQuery="handleSuperQuery"
      ></j-super-query>
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel"><a-icon type="delete" />删除</a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down"/></a-button>
      </a-dropdown>
    </div> -->

    <!-- table区域-begin -->
    <div>
      <!-- <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择
        <a style="font-weight: 600">{{ selectedRowKeys.length }}</a
        >项
        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
      </div> -->

      <a-table ref="table" size="middle" :scroll="{ x: true }" bordered rowKey="id" :columns="columns" :dataSource="dataSource" :pagination="ipagination" :loading="loading" class="j-table-force-nowrap" @change="handleTableChange">
        <template slot="htmlSlot" slot-scope="text">
          <div v-html="text"></div>
        </template>
        <template slot="imgSlot" slot-scope="text, record">
          <span v-if="!text" style="font-size: 12px;font-style: italic;">无图片</span>
          <img v-else :src="getImgView(text)" :preview="record.id" height="25px" alt="" style="max-width:80px;font-size: 12px;font-style: italic;" />
        </template>
        <template slot="fileSlot" slot-scope="text">
          <span v-if="!text" style="font-size: 12px;font-style: italic;">无文件</span>
          <a-button v-else :ghost="true" type="primary" icon="download" size="small" @click="downloadFile(text)">
            下载
          </a-button>
        </template>

        <span slot="action" slot-scope="text, record">
          <!-- <a @click="handleEdit(record)">编辑</a> -->
          <a @click="handleDetail(record)">详情</a>
          <span v-if="record.problemStatus == 'RECEIVED' || record.problemStatus == 'PROCESSING'">
            <a-divider type="vertical" />
            <a @click="reply(record.id)">回复</a>
          </span>
          <span v-has="'distribute'" v-if="record.problemStatus == 'RECEIVED'">
            <a-divider type="vertical" />
            <a @click="distribute(record.id)">下发</a>
          </span>
          <!-- <a-dropdown>
            <a class="ant-dropdown-link">更多 <a-icon type="down"/></a>
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
          </a-dropdown> -->
        </span>
      </a-table>
    </div>
    <a-modal v-model:visible="showReply" title="回复" @ok="handleOk">
      <a-form ref="replyform" :model="form" :rules="validatorRules" layout="horizontal">
        <a-form-item label="回复内容" prop="replyContent" required :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input type="textarea" v-model="form.replyContent" placeholder="请输入回复内容"></a-input>
        </a-form-item>
      </a-form>
    </a-modal>
    <a-modal v-model:visible="showDistribute" title="下发" @ok="handleDistribute">
      <a-form ref="distributeForm" :model="distributeForm" layout="horizontal">
        <a-form-item label="下发人员" prop="userId" required :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select v-model:value="distributeForm.userId" showSearch allowClear style="width: 100%" placeholder="请选择下发人员">
            <a-select-option v-for="(item, index) in userList" :value="item.value" :key="index">{{
              item.label
            }}</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
    <bkb-conveniently-type-modal ref="modalForm" @ok="modalFormOk"></bkb-conveniently-type-modal>
  </a-card>
</template>

<script>
  import '@/assets/less/TableExpand.less'
  import { mixinDevice } from '@/utils/mixin'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import BkbConvenientlyTypeModal from './modules/BkbConvenientlyTypeModal'
  import { httpAction, getAction } from '@/api/manage'

  export default {
    name: 'BkbConvenientlyTypeList',
    mixins: [JeecgListMixin, mixinDevice],
    components: {
      BkbConvenientlyTypeModal,
    },
    data() {
      return {
        convenientlyType: 'SAY_WHATEVER_YOU_WANT',
        description: '随手拍，问，说管理页面',
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
            },
          },
          // {
          //   title: '工单编号',
          //   align: 'center',
          //   dataIndex: 'problemNo'
          // },
          {
            title: '姓名',
            align: 'center',
            dataIndex: 'wxNickname',
          },
          {
            title: '电话号码',
            align: 'center',
            dataIndex: 'wxPhone',
          },
          {
            title: '反馈内容',
            align: 'center',
            dataIndex: 'problemStatement',
            customRender: function (t, r, index) {
              console.log(t)
              let text = ''
              if (t && t.length > 25) {
                text = t.slice(0, 25) + '...'
              } else text = t
              return text
            },
          },
          {
            title: '问题图片',
            align: 'center',
            dataIndex: 'problemFile',
            scopedSlots: { customRender: 'imgSlot' },
          },
          {
            title: '提出时间',
            align: 'center',
            dataIndex: 'createTime',
          },
          // {
          //   title: '问题分类',
          //   align: 'center',
          //   dataIndex: 'problemType',
          //   customRender: function(t, r, index) {
          //     let text = ''
          //     switch (t) {
          //       case 'URBAN_MANAGEMENT_COMPONENTS':
          //         text = '城管事部件'
          //         break
          //       case 'GARBAGE_SORTING':
          //         text = '垃圾分类'
          //         break
          //       case 'LIVELIHOOD_COMPLAINTS':
          //         text = '民生投诉'
          //         break
          //       case 'OTHERS':
          //         text = '其他'
          //         break
          //     }
          //     return text
          //   }
          // },
          // {
          //   title: '问题定位经度',
          //   align: 'center',
          //   dataIndex: 'problemLongitude'
          // },
          // {
          //   title: '问题定位纬度',
          //   align: 'center',
          //   dataIndex: 'problemLatitude'
          // },
          // {
          //   title: '问题提示',
          //   align: 'center',
          //   dataIndex: 'problemTips'
          // },
          // {
          //   title: '详细地址',
          //   align: 'center',
          //   dataIndex: 'address'
          // },

          // {
          //   title: '问题状态',
          //   align: 'center',
          //   dataIndex: 'problemStatus',
          //   customRender: function(t, r, index) {
          //     let text = ''
          //     switch (t) {
          //       case 'RECEIVED':
          //         text = '已接收'
          //         break
          //       case 'PROCESSING':
          //         text = '办理中'
          //         break
          //       case 'REPLIED':
          //         text = '已回复'
          //         break
          //       case 'HANDLED':
          //         text = '已办理'
          //         break
          //     }
          //     return text
          //   }
          // },
          {
            title: '操作',
            dataIndex: 'action',
            align: 'center',
            fixed: 'right',
            width: 147,
            scopedSlots: { customRender: 'action' },
          },
        ],
        url: {
          list: '/mission/bkbConvenientlyType/list',
          delete: '/mission/bkbConvenientlyType/delete',
          deleteBatch: '/mission/bkbConvenientlyType/deleteBatch',
          exportXlsUrl: '/mission/bkbConvenientlyType/exportXls',
          importExcelUrl: 'mission/bkbConvenientlyType/importExcel',
        },
        dictOptions: {},
        showReply: false,
        showDistribute: false,
        form: {
          replyContent: '',
        },
        distributeForm: {
          userId: '',
        },
        userList: [],
        validatorRules: {
          replyContent: [{ required: true, message: '请输入回复内容!' }],
        },
        labelCol: {
          xs: { span: 24 },
          sm: { span: 5 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 },
        },
        convenientlyId: '',
        superFieldList: [],
      }
    },
    created() {
      this.getSuperFieldList()
    },
    mounted() {
      // getAction('/sys/user/allUsers').then(res => {
      //   this.userList = res.result
      // })
    },
    computed: {
      importExcelUrl: function () {
        return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
      },
    },
    methods: {
      reply(convenientlyId) {
        this.showReply = true
        this.convenientlyId = convenientlyId
      },
      distribute(convenientlyId) {
        this.showDistribute = true
        this.convenientlyId = convenientlyId
      },
      handleOk() {
        if (!this.form.replyContent) {
          this.$message.warning('请输入回复内容')
          return
        }
        httpAction(
          '/mission/bkbConvenientlyReply/addReplys',
          { bkbConvenientlyReply: this.form, convenientlyId: this.convenientlyId },
          'post'
        )
          .then((res) => {
            if (res.success) {
              this.$message.success(res.message)
            } else {
              this.$message.warning(res.message)
            }
            this.showReply = false
            this.searchQuery()
            this.form.replyContent = ''
          })
          .finally(() => {})
        // console.log(this.$refs, this.$refs.replyform.validate)
        // this.$refs.replyform.validateFields((err, values) => {
        //   let httpurl = ''
        //   httpAction(httpurl, this.form, 'post')
        //     .then(res => {
        //       if (res.success) {
        //         this.$message.success(res.message)
        //         this.$emit('ok')
        //       } else {
        //         this.$message.warning(res.message)
        //       }
        //     })
        //     .finally(() => {})
        // })
      },
      handleDistribute() {
        if (!this.distributeForm.userId) {
          this.$message.warning('请选择下发人员')
          return
        }
        getAction('/mission/bkbConvenientlyType/editUser', { ...this.distributeForm, id: this.convenientlyId })
          .then((res) => {
            if (res.success) {
              this.$message.success(res.message)
            } else {
              this.$message.warning(res.message)
            }
            this.showDistribute = false
            this.distributeForm.userId = ''
            this.searchQuery()
          })
          .finally(() => {})
      },
      initDictConfig() {},
      getSuperFieldList() {
        let fieldList = []
        fieldList.push({ type: 'string', value: 'wxNickname', text: '微信昵称', dictCode: '' })
        fieldList.push({ type: 'string', value: 'wxPhone', text: '微信电话号码', dictCode: '' })
        fieldList.push({ type: 'string', value: 'problemStatement', text: '反馈内容', dictCode: '' })
        fieldList.push({ type: 'string', value: 'problemFile', text: '问题图片', dictCode: '' })
        fieldList.push({ type: 'string', value: 'convenientlyType', text: '随手拍，问，说类型', dictCode: '' })
        fieldList.push({ type: 'string', value: 'problemType', text: '问题分类', dictCode: '' })
        fieldList.push({ type: 'string', value: 'problemLongitude', text: '问题定位经度', dictCode: '' })
        fieldList.push({ type: 'string', value: 'problemLatitude', text: '问题定位纬度', dictCode: '' })
        fieldList.push({ type: 'string', value: 'problemTips', text: '问题提示', dictCode: '' })
        fieldList.push({ type: 'string', value: 'address', text: '详细地址', dictCode: '' })
        fieldList.push({ type: 'string', value: 'problemNo', text: '工单编号', dictCode: '' })
        fieldList.push({ type: 'string', value: 'problemStatus', text: '问题状态', dictCode: '' })
        this.superFieldList = fieldList
      },
    },
  }
</script>
<style scoped>
  @import '~@assets/less/common.less';
</style
>import { slice } from 'lodash'

<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <!--    <div class='table-page-search-wrapper'>-->
    <!--      <a-form layout='inline' @keyup.enter.native='searchQuery'>-->
    <!--        <a-row :gutter='24'>-->
    <!--          <a-col :xl='6' :lg='7' :md='8' :sm='24'>-->
    <!--            <a-form-item label='打卡天数'>-->
    <!--              <a-input placeholder='请输入打卡天数' v-model='queryParam.punchCardDay'></a-input>-->
    <!--            </a-form-item>-->
    <!--          </a-col>-->
    <!--          <a-col :xl='6' :lg='7' :md='8' :sm='24'>-->
    <!--            <a-form-item label='打卡积分'>-->
    <!--              <a-input placeholder='请输入打卡积分' v-model='queryParam.punchCardIntegral'></a-input>-->
    <!--            </a-form-item>-->
    <!--          </a-col>-->
    <!--          <a-col :xl='6' :lg='7' :md='8' :sm='24'>-->
    <!--            <span style='float: left;overflow: hidden;' class='table-page-search-submitButtons'>-->
    <!--              <a-button type='primary' @click='searchQuery' icon='search'>查询</a-button>-->
    <!--              <a-button type='primary' @click='searchReset' icon='reload' style='margin-left: 8px'>重置</a-button>-->
    <!--              <a @click='handleToggleSearch' style='margin-left: 8px'>-->
    <!--                {{ toggleSearchStatus ? '收起' : '展开' }}-->
    <!--                <a-icon :type="toggleSearchStatus ? 'up' : 'down'" />-->
    <!--              </a>-->
    <!--            </span>-->
    <!--          </a-col>-->
    <!--        </a-row>-->
    <!--      </a-form>-->
    <!--    </div>-->
    <!-- 查询区域-END -->

    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <!--      <a-button @click='handleAdd' type='primary' icon='plus'>新增</a-button>-->
      <!--      <a-button type="primary" icon="download" @click="handleExportXls('打卡设置')">导出</a-button>-->
      <!--      <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrl" @change="handleImportExcel">-->
      <!--        <a-button type="primary" icon="import">导入</a-button>-->
      <!--      </a-upload>-->
      <!-- 高级查询区域 -->
      <!--      <j-super-query :fieldList="superFieldList" ref="superQueryModal" @handleSuperQuery="handleSuperQuery"></j-super-query>-->
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
      <!--      <div class='ant-alert ant-alert-info' style='margin-bottom: 16px;'>-->
      <!--        <i class='anticon anticon-info-circle ant-alert-icon'></i> 已选择 <a-->
      <!--        style='font-weight: 600'>{{ selectedRowKeys.length }}</a>项-->
      <!--        <a style='margin-left: 24px' @click='onClearSelected'>清空</a>-->
      <!--      </div>-->

      <a-table
        ref="table"
        size="middle"
        :scroll="{ x: true }"
        bordered
        rowKey="id"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        class="j-table-force-nowrap"
        @change="handleTableChange"
      >
        <template slot="htmlSlot" slot-scope="text">
          <div v-html="text"></div>
        </template>
        <template slot="imgSlot" slot-scope="text, record">
          <span v-if="!text" style="font-size: 12px;font-style: italic;">无图片</span>
          <img
            v-else
            :src="getImgView(text)"
            :preview="record.id"
            height="25px"
            alt=""
            style="max-width:80px;font-size: 12px;font-style: italic;"
          />
        </template>
        <template slot="fileSlot" slot-scope="text">
          <span v-if="!text" style="font-size: 12px;font-style: italic;">无文件</span>
          <a-button v-else :ghost="true" type="primary" icon="download" size="small" @click="downloadFile(text)">
            下载
          </a-button>
        </template>

        <span slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)">编辑</a>

          <!--          <a-divider type='vertical' />-->
          <!--          <a-dropdown>-->
          <!--            <a class='ant-dropdown-link'>更多 <a-icon type='down' /></a>-->
          <!--            <a-menu slot='overlay'>-->
          <!--              <a-menu-item>-->
          <!--                <a @click='handleDetail(record)'>详情</a>-->
          <!--              </a-menu-item>-->
          <!--              <a-menu-item>-->
          <!--                <a-popconfirm title='确定删除吗?' @confirm='() => handleDelete(record.id)'>-->
          <!--                  <a>删除</a>-->
          <!--                </a-popconfirm>-->
          <!--              </a-menu-item>-->
          <!--            </a-menu>-->
          <!--          </a-dropdown>-->
        </span>
      </a-table>
    </div>

    <bkb-punch-card-setting-modal ref="modalForm" @ok="modalFormOk"></bkb-punch-card-setting-modal>
  </a-card>
</template>

<script>
import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import BkbPunchCardSettingModal from './modules/BkbPunchCardSettingModal'

export default {
  name: 'BkbPunchCardSettingList',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    BkbPunchCardSettingModal
  },
  data() {
    return {
      description: '打卡设置管理页面',
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
          title: '打卡类型',
          align: 'center',
          dataIndex: 'punchType'
        },
        {
          title: '每日最多打卡次数',
          align: 'center',
          dataIndex: 'punchCount'
        },
        {
          title: '可打卡时段',
          align: 'center',
          dataIndex: 'status',
          customRender: function(t, r, index) {
            if (t == 0) return '全天'
            else {
              let timeText = ''
              r.bkbSetTime.map(item => {
                timeText += `${item.startTime}-${item.endTime}、`
              })
              return timeText.slice(0, timeText.length - 1)
            }
          }
        },
        {
          title: '限制辖区',
          align: 'center',
          dataIndex: 'area'
        },
        {
          title: '每次打卡可获得积分',
          align: 'center',
          dataIndex: 'punchCardIntegral'
        },
        // {
        //   title: '设置日期',
        //   align: 'center',
        //   dataIndex: 'updateTime',
        //   customRender: function(t, r, index) {
        //     // 默认显示更新日期,如果更新日期为空就显示创建日期
        //     return t ? t : r.createTime
        //   }
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
        list: '/mission/bkbPunchCardSetting/list',
        delete: '/mission/bkbPunchCardSetting/delete',
        deleteBatch: '/mission/bkbPunchCardSetting/deleteBatch',
        exportXlsUrl: '/mission/bkbPunchCardSetting/exportXls',
        importExcelUrl: 'mission/bkbPunchCardSetting/importExcel'
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
    initDictConfig() {},
    getSuperFieldList() {
      let fieldList = []
      fieldList.push({ type: 'int', value: 'punchCardDay', text: '打卡天数', dictCode: '' })
      fieldList.push({ type: 'int', value: 'punchCardIntegral', text: '打卡积分', dictCode: '' })
      this.superFieldList = fieldList
    }
  }
}
</script>
<style scoped>
@import '~@assets/less/common.less';
</style>

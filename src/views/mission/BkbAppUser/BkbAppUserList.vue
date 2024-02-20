<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :xl="4" :lg="7" :md="8" :sm="24">
            <a-form-item label="用户昵称">
              <a-input placeholder="请输入姓名" v-model="queryParam.nickName"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xl="4" :lg="12" :md="12" :sm="10">
            <a-form-item label="手机号">
              <a-input placeholder="请输入手机号" v-model="queryParam.phone"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xl="4">
            <a-form-item label="注册时间">
              <a-date-picker valueFormat="YYYY-MM-DD" v-model:value="queryParam.createTime" />
            </a-form-item>
          </a-col>
          <!-- <a-col :xl='4'>
            <a-form-item label='所在小区'>
              <a-select ref="select" v-model:value="queryParam.community" :options="residentialList">
              </a-select>
            </a-form-item>
          </a-col> -->
          <a-col :xl="4">
            <a-form-item label="所属单位">
              <a-select
                ref="select"
                v-model:value="queryParam.mainBody"
                placeholder="请选择所属单位"
                :options="unitList"
              >
              </a-select>
            </a-form-item>
          </a-col>
          <a-col>
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
              <a-button type="primary" icon="download" style="margin-left: 8px" @click="handleExportXls('小程序用户表')"
                >导出</a-button
              >
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <!-- 查询区域-END -->

    <!-- 操作按钮区域 -->
    <div class="table-operator"></div>
    <div>
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

        <template slot="avatarUrl" slot-scope="text, record">
          <span v-if="!text" style="font-size: 12px;font-style: italic;">无图片</span>
          <img
            v-else
            :src="record.avatarUrl"
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
          <div style="color: blue;cursor:pointer" @click="getView(record.phone, record)">详情</div>
          <!-- <template>
            <BkbOperatingRecordView ref='modalView' />
          </template> -->
        </span>
      </a-table>
    </div>
    <a-modal v-model:visible="visible" title="详情" @cancel="cancel" width="53%" cancelText="关闭">
      <div class="msktitle">
        <!-- <div class="imgs"><img style="width: 100%;height: 100%;"
            :src="details.avatarUrl || 'https://oms.cestech.com.cn/file/9a1342a37fe8428892cb09e174ef5381/头像.png'" /></div> -->
        <div class="infobox">
          <div class="box">
            <div>用户昵称：{{ details.nickName || '暂未填写' }}</div>
            <div>性别：{{ details.gender_dictText || '暂未填写' }}</div>
            <div>电话号码：{{ details.phone || '暂未填写' }}</div>
            <div>所属单位：{{ details.mainBody || '暂未填写' }}</div>
          </div>
          <div class="box" style="margin-top: 20px;">
            <div style="width: 320px;">所在地区：{{ details.userArea }}</div>
            <div>
              所在小区：{{ details.community || '暂未填写' }}{{ details.floor }}{{ details.unit }}{{ details.number }}
            </div>
            <div>注册时间：{{ details.createTime }}</div>
            <div>剩余积分：{{ details.points }}</div>
          </div>
        </div>
      </div>
      <div class="integral">积分明细</div>
      <!-- <div class="integral">
        <div class="integral-select">
          <div>积分类型: </div>
          <div>
            <a-select style="width: 160px;margin-left: 20px;" ref="select" v-model:value="residentials"
              :options="options1">
            </a-select>
          </div>
        </div>
        <div>剩余积分：{{ details.points }}</div>
      </div> -->
      <div style="margin-left: 20px;margin-top: 20px;">
        <el-table
          :data="tableData"
          :header-row-style="{ height: '60px' }"
          :row-style="{ height: '50px' }"
          :border="true"
          style="width: 900px"
          :cell-style="{ textAlign: 'center' }"
          :header-cell-style="{
            'text-align': 'center',
            background: '#eef1f6',
            color: '#606266'
          }"
        >
          <el-table-column type="index" width="60" label="序号" />
          <el-table-column prop="type" label="积分来源" />
          <!-- <el-table-column prop="pointRecycler" label="操作前积分" /> -->
          <!-- <el-table-column prop="pointHeader" label="本次积分" /> -->
          <el-table-column prop="integral" label="积分类型" />
          <!-- <el-table-column prop="mainBodyAssortsId" label="剩余积分" /> -->
          <el-table-column prop="createTime" label="时间" />
        </el-table>
      </div>
      <div class="pagess" v-if="pageshow">
        <el-pagination
          @size-change="sizeChange"
          @current-change="currentChange"
          background
          layout="prev, pager, next"
          :total="totals"
        />
      </div>
      <template slot="footer">
        <a-button @click="visible = false">关闭</a-button>
      </template>
    </a-modal>
    <bkb-app-user-modal ref="modalForm" @ok="modalFormOk"></bkb-app-user-modal>
  </a-card>
</template>

<script>
import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import BkbAppUserModal from './modules/BkbAppUserModal'
import BkbOperatingRecordView from '@views/mission/BkbOperatingRecord/modules/BkbOperatingRecordView'
import { message } from 'ant-design-vue'
import axios from 'axios'
export default {
  name: 'BkbAppUserList',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    BkbAppUserModal,
    BkbOperatingRecordView
  },
  data() {
    return {
      spinning: false,
      pageshow: false,
      pageNo: 1,
      pagesize: 10,
      totals: 100,
      residentials: '全部',
      unitList: [],
      residentialList: [],
      details: {},
      tableData: [],
      visible: false,
      description: '小程序用户管理页面',
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
          title: '用户昵称',
          align: 'center',
          dataIndex: 'nickName',
          customRender: function(t, r, index) {
            return t ? t : '暂未填写'
          }
        },
        // {
        //   title: '头像',
        //   align: 'center',
        //   dataIndex: 'avatarUrl'
        // },
        {
          title: '性别',
          align: 'center',
          dataIndex: 'gender_dictText'
        },
        {
          title: '电话号码',
          align: 'center',
          dataIndex: 'phone',
          customRender: function(t, r, index) {
            return t ? t : '暂未填写'
          }
        },
        {
          title: '所在地区',
          align: 'center',
          dataIndex: 'userArea',
          customRender: function(t, r, index) {
            return t ? t : '暂未填写'
          }
        },
        {
          title: '所在小区',
          align: 'center',
          dataIndex: 'community',
          customRender: function(t, r, index) {
            return t ? t : '暂未填写'
          }
        },
        {
          title: '所属楼栋',
          align: 'center',
          dataIndex: 'floor',
          customRender: function(t, r, index) {
            return t ? t : '暂未填写'
          }
        },
        {
          title: '所属单元',
          align: 'center',
          dataIndex: 'unit',
          customRender: function(t, r, index) {
            return t ? t : '暂未填写'
          }
        },
        {
          title: '所属房号',
          align: 'center',
          dataIndex: 'number',
          customRender: function(t, r, index) {
            return t ? t : '暂未填写'
          }
        },
        {
          title: '所属单位',
          align: 'center',
          dataIndex: 'mainBody',
          customRender: function(t, r, index) {
            return t ? t : '暂未填写'
          }
        },
        {
          title: '注册时间',
          align: 'center',
          dataIndex: 'createTime',
          customRender: function(t, r, index) {
            return t ? t : '暂未填写'
          }
        },

        {
          title: '积分',
          align: 'center',
          dataIndex: 'points'
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
        list: '/mission/bkbAppUser/list',
        delete: '/mission/bkbAppUser/delete',
        deleteBatch: '/mission/bkbAppUser/deleteBatch',
        exportXlsUrl: '/mission/bkbAppUser/exportXls',
        importExcelUrl: 'mission/bkbAppUser/importExcel'
      },
      iphone: '',
      dictOptions: {},
      superFieldList: [],
      options1: [
        {
          value: '1',
          label: '全部'
        },
        {
          value: '2',
          label: '增加'
        },
        {
          value: '3',
          label: '减少'
        }
      ]
    }
  },
  created() {
    this.getSuperFieldList()
    this.getCommunity()
    this.getArea()
  },
  computed: {
    importExcelUrl: function() {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
    }
  },
  methods: {
    setTips() {
      message.info('正在下载文件, 请稍后...')
    },
    currentChange(v) {
      console.log('vvvx', v)
      this.pageNo = v
      this.getrecord()
    },
    sizeChange(v) {
      console.log('vvv', v)
    },
    getArea() {
      axios.get('https://lz.api.cestech.com.cn:8150/mission_b/xcx_api/bkbAppUser/getArea').then(
        // 成功回调
        success => {
          this.unitList = success.data.result
          console.log('请求成功！', success.data.result)
        },
        // 失败回调
        error => {
          console.log('请求失败！')
        }
      )
    },
    getCommunity() {
      axios.get('https://lz.api.cestech.com.cn:8150/mission_b/xcx_api/bkbAppUser/getCommunity').then(
        // 成功回调
        success => {
          this.residentialList = success.data.result
          console.log('请求成功！', success.data.result)
          // 请求成功后的数据
          // console.log(success.data)
        },
        // 失败回调
        error => {
          console.log('请求失败！')
        }
      )
    },
    getrecord() {
      axios
        .get(
          `https://lz.api.cestech.com.cn:8150/mission_b/xcx_api/bkbAppUser/pointsHistory?phone=${this.iphone}&pageNo=${this.pageNo}&pagesize=${this.pagesize}`
        )
        .then(
          // 成功回调
          success => {
            this.totals = success.data.result.total
            this.tableData = success.data.result.records
            console.log('积分记录', this.tableData)
            // 请求成功后的数据
            // console.log(success.data)
          },
          // 失败回调
          error => {
            console.log('请求失败！')
          }
        )
    },
    indexMethod(index) {
      return index
    },
    initDictConfig() {},
    cancel() {
      this.pageshow = false
    },
    getView(id, item) {
      console.log(item, 'xx')
      this.details = item
      this.visible = true
      this.pageNo = 1
      this.pageshow = true
      this.iphone = id
      this.getrecord()

      // this.$refs.modalView.title = v.nickName + '积分操作记录'
      // this.$refs.modalView.visible = true
      // this.$refs.modalView.changView(v)
    },
    getSuperFieldList() {
      let fieldList = []
      fieldList.push({ type: 'string', value: 'nickName', text: '姓名', dictCode: '' })
      fieldList.push({ type: 'string', value: 'huadUrl', text: '头像地址', dictCode: '' })
      fieldList.push({ type: 'string', value: 'points', text: '积分', dictCode: '' })
      fieldList.push({ type: 'string', value: 'phone', text: '手机号', dictCode: '' })
      this.superFieldList = fieldList
    }
  }
}
</script>
<style scoped lang="less">
@import '~@assets/less/common.less';

.msktitle {
  display: flex;
  align-items: center;
}
.pagess {
  margin-top: 20px;

  display: flex;
  justify-content: flex-end;
  margin-right: 35px;
}

.imgs {
  width: 80px;
  height: 80px;
  margin-left: 20px;
  border: 1px solid red;
}

.infobox {
  margin-left: 20px;
}

.box {
  width: 900px;
  display: flex;
  align-items: center;

  div {
    width: 220px;
  }

  /* justify-content: space-around; */
}

.integral {
  margin-left: 20px;
  width: 900px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
}

.integral-select {
  display: flex;
  align-items: center;
}
</style>

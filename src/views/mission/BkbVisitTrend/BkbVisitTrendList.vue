<template>
  <a-card :bordered='false'>
    <!-- 操作按钮区域 -->
    <div class='table-operator'>
      <a-descriptions :column='5'>
        <!--        <a-descriptions-item label='打开次数'>-->
        <!--          {{ data1.a }}-->
        <!--        </a-descriptions-item>-->
        <a-descriptions-item label='访问次数'>
          {{ data1.a }}
        </a-descriptions-item>
        <a-descriptions-item label='访问人数'>
          {{ data1.b }}
        </a-descriptions-item>
        <a-descriptions-item label='新用户数'>
          {{ data1.c }}
        </a-descriptions-item>
      </a-descriptions>
    </div>
    <div>
      <a-divider  orientation="left">注意</a-divider>
      <p style='color: red'>
        左上角周数据默认查询当前周数据选项,因为微信统计延迟一天,默认查询时无法在周一时查询周一数据
      </p>
    </div>

    <!-- table区域-begin -->
    <div>
      <a-card :bordered='false'>
        <a-tabs defaultActiveKey='1'>

          <a-tab-pane tab='小程序访问量' key='1'>
            <a-row>
              <a-col :span='5'>
                <a-radio-group :value='barType' @change='statisticst'>
                  <a-radio-button value='year'>本周</a-radio-button>
                  <a-radio-button value='month'>本月</a-radio-button>
                </a-radio-group>
              </a-col>
              <a-col :span='14'>
                <a-form layout='inline' style='margin-top: -4px'>
                  <a-form-item label='访问时间'>
                    <j-date :showTime='false' :disabled-date='disabledEndDate' :show-time='true'
                            date-format='YYYY-MM-DD' placeholder='请选择开始时间'
                            class='query-group-cust' v-model='queryParam.product_begin'></j-date>
                    <span class='query-group-split-cust'></span>
                    <j-date :showTime='false' :disabled-date='disabledEndDate' :show-time='true'
                            date-format='YYYY-MM-DD' placeholder='请选择结束时间'
                            class='query-group-cust' v-model='queryParam.product_end'></j-date>
                  </a-form-item>
                  <a-button style='margin-top: 2px' type='primary' icon='search' @click='queryDatebar("interregional")'>
                    查询
                  </a-button>
                  <a-button style='margin-top: 2px;margin-left: 8px' type='primary' icon='reload' @click='searchReset1'>
                    重置
                  </a-button>
                </a-form>
              </a-col>
            </a-row>
            <a-row>
              <a-col :span='18'>
                <div ref='chart' style='height: 60vh;'></div>
              </a-col>
              <a-col :span='6'>
                <div style='text-align: center;'>
                  <h3>积分排名统计</h3>
                </div>
                <a-divider type='horizontal' />
                <a-carousel autoplay dot-position='top'>
                  <div v-for='(item, index) in arrayget()'>
                    <BkbVisitTrendRanking :dynameter='10 * index' :data='arrayget2(index)' />
                  </div>
                </a-carousel>
              </a-col>
            </a-row>
          </a-tab-pane>
        </a-tabs>
      </a-card>
    </div>

    <bkb-visit-trend-modal ref='modalForm' @ok='modalFormOk'></bkb-visit-trend-modal>
  </a-card>
</template>

<script>

import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import BkbVisitTrendModal from './modules/BkbVisitTrendModal'
import { getAction } from '@api/manage'
import * as echarts from 'echarts'
import moment from 'moment'
import BkbVisitTrendRanking from '@views/mission/BkbVisitTrend/modules/BkbVisitTrendRanking'


export default {
  name: 'BkbVisitTrendList',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    BkbVisitTrendModal,
    BkbVisitTrendRanking
  },
  data() {
    return {
      // 查询条件
      queryParam: {},
      // 数据集
      countSource: [],
      // 柱状图
      barType: 'year',
      barDate: ['month', 'month'],
      barValue: [],
      arrayData: [],
      description: '访问趋势表管理页面',
      data1: {
        a: 0,
        b: 0,
        c: 0,
        d: 0
      },
      url: {
        list: '/mission/bkbVisitTrend/list',
        dateRange: '/mission/bkbVisitTrend/dateRange',
        articleHits: '/mission/bkbAppUser/articleHits',
        delete: '/mission/bkbVisitTrend/delete',
        deleteBatch: '/mission/bkbVisitTrend/deleteBatch',
        exportXlsUrl: '/mission/bkbVisitTrend/exportXls',
        importExcelUrl: 'mission/bkbVisitTrend/importExcel'
      },
      dictOptions: {},
      superFieldList: []
    }
  },
  created() {
    this.getSuperFieldList()
    this.loadDate()
    this.articleHits()
  },
  mounted() {
    this.initChart()
    window.addEventListener('resize', this.resizeChart)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeChart)
  },
  computed: {
    importExcelUrl: function() {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
    }
  },
  methods: {
    articleHits() {
      getAction(this.url.articleHits).then(res => {
        if (res.success) {
          this.arrayData = res.result
        } else {
          this.$message.warning(res.message)
        }
      })
    },
    initChart() {
      this.chart = echarts.init(this.$refs.chart, null, {
        renderer: 'canvas',
        useDirtyRect: false
      })

      this.chart.setOption({
        legend: {
          width: 'auto'
        },
        tooltip: {},
        dataset: {
          source: this.countSource
        },
        xAxis: {
          type: 'category',
          nameTextStyle: {
            overflow: 'break'
          },
          axisTick: {
            alignWithLabel: true
          }
        },
        yAxis: {},
        series: [{ type: 'bar' }, { type: 'bar' }, { type: 'bar' }]
      })
    },
    resizeChart() {
      this.chart.resize()
    },
    loadDate() {
      this.queryDatebar()
    },
    // 选择统计类别
    statisticst(e) {
      if (this.tabStatus === 'pie') {
        this.pieType = e.target.value
      } else {
        this.barType = e.target.value
      }
      this.queryDatebar(e.target.value === 'year' ? 'thisWeek' : 'thisMonth')
    },
    disabledEndDate(val) {
      //今天之前,今日数据小程序不一定更新会出错
      return val >= moment(new Date(), 'YYYY-MM-DD HH:mm:ss').subtract(1, 'day').endOf('day')
    },
    //循环几次
    arrayget() {
      //轮播
      let v = Number.parseInt(String(this.arrayData.length / 10)) + 1
      return v >= 3 ? 2 : v
      // return 2
    },
    //取值
    arrayget2(v) {
      return this.arrayData.slice(v * 10, v * 10 + 10)
    },
    searchReset1() {
      this.queryParam = {}
    },
    // 份查询,默认本周
    queryDatebar(type = 'thisWeek') {
      this.data1 = {}
      this.countSource = []
      console.log(this.queryParam.product_begin, this.queryParam.product_end)
      getAction(this.url.dateRange, {
        'beginDate': this.queryParam.product_begin,
        'endDate': this.queryParam.product_end,
        'type': type
      }).then(res => {
        if (res.success) {
          if (res.result.length <= 2) {
            this.$message.warning('查询结果为空')
            return
          }
          this.countSource = []
          let array = res.result
          let sum = array[array.length - 1]
          this.data1 = {
            a: sum[1],
            b: sum[2],
            c: sum[3],
            d: sum[4]
          }
          delete array[array.length - 1]
          this.countSource = array.filter(v => v)
          this.initChart()
        } else {
          this.$message.warning(res.message)
        }
      }).finally(v => {
        this.articleHits()
      })
    },
    initDictConfig() {
    },
    getSuperFieldList() {
      let fieldList = []
      fieldList.push({ type: 'date', value: 'refDate', text: '日期' })
      fieldList.push({ type: 'string', value: 'sessionCnt', text: '打开次数', dictCode: '' })
      fieldList.push({ type: 'string', value: 'visitPv', text: '访问次数', dictCode: '' })
      fieldList.push({ type: 'string', value: 'visitUv', text: '访问人数', dictCode: '' })
      fieldList.push({ type: 'string', value: 'visitUvNew', text: '新用户数', dictCode: '' })
      this.superFieldList = fieldList
    }
  }
}
</script>
<style scoped>
@import '~@assets/less/common.less';
/* For demo */
.ant-carousel >>> .slick-slide {
  text-align: center;
  height: 100%;
  line-height: 160px;
  /*background: #c0c2c5;*/
  overflow: hidden;
}

.ant-carousel >>> .slick-slide h3 {
  color: #fff;
}
</style>
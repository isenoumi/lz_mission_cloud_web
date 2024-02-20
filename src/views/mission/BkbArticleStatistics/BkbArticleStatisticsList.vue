<template>
  <a-card :bordered='false'>
    <!-- 查询区域 -->
    <div class='table-page-search-wrapper'>

    </div>
    <!-- 查询区域-END -->

    <!-- 操作按钮区域 -->
    <div class='table-operator'>
      <a-descriptions :column='5'>
        <a-descriptions-item label='文章点击量'>
          {{ data1.a }}
        </a-descriptions-item>
        <a-descriptions-item label='文章阅读量'>
          {{ data1.b }}
        </a-descriptions-item>
      </a-descriptions>
    </div>

    <!-- table区域-begin -->
    <div>
      <a-card :bordered='false'>
        <a-tabs defaultActiveKey='1'>

          <a-tab-pane tab='文章访问量' key='1'>
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
                  <h3>文章点击量排行榜统计</h3>
                </div>
                <a-divider type='horizontal' />
                <a-carousel autoplay dot-position='top'>
                  <div v-for='(item, index) in arrayget()'>
                    <BkbArticleStatisticsRanking :dynameter='10 * index' :data='arrayget2(index)' />
                  </div>
                </a-carousel>
              </a-col>
            </a-row>
          </a-tab-pane>
        </a-tabs>
      </a-card>
    </div>


    <bkb-article-statistics-modal ref='modalForm' @ok='modalFormOk'></bkb-article-statistics-modal>
  </a-card>
</template>

<script>

import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import BkbArticleStatisticsModal from './modules/BkbArticleStatisticsModal'
import { getAction } from '@api/manage'
import * as echarts from 'echarts'
import moment from 'moment'
import BkbArticleStatisticsRanking from '@views/mission/BkbArticleStatistics/modules/BkbArticleStatisticsRanking'

export default {
  name: 'BkbArticleStatisticsList',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    BkbArticleStatisticsModal,
    BkbArticleStatisticsRanking
  },
  data() {
    return {
      description: '文章统计管理页面',
      // 查询条件
      queryParam: {},
      // 数据集
      countSource: [],
      // 柱状图
      barType: 'year',
      barValue: [],
      arrayData: [],
      data1: {
        a: 0,
        b: 0
      },
      url: {
        list: '/mission/bkbArticleStatistics/list',
        dateRange: '/mission/bkbArticleStatistics/dateRange',
        articleHits: '/mission/bkbArticleStatistics/articleHits',
        delete: '/mission/bkbArticleStatistics/delete',
        deleteBatch: '/mission/bkbArticleStatistics/deleteBatch',
        exportXlsUrl: '/mission/bkbArticleStatistics/exportXls',
        importExcelUrl: 'mission/bkbArticleStatistics/importExcel'

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
    //循环几次
    arrayget() {
      return Number.parseInt(String(this.arrayData.length / 10)) + 1
    },
    //取值
    arrayget2(v) {
      return this.arrayData.slice(v * 10, v * 10 + 10)
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
        series: [{ type: 'bar' }, { type: 'bar' }]
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
      return val >= moment(new Date(), 'YYYY-MM-DD HH:mm:ss').endOf('day')
    },
    searchReset1() {
      this.queryParam = {}
    },
    // 份查询,默认本周
    queryDatebar(type = 'thisWeek') {
      this.data1 = {}
      this.countSource = []
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
            b: sum[2]
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
      fieldList.push({ type: 'int', value: 'type', text: '点击|阅读', dictCode: '' })
      fieldList.push({ type: 'datetime', value: 'getDate', text: '点击时间' })
      fieldList.push({ type: 'string', value: 'appId', text: '小程序用户id', dictCode: '' })
      fieldList.push({ type: 'string', value: 'knowledgeId', text: '知识库id', dictCode: '' })
      fieldList.push({ type: 'string', value: 'title', text: '知识库标题', dictCode: '' })
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
<template>
  <div>

    <a-descriptions title='各项积分发放汇总' layout='vertical' :column='2' bordered>
      <a-descriptions-item label='打卡总积分'>
        {{ pointsSummary.dk }} 分
      </a-descriptions-item>
      <a-descriptions-item label='邀请总积分'>
        {{ pointsSummary.yq }} 分
      </a-descriptions-item>
      <a-descriptions-item label='答题总积分'>
        {{ pointsSummary.dt }} 分
      </a-descriptions-item>
      <a-descriptions-item label='小程序总积分'>
        {{ pointsSummary.xcx }} 分
      </a-descriptions-item>
      <a-descriptions-item label='求和总积分'>
        {{ pointsSummary.dk + pointsSummary.yq + pointsSummary.dt + pointsSummary.xcx }} 分
      </a-descriptions-item>
    </a-descriptions>

    <!--    <a-empty :description="false" />-->
    <!--        <index-chart v-if="indexStyle==1"></index-chart>-->
    <!--        <index-bdc v-if="indexStyle==2"></index-bdc>-->
    <!--        <index-task v-if="indexStyle==3"></index-task>-->
    <!--        <div style="width: 100%;text-align: right;margin-top: 20px">-->
    <!--          请选择首页样式：-->
    <!--          <a-radio-group v-model="indexStyle">-->
    <!--            <a-radio :value="1">统计图表</a-radio>-->
    <!--            <a-radio :value="2">统计图表2</a-radio>-->
    <!--            <a-radio :value="3">任务表格</a-radio>-->
    <!--          </a-radio-group>-->
    <!--        </div>-->
  </div>
</template>

<script>
import IndexChart from './IndexChart'
import IndexTask from './IndexTask'
import IndexBdc from './IndexBdc'
import { getAction } from '../../api/manage'

export default {
  name: 'Analysis',
  components: {
    IndexChart,
    IndexTask,
    IndexBdc
  },
  data() {
    return {
      pointsSummary: {},
      indexStyle: 1,
      url: {
        integralRecordSummation: '/mission/bkbOperatingRecord/integralRecordSummation'
      }
    }
  },
  created() {
    this.initDictConfig()
  },
  methods: {
    initDictConfig() {
      //积分汇总
      getAction(this.url.integralRecordSummation).then(res => {
        if (res.success) {
          this.pointsSummary = res.result
        }
      })
    }
  }
}
</script>
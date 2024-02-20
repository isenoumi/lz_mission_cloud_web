<template>
  <!--    // 查看模态框-->
  <div>
    <template>
      <div v-if="!courseData">
        <a-spin tip="Loading...">
          <div class="spin-content"></div>
        </a-spin>
      </div>
      <div v-if="courseData">
        <a-descriptions title="课程详情" :column="2">
          <a-descriptions-item label="课程名称">
            {{ courseData.name }}
          </a-descriptions-item>

          <a-descriptions-item label="是否答题">
            {{ answerData }}
          </a-descriptions-item>

<!--          <a-descriptions-item label="地区">-->
<!--            {{ regionData }}-->
<!--          </a-descriptions-item>-->

          <a-descriptions-item label="状态">
            {{ statusData }}
          </a-descriptions-item>
        </a-descriptions>
        <a-descriptions title="课程封面图">
          <div>
            <img :src="courseData.bgurl" width="400">
          </div>
        </a-descriptions>
        <a-descriptions title="课程内容">
          <div>
            <div v-html="courseData.info"></div>
          </div>
        </a-descriptions>
      </div>
    </template>
  </div>
</template>

<script>

import Area from '@comp/_util/Area'
import { getAction } from '@api/manage'
import { filterDictTextByCache } from '@comp/dict/JDictSelectUtil'

export default {
  name: 'BkpKnowledgeView',
  // 这里要注册
  components: {
  },
  // props有两种接受的方式,一种就是你那个对象,一个是数组,对象可以定义类型和默认值
  props:["courseId"],
  // props:{
  //   choiceqstData:{
  //     type:Object,
  //     default: {  }
  //   }
  // },
  data () {
    return {
      checkVisible:false,// false 时模态框关闭
      confirmLoading:false,
      regionData: '',
      answerData: '',
      statusData: '',
      courseData: '',
    }
  },
  // 组件要mounted生命周期
  mounted() {
    this.initDictConfig();
  },
  computed: {
  },
  methods: {
    initDictConfig(){
      getAction('/mission/bkbCourse/queryById', { id: this.courseId }).then(res => {
        if (res.success) {
          this.regionData = new Area(this.$Jpcaa).getText(res.result.region);
          this.answerData = filterDictTextByCache("yn", res.result.answer);
          this.statusData = filterDictTextByCache("publish_type_status", res.result.status);
          this.courseData = res.result;
        }
      });
    },
  }
}
</script>

<style scoped>

</style>
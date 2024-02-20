<template>
  <!--    // 查看模态框-->
  <div>
    <template>
      <div v-if="!choiceData">
        <a-spin tip="Loading...">
          <div class="spin-content"></div>
        </a-spin>
      </div>
      <div v-if="choiceData">
        <a-descriptions title="题库详情" :column="2">
          <a-descriptions-item label="题标题">
            {{ choiceData.choiceqstTitle }}
          </a-descriptions-item>

          <a-descriptions-item label="关联知识库">
            {{ choiceData.knowledgeTitle }}
          </a-descriptions-item>

<!--          <a-descriptions-item label="地区">-->
<!--            {{ regionData }}-->
<!--          </a-descriptions-item>-->

          <a-descriptions-item label="单选还是多选题">
            {{ choiceData.choiceType_dictText }}
          </a-descriptions-item>

          <a-descriptions-item label="题库状态">
            {{ choiceData.status_dictText }}
          </a-descriptions-item>
        </a-descriptions>
        <a-descriptions title="题库内容">
          <div>
            <div v-html="choiceData.choiceqstContent" :style="styleData"></div>
          </div>
        </a-descriptions>
        <a-descriptions title="题库答案">
          <div>
            <a-table
              v-if="answerData"
              rowKey="id"
              :columns="columns"
              :dataSource="answerData"
              :scroll="{x: true}"
              size="small"
              bordered
            ></a-table>
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
  props:["choiceqstData"],
  // props:{
  //   choiceqstData:{
  //     type:Object,
  //     default: {  }
  //   }
  // },
  data () {
    return {
      regionData: '',
      answerData: '',
      styleData: '',
      choiceData: '',
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
          title:'答案内容',
          align:"center",
          dataIndex: 'content',
        },
        {
          title:'是否正确答案',
          align:"center",
          dataIndex: 'rightAnswer_text'
        },
        {
          title:'状态',
          align:"center",
          dataIndex: 'status_text'
        }
      ],
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
      getAction("/mission/bkbChoiceqst/queryById", { id: this.choiceqstData.id }).then(res => {
        if (res.success) {
          if(!this.regionData){
            this.regionData = new Area(this.$Jpcaa).getText(res.result.region);
          }
          getAction('/mission/bkbChoiceqst/queryBkbChoiceqstAnswerByMainId', { id: this.choiceqstData.id }).then(res => {
            if (res.success) {
              this.answerData = res.result.map(val => {
                return  {...val, rightAnswer_text: filterDictTextByCache("yn", val.rightAnswer), status_text: filterDictTextByCache("tenant_status", val.status)};
              });
            }
          });
          this.choiceData = { ...res.result, choiceType_dictText: filterDictTextByCache("choice_question_type", res.result.choiceType), status_dictText: filterDictTextByCache("publish_type_status", res.result.status) };
        }
      });
      if(this.choiceqstData.styleRolling) {
        this.styleData = "height: 500px; overflow-y:auto;";
      }
    },
  }
}
</script>

<style scoped>

</style>
<template>
  <!--    // 查看模态框-->
  <div>
    <template>
      <div v-if="!newData">
        <a-spin tip="Loading...">
          <div class="spin-content"></div>
        </a-spin>
      </div>
      <div v-if="newData">
        <a-descriptions title="知识详情" :column="2">
          <a-descriptions-item label="知识标题">
            {{ newData.title }}
          </a-descriptions-item>

          <a-descriptions-item label="知识类型">
            {{ typeData }}
          </a-descriptions-item>

          <a-descriptions-item label="知识状态">
            {{ statusData }}
          </a-descriptions-item>
          <!--          <a-descriptions-item label="兑换所需积分">-->
          <!--            {{ integral }}-->
          <!--          </a-descriptions-item>-->
          <!--          <a-descriptions-item label="积分获取规则">-->
          <!--            {{ integralAcquisitionRule_dictText }}-->
          <!--          </a-descriptions-item>-->

          <!--          <a-descriptions-item label="知识地区">-->
          <!--            {{ areaData }}-->
          <!--          </a-descriptions-item>-->
        </a-descriptions>
        <a-descriptions title="知识封面图">
          <div>
            <img :src="newData.bgurl" width="400">
          </div>
        </a-descriptions>
        <a-descriptions title="知识内容">
          <div>
            <div v-html="newData.content" :style="styleData"></div>
          </div>
        </a-descriptions>
        <a-descriptions title="查看附件">
          <div>
            <div v-for="item, index in filesList" :key="index">
              <div style="color: blue;cursor:pointer" @click="downloadFile(item.value)">{{ item.name }}</div>
            </div>
            <!-- <div v-html="newData.files" :style="styleData"></div> -->
          </div>
        </a-descriptions>
      </div>
    </template>
  </div>
</template>

<script>

import Area from '@comp/_util/Area'
import { loadCategoryData } from '@api/api'
import { filterDictTextByCache } from '@comp/dict/JDictSelectUtil'
import { getAction } from '@api/manage'
import axios from 'axios'
import getFileType from '@/utils/getFileType'
export default {
  name: 'BkpKnowledgeView',
  // 这里要注册
  components: {
  },
  // props有两种接受的方式,一种就是你那个对象,一个是数组,对象可以定义类型和默认值
  props: ["knowledgeData"],
  // props:{
  //   knowledgeData:{
  //     type:Object,
  //     default: {  }
  //   }
  // },
  data() {
    return {
      checkVisible: false,// false 时模态框关闭
      confirmLoading: false,
      typeData: '',
      regionData: '',
      dictOptions: [],
      areaData: '',
      statusData: '',
      styleData: '',
      newData: '',
      integral: 0,
      filesList: [],
      integralAcquisitionRule_dictText: '',
    }
  },
  // 组件要mounted生命周期
  mounted() {
    this.initDictConfig();
  },
  computed: {
  },
  methods: {
    downloadFile(url) {
      const formData = new FormData()
      formData.append('fileUrl', url)
      axios({
        url: 'https://lz.api.cestech.com.cn:8150/mission_b/mission/file/download',
        data: formData,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Access-Token': JSON.parse(localStorage.getItem('pro__Access-Token')).value
        },
        responseType: 'blob',
        method: 'post'
      }).then(res => {
        console.log(res)
        const blob = new Blob([res.data], {
          type: getFileType(url)
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


    },
    initDictConfig() {
      getAction("/mission/bkbKnowledge/queryById", { id: this.knowledgeData.id }).then(res => {
        if (res.success) {
          loadCategoryData({ code: 'B03' }).then((re) => {
            if (re.success) {
              re.result.forEach(r => {
                if (r.value === res.result.type) {
                  this.typeData = r.text;
                  console.log(this.typeData, '请求')
                }
              });
            }
          })
          if (!this.areaData) {
            this.areaData = new Area(this.$Jpcaa).getText(res.result.region);
          }
          this.statusData = filterDictTextByCache("publish_type_status", res.result.status);
          this.newData = res.result;
          let srt = this.newData.files
          let arr = srt.split(",")
          arr.map((v) => {
            let str = v
            let arr = str.split('/')
            var len = arr.length
            console.log(arr[len - 1], 'xxxxxx');
            let data = {
              name:arr[len - 1],
              value:v
            }
            this.filesList.push(data)
          })
          // this.filesList = arr

          if (this.knowledgeData.styleRolling) {
            this.styleData = "height: 500px; overflow-y:auto;";
          }
        }
      });
    },
  }
}
</script>

<style scoped></style>
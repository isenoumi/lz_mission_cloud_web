<template>
  <div class="content">
    <el-card class="box-card">
      <div class="hear">
        <div><span>问卷标题：</span><el-input v-model="input" placeholder="请输入内容"></el-input></div>
        <div>
          <span>问卷状态：</span>
          <el-select v-model="value" placeholder="请选择">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </div>
        <div>
          <span>调研员：</span>
          <el-select v-model="value" placeholder="请选择">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </div>
      </div>
    </el-card>

  </div>
</template>
<script>
export default {
  name: 'questionnairesurvey',
  data() {
    return {
      input:'',
      options: [{
          value: '选项1',
          label: '黄金糕'
        }, {
          value: '选项2',
          label: '双皮奶'
        }, {
          value: '选项3',
          label: '蚵仔煎'
        }, {
          value: '选项4',
          label: '龙须面'
        }, {
          value: '选项5',
          label: '北京烤鸭'
        }],
        value: ''
    }
  },
  created() {

  },
  methods: {

  }

}
</script>
<style lang="less" scoped>
.content {
  background: #fff;
}

.box-card {
  width: 100%;
}
</style>
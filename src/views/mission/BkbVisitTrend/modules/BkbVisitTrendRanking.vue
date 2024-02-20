<template>
  <a-list item-layout='horizontal' :data-source='data' class='demo-loadmore-list'>
    <a-list-item :column='10' slot='renderItem' slot-scope='item, index'>
      <a-list-item-meta
        description=''
      >
        <a slot='title'>{{ item.nickName }}</a>
        <a-avatar slot='avatar'>{{ index + dynameter + 1 }}</a-avatar>
      </a-list-item-meta>
      <div>{{ item.points }}积分</div>
    </a-list-item>
  </a-list>
</template>

<script>


export default {
  name: 'BkbVisitTrendRanking',
  components: {},
  props: {
    data: {
      type: Array,
      default: []
    },
    dynameter: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      title: '',
      width: 800,
      visible: false,
      disableSubmit: false
    }
  },
  methods: {}
}
</script>
<style scoped>
.demo-loadmore-list {
  min-height: 100%;
}
</style>
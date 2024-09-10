<template>
  <!--    // 查看模态框-->
  <j-modal
    :visible="visible"
    :confirmLoading="confirmLoading"
    :width="1000"
    title="反馈详情"
    switchFullscreen
    @ok="handleCancel"
    @cancel="handleCancel"
    cancelText="关闭"
  >
    <template>
      <div>
        <a-tabs default-active-key="1">
          <a-tab-pane key="1" tab="基础信息">
            <a-descriptions size="small" bordered :column="2">
              <a-descriptions-item label="活动名称">
                {{ modal.name }}
              </a-descriptions-item>
              <a-descriptions-item label="类型">
                {{ modal.type_dictText }}
              </a-descriptions-item>
              <a-descriptions-item v-if="modal.portId !== 'B'" label="演讲员">
                {{ modal.speakerId_dictText }}
              </a-descriptions-item>
              <a-descriptions-item label="开始日期">
                {{ modal.startDate }}
              </a-descriptions-item>
              <a-descriptions-item label="活动时长">
                {{ modal.activityTime }}
              </a-descriptions-item>
              <a-descriptions-item label="状态">
                {{ modal.status_dictText }}
              </a-descriptions-item>
              <a-descriptions-item label="活动地址">
                {{ modal.activitySite }}
              </a-descriptions-item>
              <!--              <a-descriptions-item label="客户手机号">-->
              <!--                {{ modal.principal.length > 11 ? '-' : modal.principal }}-->
              <!--              </a-descriptions-item>-->
              <a-descriptions-item label="活动内容">
                {{ modal.remark }}
              </a-descriptions-item>
            </a-descriptions>
          </a-tab-pane>
          <a-tab-pane v-if="visible1" key="2" tab="反馈列表">
            <a-descriptions size="small" bordered :column="2">
              <a-descriptions-item label="负责人" span="24">
                {{ modal.speakerId_dictText }}
              </a-descriptions-item>
              <a-descriptions-item :label="modal.type === '20' ? '宣讲时长' : '直播时长'">
                {{ showDate(modal.startDate, modal.actualEndTime) }} 小时
              </a-descriptions-item>
              <a-descriptions-item label="评论人数">
                {{ data.length }}
              </a-descriptions-item>
            </a-descriptions>
            <!--       线下活动显示图片     -->
            <span v-if="modal.type === '20'">
              <a-divider orientation="left">图片</a-divider>
              <img v-if="modal.imgUrl" :src="modal.imgUrl" width="100" />
              <span v-else>暂无图片</span>
            </span>
          </a-tab-pane>
          <a-tab-pane v-if="visible1" key="3" tab="评论">
            <a-table :dataSource="data" :columns="columns"></a-table>
          </a-tab-pane>
        </a-tabs>
      </div>
    </template>
  </j-modal>
</template>

<script>
import { getAction } from '@api/manage'
import moment from 'moment'

export default {
  name: 'BkbActivityView',
  // 这里要注册
  components: {},
  // props有两种接受的方式,一种就是你那个对象,一个是数组,对象可以定义类型和默认值
  data() {
    return {
      modal: {},
      data: [],
      visible: false,
      visible1: false,
      confirmLoading: false,
      columns: [
        {
          title: '反馈人',
          align: 'left',
          dataIndex: 'userName'
        },
        {
          title: '活动效果如何（1.5分）',
          align: 'left',
          dataIndex: 'grade1'
        },
        {
          title: '本次活动是否有用（1.5分）',
          align: 'left',
          dataIndex: 'grade2'
        },
        {
          title: '讲师是否表达清晰（1.5分）',
          align: 'left',
          dataIndex: 'grade3'
        },
        {
          title: '具他建议',
          align: 'left',
          dataIndex: 'comment'
        }
      ],
      url: {
        feedback: '/mission/bkbActivity/feedback'
      }
    }
  },
  computed: {},
  methods: {
    showDate(star, end) {
      if (end) {
        let date = moment(end, 'YYYY-MM-DD HH:mm:ss').diff(moment(star, 'YYYY-MM-DD HH:mm:ss'), 'hour', true)
        if (date >= 0.5) {
          return date.toFixed(2)
        } else if (date < 0.5) {
          return '不足0.5'
        }
      } else {
        return '-'
      }
    },
    //当前行数据, is是否显示反馈卡
    view(value, v) {
      this.visible = true
      this.visible1 = v
      this.modal = value
      getAction(this.url.feedback, this.modal).then(res => {
        if (res.success) {
          this.data = res.result
        }
      })
    },
    handleCancel() {
      this.close()
    },
    close() {
      this.$emit('close')
      this.visible = false
    }
  }
}
</script>

<style scoped></style>

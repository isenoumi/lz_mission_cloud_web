<template>
  <j-modal
    :title='title'
    :width='width'
    :visible='visible'
    switchFullscreen
    @ok='handleOk'
    :okButtonProps="{ class:{'jee-hidden': disableSubmit} }"
    @cancel='handleCancel'
    cancelText='关闭'>

    <bkb-punch-card-record-list ref='realForm' />
  </j-modal>
</template>

<script>

import BkbPunchCardRecordList from '../BkbPunchCardRecordList'

export default {
  name: 'BkbPunchCardRecordGroupingModal',
  components: {
    BkbPunchCardRecordList
  },
  data() {
    return {
      title: '',
      width: 800,
      visible: false,
      disableSubmit: false
    }
  },
  methods: {
    add() {
      this.$nextTick(() => {
        this.$refs.realForm.load_data()
        this.visible = true
      })
    },
    edit(record) {
      this.visible = true
      this.$nextTick(() => {
        this.$refs.realForm.load_data(record)
      })
    },
    close() {
      this.$emit('close')
      this.visible = false
    },
    handleOk() {
      // this.$refs.realForm.submitForm()
    },
    submitCallback() {
      this.$emit('ok')
      this.visible = false
    },
    handleCancel() {
      this.close()
    }
  }
}
</script>
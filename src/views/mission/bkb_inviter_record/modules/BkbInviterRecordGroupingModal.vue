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
    <!--    <bkb-inviter-record-form ref="realForm" @ok="submitCallback" :disabled="disableSubmit"></bkb-inviter-record-form>-->
    <bkb-inviter-record-list ref='realForm' />
  </j-modal>
</template>

<script>

import BkbInviterRecordList from '../BkbInviterRecordList'

export default {
  name: 'BkbInviterRecordGroupingModal',
  components: {
    BkbInviterRecordList
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
        this.$refs.realForm.load_data(record)
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
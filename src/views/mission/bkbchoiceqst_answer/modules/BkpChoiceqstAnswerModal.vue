<template>
  <j-modal
    :title='title'
    :width='1300'
    :visible='visible'
    :maskClosable='false'
    switchFullscreen
    @ok='handleOk'
    :okButtonProps="{ class:{'jee-hidden': disableSubmit} }"
    @cancel='handleCancel'>
    <bkp-choiceqst-answer-form ref='realForm' @ok='submitCallback' :disabled='disableSubmit' />
  </j-modal>
</template>

<script>

import BkpChoiceqstForm from './BkpChoiceqstAnswerForm'
import { getAction } from '@api/manage'
import BkpChoiceqstAnswerForm from './BkpChoiceqstAnswerForm'

export default {
  name: 'BkpChoiceqstAnswerModal',
  components: {
    BkpChoiceqstAnswerForm
  },
  data() {
    return {
      title: '',
      width: 800,
      visible: false,
      disableSubmit: false
    }
  },
  created() {
  },
  methods: {
    add() {
      this.visible = true
      this.$nextTick(() => {
        this.$refs.realForm.add()
      })
    },
    edit(record) {
      this.visible = true
      this.$nextTick(() => {
        getAction('/mission/bkbChoiceqst_answer/queryById', { id: record.id }).then(res => {
          this.$refs.realForm.edit(res.result)
        })
      })
    },
    close() {
      this.$emit('close')
      this.visible = false
    },
    handleOk() {
      this.$refs.realForm.handleOk()
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

<style scoped>
</style>
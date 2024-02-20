<template>
  <j-modal
    :title='title'
    :width='width'
    :visible='visible'
    switchFullscreen
    :okButtonProps="{ class:{'jee-hidden': disableSubmit} }"
    @cancel='handleCancel'
    @ok='handleCancel'
    cancelText='关闭'>
    <a-table
      ref='table'
      size='middle'
      :scroll='{x:true}'
      bordered
      rowKey='id'
      :columns='columns'
      :dataSource='dataSource'
      :loading='loading'
      class='j-table-force-nowrap'
      @change='initDictConfig'>
    </a-table>
  </j-modal>
</template>

<script>

import { httpAction, getAction } from '@/api/manage'
import { validateDuplicateValue } from '@/utils/util'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import BkbOperatingRecordModal from '@views/mission/BkbOperatingRecord/modules/BkbOperatingRecordModal'

export default {
  name: 'BkbOperatingRecordForm',
  // mixins: [JeecgListMixin, mixinDevice],
  components: {
    BkbOperatingRecordModal
  },
  props: {
    // disabled: {
    //   type: Boolean,
    //   default: false,
    //   required: false
    // },
    // title: {
    //   type: String,
    //   default: '',
    //   required: false
    // },
    // dataSource: {
    //   type: Array,
    //   default: [],
    //   required: false
    // },
    data: {
      type: Object,
      required: false
    }
  },
  data() {
    return {
      loading: true,
      width: 800,
      visible: false,
      disableSubmit: false,
      model: {},
      dataSource: [],
      title: '',
      // title: '',
      disabled: false,
      columns: [
        // {
        //   title: '#',
        //   dataIndex: '',
        //   key:'rowIndex',
        //   width:60,
        //   align:"center",
        //   customRender:function (t,r,index) {
        //     return parseInt(index)+1;
        //   }
        // },
        // {
        //   title:'关联知识库id',
        //   align:"center",
        //   dataIndex: 'knowledgeId_dictText'
        // },
        // {
        //   title:'知识库类型',
        //   align:"center",
        //   dataIndex: 'type_dictText'
        // },
        {
          title:'积分来源类型',
          align:"center",
          dataIndex: 'pointsSourceType_dictText'
        },
        {
          title:'积分获取类型',
          align:"center",
          dataIndex: 'pointsGetType_dictText'
        },
        {
          title:'创建日期',
          align:"center",
          dataIndex: 'createTime'
        },
        {
          title:'积分',
          align:"center",
          dataIndex: 'points'
        },
        // {
        //   title: '操作',
        //   dataIndex: 'action',
        //   align:"center",
        //   fixed:"right",
        //   width:147,
        //   scopedSlots: { customRender: 'action' }
        // }
      ],
      confirmLoading: false,
      dictOptions: {},
      superFieldList: [],
      url: {
        add: '/mission/bkbOperatingRecord/add',
        edit: '/mission/bkbOperatingRecord/edit',
        queryById: '/mission/bkbOperatingRecord/queryById',
        list: '/mission/bkbOperatingRecord/list',
        delete: '/mission/bkbOperatingRecord/delete',
        deleteBatch: '/mission/bkbOperatingRecord/deleteBatch',
        exportXlsUrl: '/mission/bkbOperatingRecord/exportXls',
        importExcelUrl: 'mission/bkbOperatingRecord/importExcel'
      }
    }
  },
  computed: {
    formDisabled() {
      return this.disabled
    }
  },
  created() {
    //备份model原始值
    console.log(this.modelDefault, this.model)
    this.modelDefault = JSON.parse(JSON.stringify(this.model))
    this.model = JSON.parse(JSON.stringify(this.data))
    // this.initDictConfig()
  },
  methods: {
    initDictConfig() {
    },
    changView(v) {
      getAction(this.url.list, { 'userId': v.id }).then(res => {
        if (res.success) {
          this.dataSource = res.result.records
          this.loading = false
        } else {
          this.$message.error('加载失败')
        }
      })
    },
    handleCancel() {
      // this.close()
      this.visible = false
    }
    // add () {
    //   this.edit(this.modelDefault);
    // },
    // edit (record) {
    //   this.model = Object.assign({}, record);
    //   this.visible = true;
    // },
    // submitForm () {
    //   const that = this;
    //   // 触发表单验证
    //   this.$refs.form.validate(valid => {
    //     if (valid) {
    //       that.confirmLoading = true;
    //       let httpurl = '';
    //       let method = '';
    //       if(!this.model.id){
    //         httpurl+=this.url.add;
    //         method = 'post';
    //       }else{
    //         httpurl+=this.url.edit;
    //          method = 'put';
    //       }
    //       httpAction(httpurl,this.model,method).then((res)=>{
    //         if(res.success){
    //           that.$message.success(res.message);
    //           that.$emit('ok');
    //         }else{
    //           that.$message.warning(res.message);
    //         }
    //       }).finally(() => {
    //         that.confirmLoading = false;
    //       })
    //     }
    //
    //   })
    // },
  }
}
</script>
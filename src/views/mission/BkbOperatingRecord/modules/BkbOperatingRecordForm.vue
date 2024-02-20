<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row>
          <a-col :span="24">
            <a-form-model-item label="关联知识库id" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="knowledgeId">
              <a-input v-model="model.knowledgeId" placeholder="请输入关联知识库id"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="知识库类型" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="type">
              <a-input v-model="model.type" placeholder="请输入知识库类型"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="获得积分" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="integral">
              <a-input-number v-model="model.integral" placeholder="请输入获得积分" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="积分获取时间" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="harvestDate">
              <j-date placeholder="请选择积分获取时间"  v-model="model.harvestDate" :show-time="true" date-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model>
    </j-form-container>
  </a-spin>
</template>

<script>

  import { httpAction, getAction } from '@/api/manage'
  import { validateDuplicateValue } from '@/utils/util'

  export default {
    name: 'BkbOperatingRecordForm',
    components: {
    },
    props: {
      //表单禁用
      disabled: {
        type: Boolean,
        default: false,
        required: false
      }
    },
    data () {
      return {
        model:{
         },
        labelCol: {
          xs: { span: 24 },
          sm: { span: 5 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 },
        },
        confirmLoading: false,
        validatorRules: {
           knowledgeId: [
              { required: true, message: '请输入关联知识库id!'},
           ],
           type: [
              { required: true, message: '请输入知识库类型!'},
           ],
           integral: [
              { required: true, message: '请输入获得积分!'},
           ],
           harvestDate: [
              { required: true, message: '请输入积分获取时间!'},
           ],
        },
        url: {
          add: "/mission/bkbOperatingRecord/add",
          edit: "/mission/bkbOperatingRecord/edit",
          queryById: "/mission/bkbOperatingRecord/queryById"
        }
      }
    },
    computed: {
      formDisabled(){
        return this.disabled
      },
    },
    created () {
       //备份model原始值
      this.modelDefault = JSON.parse(JSON.stringify(this.model));
    },
    methods: {
      add () {
        this.edit(this.modelDefault);
      },
      edit (record) {
        this.model = Object.assign({}, record);
        this.visible = true;
      },
      submitForm () {
        const that = this;
        // 触发表单验证
        this.$refs.form.validate(valid => {
          if (valid) {
            that.confirmLoading = true;
            let httpurl = '';
            let method = '';
            if(!this.model.id){
              httpurl+=this.url.add;
              method = 'post';
            }else{
              httpurl+=this.url.edit;
               method = 'put';
            }
            httpAction(httpurl,this.model,method).then((res)=>{
              if(res.success){
                that.$message.success(res.message);
                that.$emit('ok');
              }else{
                that.$message.warning(res.message);
              }
            }).finally(() => {
              that.confirmLoading = false;
            })
          }
         
        })
      },
    }
  }
</script>
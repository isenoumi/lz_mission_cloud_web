<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row>
          <a-col :span="24">
            <a-form-model-item label="邀请人手机号" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="theInvitePhone">
              <a-input v-model="model.theInvitePhone" placeholder="请输入邀请人手机号"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="被邀请人手机号" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="invitePhone">
              <a-input v-model="model.invitePhone" placeholder="请输入被邀请人手机号"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="活动积分" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="activityIntegral">
              <a-input-number v-model="model.activityIntegral" placeholder="请输入活动积分" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="所获得积分" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="getIntegral">
              <a-input-number v-model="model.getIntegral" placeholder="请输入所获得积分" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="邀请日期" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="dateInvitation">
              <j-date placeholder="请选择邀请日期"  v-model="model.dateInvitation" :show-time="true" date-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
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
    name: 'BkbInviterRecordForm',
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
           theInvitePhone: [
              { required: true, message: '请输入邀请人手机号!'},
           ],
           invitePhone: [
              { required: true, message: '请输入被邀请人手机号!'},
           ],
           dateInvitation: [
              { required: true, message: '请输入邀请日期!'},
           ],
        },
        url: {
          add: "/mission/bkbInviterRecord/add",
          edit: "/mission/bkbInviterRecord/edit",
          queryById: "/mission/bkbInviterRecord/queryById"
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
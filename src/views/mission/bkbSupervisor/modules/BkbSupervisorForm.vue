<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row>
          <a-col :span="24">
            <a-form-model-item label="督导员名称" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="name">
              <a-input v-model="model.name" placeholder="请输入督导员名称"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="督导员电话" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="phone">
              <a-input v-model="model.phone" placeholder="请输入督导员电话"  ></a-input>
            </a-form-model-item>
          </a-col>
<!--          <a-col :span="24" v-if='user.username === "admin"'>-->
<!--            <a-form-model-item label="关联地区" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="region">-->
<!--             <j-area-linkage type="cascader" v-model="model.region" placeholder="请输入省市区"  />-->
<!--            </a-form-model-item>-->
<!--          </a-col>-->
<!--          <a-col :span="24" v-if='user.username === "admin"'>-->
<!--            <a-form-model-item label="关联客户" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="customerId">-->
<!--              <j-dict-select-tag type="list" v-model="model.customerId" dictCode="sys_user,customer_name,customer_id,customer_admin=1 distinct" placeholder="请选择关联客户" />-->
<!--            </a-form-model-item>-->
<!--          </a-col>-->
          <a-col :span="24">
            <a-form-model-item label="状态" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="status">
              <j-dict-select-tag type="radio" v-model="model.status" dictCode="tenant_status" placeholder="请选择状态" />
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
  import Vue from 'vue'
  import { USER_INFO } from '@/store/mutation-types'

  export default {
    name: 'BkbSupervisorForm',
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
        user: Vue.ls.get(USER_INFO),
        model:{
            status:1,
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
           name: [
              { required: true, message: '请输入督导员名称!'},
           ],
           phone: [
              { required: true, message: '请输入督导员电话!'},
              { pattern: /^1[3456789]\d{9}$/, message: '请输入正确的手机号码!'},
           ],
           region: [
              { required: true, message: '请输入关联地区!'},
           ],
           customerId: [
              { required: true, message: '请输入关联客户!'},
           ],
           status: [
              { required: true, message: '请输入状态!'},
           ],
        },
        url: {
          add: "/mission/bkbSupervisor/add",
          edit: "/mission/bkbSupervisor/edit",
          queryById: "/mission/bkbSupervisor/queryById"
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
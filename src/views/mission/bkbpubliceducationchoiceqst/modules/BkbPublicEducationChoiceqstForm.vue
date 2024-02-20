<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row>
          <a-col :span="24">
            <a-form-model-item label="题库类型" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="choiceqstType">
              <j-dict-select-tag type="list" v-model="model.choiceqstType" dict-code='choice_question_type' placeholder="请选择题库类型" @change='choiceqstTypeChange(model.choiceqstType)' />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="关联题库" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="choiceqstId">
              <j-search-select-tag :key='key' v-model="model.choiceqstId" :dict-options='searchOptions'  @change='choiceqstChange(model.choiceqstId)' />
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model>
      <BkpChoiceqstView :key='choiceqstData.id' v-if='choiceqstData' :choiceqst-data='choiceqstData'></BkpChoiceqstView>
    </j-form-container>
  </a-spin>
</template>

<script>

  import { httpAction, getAction } from '@/api/manage'
  import BkpChoiceqstView from '../../bkbchoiceqst/modules/BkbChoiceqstView'

  export default {
    name: 'BkbPublicEducationChoiceqstForm',
    components: {
      BkpChoiceqstView,
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
        searchOptions: [],
        choiceqstData: "",
        key: 0,
        model:{
         },
        labelCol: {
          xs: { span: 24 },
          sm: { span: 2 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 21 },
        },
        confirmLoading: false,
        validatorRules: {
           choiceqstId: [
              { required: true, message: '请输入关联题库!'},
           ],
        },
        url: {
          add: "/mission/bkbPublicEducationChoiceqst/add",
          edit: "/mission/bkbPublicEducationChoiceqst/edit",
          queryById: "/mission/bkbPublicEducationChoiceqst/queryById"
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
      this.choiceqstTypeChange();
    },
    methods: {
      choiceqstChange (val) {
        if (val !== undefined) {
          this.choiceqstData = { id: val, styleRolling: true };
        } else {
          this.choiceqstData = "";
        }
      },
      choiceqstTypeChange (val) {
        getAction("/mission/bkbChoiceqst/selectdata", { choiceqstType: val }).then(res => {
          this.searchOptions = res;
          this.model.choiceqstId = undefined;
          this.choiceqstData = "";
          this.key += 1;
        })
      },
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
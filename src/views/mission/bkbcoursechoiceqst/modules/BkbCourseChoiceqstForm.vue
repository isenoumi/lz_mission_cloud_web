<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row>
          <a-col :span="24">
            <a-form-model-item label="关联课程" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="courseId">
              <j-search-select-tag :key="key1" v-model="model.courseId" :dictOptions="courseOptions"
                                   @change="areaCodeConfig(model.courseId)"/>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="题型" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="choiceqstType">
              <j-dict-select-tag type="list" v-model="model.choiceqstType" dictCode="choice_question_type" placeholder="请选择题型" @change='choiceqstTypeChange(model.choiceqstType)' />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="关联题库" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="choiceqstId" >
              <j-search-select-tag :key='key' v-model="model.choiceqstId" :dict-options='searchOptions'  @change='choiceqstChange(model.choiceqstId)' />
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model>
      <BkpChoiceqstView :key='choKey' v-if='show' :choiceqstData='choiceqstData'></BkpChoiceqstView>
    </j-form-container>
  </a-spin>
</template>

<script>

  import { httpAction, getAction } from '@/api/manage'
  import BkpChoiceqstView from '../../bkbchoiceqst/modules/BkbChoiceqstView'
  import Vue from 'vue'
  import { USER_INFO } from '@/store/mutation-types'

  export default {
    name: 'BkbCourseChoiceqstForm',
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
        user: Vue.ls.get(USER_INFO),
        searchOptions: [],
        courseOptions: [],
        choiceqstData: "",
        show: false,
        key: 0,
        key1: 0,
        choKey: 0,
        dictData: '',
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
           courseId: [
              { required: true, message: '请输入关联课程!'},
           ],
           choiceqstId: [
              { required: true, message: '请输入关联题库!'},
           ],
        },
        url: {
          add: "/mission/bkbCourseChoiceqst/add",
          edit: "/mission/bkbCourseChoiceqst/edit",
          queryById: "/mission/bkbCourseChoiceqst/queryById"
        }
      }
    },
    computed: {
      formDisabled(){
        return this.disabled
      },
    },
    created () {
      this.choiceqstTypeChange();
       //备份model原始值
      this.modelDefault = JSON.parse(JSON.stringify(this.model));
      this.areaCodeConfig()
      // this.dictData = "bkb_course where status != 0 and region = " + this.user.customerRegion + ",name,id";
    },
    methods: {
      areaCodeConfig(v=undefined) {
        getAction('/mission/bkbCourse/areaCode').then(res => {
          if (res.success) {
            this.courseOptions = res.result
            this.model.courseId = v
            this.key1 += 1
          }
        })
      },
      choiceqstChange (val) {
        if (val !== undefined) {
          getAction("/mission/bkbChoiceqst/queryById", { id: val }).then(res => {
            if (res.success) {
              this.choiceqstData = { ...res.result, styleRolling: true };
              this.choKey += 1;
              this.show = true;
            }
          });
        } else {
          this.choiceqstData = "";
          this.show = false;
        }
      },
      choiceqstTypeChange (val) {
        getAction("/mission/bkbChoiceqst/selectdata", { choiceqstType: val }).then(res => {
          this.searchOptions = res;
          this.model.choiceqstId = undefined;
          this.choiceqstData = "";
          this.show = false;
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
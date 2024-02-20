<template>
  <div class="tinymce-editor">
    <Editor :id="tinymceId" :init="init" :disabled="disabled"></Editor>
  </div>
</template>
<script>
import tinymce from 'tinymce/tinymce' //tinymce默认hidden，不引入不显示
import Editor from '@tinymce/tinymce-vue' //编辑器引入
import 'tinymce/themes/silver/theme' //编辑器主题
import 'tinymce/plugins/link' //超链接
import 'tinymce/plugins/paste' //粘贴过滤
import 'tinymce/plugins/preview' //预览
import 'tinymce/icons/default/icons.min.js'

export default {
  components: {
    Editor,
  },
  props: {
    //内容
    value: {
      type: String,
      default: '',
    },
    //是否禁用
    disabled: {
      type: Boolean,
      default: false,
    },
    triggerChange: {
      type: Boolean,
      default: false,
      required: false,
    },
    //插件
    plugins: {
      type: [String, Array],
      default: () => ['link', 'preview', 'paste'],
    },
  },
  data() {
    return {
      //初始化配置
      tinymceId: 'tinymce',
      myValue: this.value,
      mytinymce: tinymce,
      init: {
        selector: '#tinymce',
        language_url: '../../../public/tinymce/langs/zh_CN.js', //汉化路径是自定义的，一般放在public或static里面
        language: 'zh_CN',
        skin_url: '../../../public/tinymce/tinymce/skins/ui/oxide',
        // content_css: `../../../public/tinymce/tinymce/skins/content/default/content.css`,
        plugins: this.plugins, //插件
        //工具栏
        menubar: false, //隐藏菜单栏
        toolbar: 'undo redo|bold italic forecolor|link preview', //字体大小
        height: 500, //高度
        placeholder: '在这里输入文字',
        branding: false, //隐藏右下角技术支持
        paste_preprocess: function (plugin, args) {
          console.log(args.content)
        },
        paste_as_text: true,
        //init_instance_callback为回调配置项
        init_instance_callback: (editor) => {
          // console.log(`回调----`)
          editor.on('input', (e) => {
            // console.log('文本框input触发')
            this.$emit('input', e.target.innerHTML)
          })
          editor.on('change', (e) => {
            // console.log('文本框change触发')
            this.$emit('change', e.level.content)
          })
        },
      },
    }
  },
  mounted() {
    tinymce.init({})
  },
  methods: {},
}
</script>
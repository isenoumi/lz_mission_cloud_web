<template>
  <div>
    <el-upload
      :action="$httpShop.adornUrl('/mission/file/fileUpload')"
      :data="{ fileDir: 'shop/img' }"
      :headers="{ 'X-Access-Token': Authorization }"
      list-type="picture-card"
      :on-preview="handlePictureCardPreview"
      :on-remove="handleRemove"
      :on-success="handleUploadSuccess"
      :file-list="imageList"
      :before-upload="beforeAvatarUpload"
    >
      <i class="el-icon-plus"></i>
    </el-upload>
    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="dialogImageUrl" alt="" />
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      Authorization: '',
      dialogImageUrl: '',
      dialogVisible: false,
      resourcesUrl: process.env.VUE_APP_RESOURCES_URL,
    }
  },
  props: {
    value: {
      default: '',
      type: String,
    },
  },
  computed: {
    imageList() {
      let res = []
      if (this.value) {
        let imageArray = this.value.split(',')
        for (let i = 0; i < imageArray.length; i++) {
          // res.push({ url: this.resourcesUrl + imageArray[i], response: imageArray[i] })
          res.push({ url: imageArray[i], response: imageArray[i] })
        }
      }
      this.$emit('input', this.value)
      return res
    },
  },
  mounted() {
    this.Authorization = JSON.parse(localStorage.getItem('pro__Access-Token')).value
  },
  methods: {
    // 图片上传
    handleUploadSuccess(response, file, fileList) {
      console.log('fileList2', fileList)
      let pics = fileList
        .map((file) => {
          console.log('file', file)
          if (typeof file.response === 'string') {
            return file.response
          }
          return file.response.result
        })
        .join(',')
      console.log('pics', pics)
      this.$emit('input', pics)
    },
    // 限制图片上传大小
    beforeAvatarUpload(file) {
      const isJPG =
        file.type === 'image/jpeg' ||
        file.type === 'image/png' ||
        file.type === 'image/gif' ||
        file.type === 'image/jpg'
      if (!isJPG) {
        this.$messageE.error('上传图片只能是jpeg/jpg/png/gif 格式!')
      }
      const isLt2M = file.size / 1024 / 1024 < 5
      if (!isLt2M) {
        this.$messageE.error('上传图片大小不能超过 5MB!')
      }
      return isLt2M && isJPG
    },
    handleRemove(file, fileList) {
      console.log('fileList', fileList)
      let pics = fileList
        .map((file) => {
          if (typeof file.response === 'string') {
            return file.response
          }
          return file.response.result
        })
        .join(',')
      this.$emit('input', pics)
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.response
      console.log(this.dialogImageUrl, file)
      this.dialogVisible = true
    },
  },
}
</script>


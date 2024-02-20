import Vue from 'vue'
import axios from 'axios'
import router from '@/router'
import qs from 'qs'
import merge from 'lodash/merge'
import {
  clearLoginInfo
} from '@/utils/index2.js'
import {
  Message
} from 'element-ui'

const http = axios.create({
  timeout: 1000 * 30,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json; charset=utf-8'
  }
})

/**
 * 请求拦截
 */
http.interceptors.request.use(config => {
  console.log(JSON.parse(localStorage.getItem('pro__Access-Token')).value);
  config.headers['X-Access-Token'] = JSON.parse(localStorage.getItem('pro__Access-Token')).value // 请求头带上token
  // config.headers['Authorization'] = '376ec518-f2c5-41f2-94a2-1139ac0ceaeb' // 请求头带上token
  return config
}, error => {
  return Promise.reject(error)
})

/**
 * 响应拦截
 */
http.interceptors.response.use(response => {
  // blob 格式处理
  if (response.request.responseType === 'blob') {
    return response
  }

  const res = response.data
  console.log('http', res);
  // 00000 请求成功
  if (res.code === '00000' || res.code == '200') {
    return res
  }
  if (res.code == 500) {
    Message({
      message: res.message || 'Error',
      type: 'error',
      duration: 1.5 * 1000
    })
    return Promise.reject(res)
  }
  // A00001 用于直接显示提示用户的错误,内容由输入决定
  if (res.code === 'A00001') {
    Message({
      message: res.msg || 'Error',
      type: 'error',
      duration: 1.5 * 1000
    })
    return Promise.reject(res)
  }
  // A00002 用于直接显示提示系统的成功,内容由输入决定
  if (res.code === 'A00002') {
    Message({
      message: res.msg,
      type: 'success',
      duration: 1.5 * 1000
    })
  }

  // A00004 未授权
  if (res.code === 'A00004') {
    // clearLoginInfo()
    // router.push({
    //   name: 'user/login'
    // })
    router.push('/user/login')
  }

  // A00005 服务器异常
  if (res.code === 'A00005') {
    console.error('============== 请求异常 ==============')
    console.log('接口地址: ', response.config.url.replace(process.env.VUE_APP_API_BASE_URL, ''))
    console.log('异常信息: ', res)
    console.error('============== 请求异常 end ==========')
    Message({
      message: '服务器出了点小差，请稍后再试',
      type: 'error',
      duration: 1.5 * 1000,
      customClass: 'element-error-message-zindex'
    })
    return Promise.reject(res)
  }
  if (res.code === 'A00014') {
    Message({
      message: res.msg,
      type: 'error',
      duration: 1.5 * 1000
    })
    return Promise.reject(res)
  }
}, error => {
  console.log(error);
  switch (error.response.status) {
    case 400:
      Message({
        message: error.response.data,
        type: 'error',
        duration: 1500,
        customClass: 'element-error-message-zindex'
      })
      break
    case 401:
      // clearLoginInfo()
      Message({
        message: 'token失效，请重新登录',
        type: 'error',
        duration: 1500,
        customClass: 'element-error-message-zindex'
      })
      // router.push({
      //   name: 'user/login'
      // })
      router.push('/user/login')
      break
    case 405:
      Message({
        message: 'http请求方式有误',
        type: 'error',
        duration: 1500,
        customClass: 'element-error-message-zindex'
      })
      break
    case 500:
      Message({
        message: '服务器出了点小差，请稍后再试',
        type: 'error',
        duration: 1500,
        customClass: 'element-error-message-zindex'
      })
      break
    case 501:
      Message({
        message: '服务器不支持当前请求所需要的某个功能',
        type: 'error',
        duration: 1500,
        customClass: 'element-error-message-zindex'
      })
      break
  }
  return Promise.reject(error)
})

/**
 * 请求地址处理
 * @param {*} actionName action方法名称
 */
http.adornUrl = (actionName) => {
  // 非生产环境 && 开启代理, 接口前缀统一使用[/proxyApi/]前缀做代理拦截!
  return (process.env.NODE_ENV !== 'production' && process.env.OPEN_PROXY ? '/proxyApi' : process.env.VUE_APP_API_BASE_URL) + actionName
}

/**
 * get请求参数处理
 * @param {*} params 参数对象
 * @param {*} openDefultParams 是否开启默认参数?
 */
http.adornParams = (params = {}, openDefultParams = true) => {
  var defaults = {
    't': new Date().getTime()
  }
  return openDefultParams ? merge(defaults, params) : params
}

/**
 * post请求数据处理
 * @param {*} data 数据对象
 * @param {*} openDefultdata 是否开启默认数据?
 * @param {*} contentType 数据格式
 *  json: 'application/json; charset=utf-8'
 *  form: 'application/x-www-form-urlencoded; charset=utf-8'
 */
http.adornData = (data = {}, openDefultdata = true, contentType = 'json') => {
  var defaults = {
    't': new Date().getTime()
  }
  data = openDefultdata ? merge(defaults, data) : data
  return contentType === 'json' ? JSON.stringify(data) : qs.stringify(data)
}

export default http
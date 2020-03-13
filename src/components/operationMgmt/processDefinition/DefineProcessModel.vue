<template lang="pug">
    UcmpContainer(:breadcrumbItems="breadcrumbItems")
        div.full-container(slot="content")
            div(v-if="!showActiviti")
                div.full-container
                    div.first-step
                        el-form.first-step-form(ref="form" :model="newModel" label-width="180px" :rules="rules" size="small")
                            el-form-item(label="名称" prop="name")
                                el-input.input-width(v-model="newModel.name" placeholder="请输入模型名称")
                            el-form-item(label="Key" prop="key")
                                el-input.input-width(v-model="newModel.key" placeholder="请输入key")
                            el-form-item(label="描述" prop="description")
                                el-input.textarea-width(type="textarea" v-model="newModel.description" placeholder="请输入内容")
                            el-form-item
                                el-button(@click="nextStep" type="primary") 下一步
            IframeContainer(:url="activitiUrl" v-else)
</template>
<script>
import Api from '@api'
import { IframeContainer } from '@leaptocloud/standard-ui'

// Validate message
const validateMsg = {
    pattern: /^[\u4e00-\u9fa5\w\-]*$/,
    message: '支持数字，英文字母，连字符，下划线和汉字',
    trigger: ['blur', 'change']
}

// 设置表单规则
const rules = {
    name: [
        {required: true, message: '请输入模型名称', trigger: 'blur'},
        {max: 100, message: '字符长度不能超过100', trigger: ['blur', 'change']},
        validateMsg
    ],
    key: [
        {required: true, message: '请输入key信息', trigger: 'blur'},
        {max: 100, message: '字符长度不能超过100', trigger: ['blur', 'change']},
        validateMsg
    ],
    description: [
        {max: 250, message: '描述信息不能超过250个字符', trigger: ['blur', 'change']}
    ]
}
export default {
    components: { IframeContainer },
    data () {
        return {
            breadcrumbItems: [
                { prop: '/processDefinition', label: '流程定义' },
                { prop: '/processDefinition/defineModel', label: '创建模型' }
            ],
            showActiviti: false,
            activitiUrl: '',
            newModel: {
                name: '',
                key: '',
                description: ''
            },
            rules: rules
        }
    },
    created () {
        // 渲染页面时判断路由中是否有query参数,有的话为编辑操作,没有的话为新建操作
        if (this.$route.query && this.$route.query.id) {
            this.showActiviti = true
            this.breadcrumbItems[1].label = '编辑模型'

            this.activitiUrl = '/bpm3/modeler.html?modelId=' + this.$route.query.id + '&token=' + localStorage.getItem('authenticationToken')
        }
        let self = this
        window._closeFrame = function () {
            self.$router.push('/processDefinition/ModelList')
        }
    },
    beforeDestroy () {
        window._closeFrame = undefined
    },
    methods: {
      // 第一步表单操作的执行事件
        nextStep () {
            this.$refs['form'].validate((valid) => {
                if (valid) {
                    Api.post('modelApi', this.newModel, true).then(res => {
                        this.showActiviti = true  // 切换页面为第三方--activiti页面
                        this.activitiUrl = '/bpm3/modeler.html?modelId=' + res + '&token=' + localStorage.getItem('authenticationToken')
                    })
                } else
                    return false
            })
        }
    }
}
</script>
<style lang="scss" scoped>
.first-step{
  padding-top: 30px;
}
.textarea-width, .input-width{
  width: 400px;
  border-radius: 0 !important;
}
</style>

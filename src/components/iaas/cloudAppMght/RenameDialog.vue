<template lang="pug">
    el-dialog(v-if="visible" :title="title" :visible.sync="visible" :before-close="close" width="400px")
        div.dialog-content
            DynamicForm(
                :formItems="formItems"
                :formData.sync="formData"
                :labelPosition="'right'"
            )
        div.dialog-footer(slot="footer")
            el-button(@click="close" size="small") 取消
            el-button(type="primary" @click="save" size="small") 确定
</template>>

<script>
/**
 * 应用程序-重命名
 */
import DynamicForm from '@/components/common/dynamicForm/DynamicForm'
export default {
    name: 'RenameDialog',
    inject: ['$validator'],
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        title: {
            type: String,
            default: ''
        }
    },
    data () {
        return {
            formData: {}
        }
    },
    methods: {
        close () {
            this.$emit('closeDialog')
        },
        save () {
            this.$validator.validate().then(result => {
                if (result) 
                    this.$emit('rename', this.formData.new_name)
            })
        }
    },
    components: {
        DynamicForm
    },
    computed: {
        formItems () {
            return [
                {
                    key: 'new_name',
                    type: 'input',
                    label: '指定新名称',
                    validation: {
                        max: '50',
                        min: '1',
                        reg: '/^[\\u4e00-\\u9fa5\\w\\-]{1,50}$/',
                        err_msg: '可以为英文大小写字母、数字、- 以及 _',
                        required: true
                    },
                    description: '指定新名称'
                }
            ]
        }
    }
}
</script>

<style lang="scss" scoped>

</style>
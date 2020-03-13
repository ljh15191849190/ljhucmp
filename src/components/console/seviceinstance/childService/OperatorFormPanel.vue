<template lang="pug">
    el-dialog.instance-dialog(v-if="dialogSwitch" :title="dialogTitle" :visible.sync="dialogSwitch" width="600px" :before-close="quit")
        el-form(
            label-width="120px"
            size="small"
            label-position="left")
            DynamicForm.basic-form(
                :formItems="formItems"
                :formData.sync="transformedFormData"
                :display.sync="transformedDisplay"
                :keepValueFitDom="keepValueFitDom"
                :externalFormData="externalFormData"
            )
            el-form-item
                el-button(type="default" size="small" @click="quit") 取消
                el-button(type="primary" size="small" @click="confirmClick") 确定
</template>
<script>
/**
 * @description 子服务以及关联服务操作按钮触发的动态表单（qingcloud_lb_listener）
 */
import DynamicForm from '@/components/common/dynamicForm/DynamicForm'
import Api from '@api'

export default {
    $_veeValidate: {
        validator: 'new'
    },
    props: {
        formItems: {
            type: Array,
            default: () => {
                return []
            }
        },
        formdata: {
            type: Object,
            default: () => {
                return {}
            }
        },
        formDisplay: {
            type: Object,
            default: () => {
                return {}
            }
        },
        externalFormData: {
            type: Object,
            default: () => {
                return {}
            }
        },
        btn: {
            type: Object,
            default: () => {
                return {}
            }
        },
        dialogSwitch: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            keepValueFitDom: true
        }
    },

    methods: {
        confirmClick () {
            this.$validator.validate().then(result => {
                if (result) {
                    // 与表单项一一比对，删除多余的参数信息
                    let formData = JSON.parse(JSON.stringify(this.formdata))
                    let formItemKeys = this.formItems.map(
                        item => {
                            return item.key
                        }
                    )
                    Object.keys(formData).forEach(
                        key => {
                            if (formItemKeys.indexOf(key) === -1)
                                delete formData[key]
                        }
                    )
                    this.transformedFormData = formData
                    this.$emit('operatorHandler')
                }
            })
        },

        quit () {
            this.$emit('shutDownDialog', false)
        },

        /**
         * @description 初始化表单值
         */
        initFormData () {
            Api[this.btn.init_endpoint.method ? this.btn.init_endpoint.method : 'get'](this.btn.init_endpoint.url, this.externalFormData, true).then(
                res => {
                    this.transformedFormData = { ...JSON.parse(JSON.stringify(this.transformedFormData)), ...res }
                }
            )
        }
    },

    computed: {
        dialogTitle () {
            return this.btn.label || this.btn.key || ''
        },

        /**
         * @description 动态表单的值，方便自子组件正确改变父组件传来的formdata
         */
        transformedFormData: {
            get () {
                return this.formdata
            },

            set (formdata) {
                this.$emit('update:formdata', formdata)
            }
        },

        /**
         * @description 动态表单的值，方便自子组件正确改变父组件传来的display
         */
        transformedDisplay: {
            get () {
                return this.display
            },

            set (display) {
                this.$emit('update:display', display)
            }
        }
    },

    components: {
        DynamicForm
    },

    created () {
        if (this.btn.init_endpoint)
            this.initFormData()
    }
}
</script>
<style lang="scss" scoped>

</style>

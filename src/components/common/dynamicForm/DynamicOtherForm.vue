<template lang="pug">
    //- div
    el-form(:label-width="labelWidth" size="small" :label-position="isApplyHandle ? 'top' : 'left'" :inline="!isApplyHandle")
        template(v-for="(formItem, index) in formParams")
            UcmpDynamicFormItem(
                v-show="!(hideItem && !formItem.creating_show)"
                :key="formItem[uniqueKey]"
                :formItem="changeType(formItem)"
                :formData="formData"
                :display.sync="formItemDisplay"
                :value.sync="formData[formItem[uniqueKey]]"
                :uniqueKey="uniqueKey"
                :defaultValueKey="defaultValueKey"
                :isScriptItem="isScriptItem"
                :formId="formId"
                :isApplyHandle="isApplyHandle"
                :disabled="!editPrivilege"
                :disableValidate="disableValidate"
                @focusWidget="focusWidget"
                @changeRelateParams="changeRelateParams"
                @updateValue="updateValue"
                )
</template>

<script>

import MetadataUtils from '@server/metadata.utils'

export default {
    props: {
        // 基础的参数组 ---单向绑定
        formDatas: {
            type: [Array, Object],
            default () {
                return []
            }
        },
        // 处理后所需要的值 ---双向绑定
        value: {
            type: [String, Number, Array, Object],
            default: () => {}
        },
        uniqueKey: {
            type: String,
            default: function () {
                return 'key'
            }
        },
        hideItem: {
          type: Boolean,
          default: () => false
        },
        isApplyHandle: {
          type: Boolean,
          default: () => false
        },
        // 所属资源ID
        formId: {
            type: String,
            default: ''
        },
        editPrivilege: {
            type: Boolean,
            default: true
        },
        scriptId: {
            type: String,
            default: ''
        },
        updateFormData: {
            type: Function,
            default: null
        },
        disableValidate: Boolean
    },
    data () {
        return {
            defaultValueKey: 'default',
            inline: true,
            labelWidth: '120px',
            isScriptItem: true,
            formData: {},
            display: {}
        }
    },
    created () {
        this.formData = JSON.parse(JSON.stringify(this.value))
        this.display = JSON.parse(JSON.stringify(this.value))
    },
    watch: {
        formData: {
            deep: true,
            handler (newVal) {
                // oracle 脚本编辑过程中动态更新脚本表空间校验规则
                // 表空间名集合
                if (newVal.tablespace) {
                    let tableList = []
                    let tablespace = Array.isArray(newVal.tablespace) ? newVal.tablespace : JSON.parse(newVal.tablespace)
                    tablespace.forEach(item => {
                        if (item.APP_TBS && tableList.indexOf(item.APP_TBS) === -1)
                            tableList.push(item.APP_TBS)
                    })

                    let app_user_conf = this.formDatas.find(item => item[this.uniqueKey] === 'app_user')
                    if (app_user_conf && app_user_conf.children) {
                        this.formDatas.forEach(item => {
                            if (item[this.uniqueKey] === 'app_user') {
                                if (item.children) {
                                    item.children.forEach(child => {
                                        if (child[this.uniqueKey] === 'APP_DEFAULT_TABLESPACE_NAME') {
                                            this.$set(child, 'enum', tableList.map(item => {
                                                return {id: item, name: item}
                                            }))
                                        }
                                    })
                                }
                            }
                        })
                    }
                }
                if (newVal) {
                    if (this.updateFormData)
                        this.updateFormData(this.scriptId, newVal)
                    else
                        this.$emit('update:value', newVal)
                }
            }
        }
    },
    methods: {
        changeType (child) {
            if (child.type === 'int')
                child.type = 'number'
            else if (child.type === 'string')
                child.type = 'input'
            else if (child.children && child.children.length)
                child.type = 'combinedItem'
            // eslint-disable-next-line
            else if (child.type === 'array' && (child.enum || child.data_link && !child.data_link.child))
                child.type = 'select'

            if (!child.validation)
                child.validation = {}
            if (child.required)
                child.validation.required = true
            return child
        },
        focusWidget (formId) {
            this.$emit('focusWidget', formId)
        },

        // 同步修改依赖参数值
        changeRelateParams (relateParams, currentVal) {
            this.$nextTick(() => {
                relateParams.split(',').forEach(item_param => {
                    this.$set(this.formData, item_param, currentVal)
                })
            })
        },

        // (B需要与A相同)输入A时同步修改B的校验规则 => B的‘sameAs’字段改变，触发B校验规则的更新
        // 输入密码时同步修改确认密码的校验 信息
        updateValue (params) {
            let [formItemKey, relyOn, dependency] = params
            if (dependency === 'including') { // 修改的表单元素为serverOrder时。需要更新对应的appserver_name
                relyOn.forEach(rely_item => {
                    this.$emit('updateCombinedItem', rely_item)
                })
            }
            if (dependency === 'same') { // 修改的表单元素为serverOrder时。需要更新对应的appserver_name
                relyOn.forEach(rely_item => {
                    this.formParams.forEach((item, index) => {
                        if (item[this.uniqueKey] === rely_item) {
                            this.$set(item, 'sameAs', this.formData[formItemKey])
                            let formItem = JSON.parse(JSON.stringify(item))
                            this.formParams.splice(index, 1, formItem)
                        }
                    })
                })
            }
            if (!dependency)
                this.$emit('updateCombinedItem', formItemKey)
        }
    },
    computed: {
        formItemDisplay () {
            return this.display
        },
        formParams () {
            let oriFormDatas = JSON.parse(JSON.stringify(this.formDatas))
            MetadataUtils.updateAttributeType(oriFormDatas)
            return oriFormDatas
        }
    }

}
</script>

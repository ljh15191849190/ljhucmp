<template lang="pug">
el-form(:label-width="labelWidth" size="small" :label-position="labelPosition" :inline="inline")
    UcmpDynamicFormItem(
      v-for="(formItem, index) in constructedFormItems"
      :ref="formItem[uniqueKey]"
      v-if="!formItem.linked || formItem.linked && allShowLinkedItemKeys.length && allShowLinkedItemKeys.indexOf(formItem[uniqueKey]) !== -1"
      v-show="!formItem.display_same_row"
      :key="formItem[uniqueKey]"
      :formItem="formItem"
      :class="formItem[uniqueKey]"
      :formData="formData"
      :externalFormData="externalFormData"
      :display.sync="formItemDisplay"
      :value.sync="transformedFormData[formItem[uniqueKey]]"
      :uniqueKey="uniqueKey"
      :isApplyHandle="isApplyHandle"
      :displayLinkedItemKeys="allShowLinkedItemKeys"
      :disableValidate="disableValidate"
      :disabled="disabled"
      @focusWidget="focusWidget"
      @blurWidget="blurWidget"
      :showFormItem="showFormItem"
    )
    //- 此处为更多配置信息
    slot(name="MoreConfForm")
</template>

<script>
/**
 * @description 父组件传递的配置参数
 * @prop {boolean} inline 表单域是否变为行内的表单域,默认值为false
 * @prop {Array} formItems 表单域展示的所有元数据原子项
 * @prop {object} formData 表单域原子项对应展示的值,需双向绑定
 * @prop {Function} submit 确认按钮函数处理
 * @prop {string} confirmLabel 表单确认按钮的文字,默认值为提交
 */
export default {
    inject: ['$validator'],
    props: {
        inline: {
            type: Boolean,
            default: false
        },
        formItems: {
            type: Array,
            default: function () {
              return []
            },
            required: true
        },
        formData: {
            type: Object,
            default: function () {
                return {}
            }
        },
        externalFormData: {
           type: Object,
            default: function () {
                return {}
            }
        },
        display: {
            type: Object,
            default: function () {
                return {}
            }
        },
        uniqueKey: {
            type: String,
            default: function () {
                return 'key'
            }
        },
        // linkedKey: {
        //     type: String,
        //     default: function () {
        //         return 'key'
        //     }
        // },
        labelPosition: {
            type: String,
            default: function () {
                return 'left'
            }
        },
        labelWidth: {
            type: String,
            default: function () {
                return '120px'
            }
        },
        // formItem linked:true 的显示列表
        showLinkedItemKeys: {
            type: Array,
            default: function () {
              return []
            }
        },
        isApplyHandle: { // 是否为申请资源流程
            type: Boolean,
            default: false
        },
        // 保持表单值与Dom显示一致，自动删除隐藏的表单项值
        keepValueFitDom: {
            type: Boolean,
            default: false
        },
        showFormItem: {
            type: Boolean,
            default: true
        },
        // UCMP3-6074 是否禁用表单校验， 默认启用
        disableValidate: {
            type: Boolean,
            default: false
        },
        // UCMP3-6932 表单数据只能来自于模板(开启禁用)   默认状态为：关闭禁用
        disabled: {
            type: Boolean,
            default: false
        }
    },

    data () {
        return {}
    },

    computed: {
        /**
         * @description 转化后的表单值，方便对新加项目进行赋值
         */
        transformedFormData: {
            get () {
                return this.formData
            },
            set (newVal) {
                this.$emit('update:formData', newVal)
            }
        },

        /**
         * @description 表单值对象转化为string，方便watcher检测
         */
        transformedFormDataString () {
            return JSON.stringify(this.transformedFormData)
        },

        formItemDisplay: {
            get () {
                return this.display
            },
            set (newVal) {
                this.$emit('update:display', newVal)
            }
        },

        hasLinkFormItems () {
            return this.formItems.filter(
                item => {
                    if (item.link)
                        return item
                }
            )
        },

        hasLinkFormItemKeys () {
            return this.hasLinkFormItems.map(
                item => {
                    return item[this.uniqueKey]
                }
            )
        },

        hasLinkedFormItemKeys () {
            return this.formItems.filter(
                item => {
                    if (item.linked)
                        return item
                }
            ).map(
                item => {
                    return item[this.uniqueKey]
                }
            )
        },

        formItemLinkedInfo () {
            let rst = {}
            this.hasLinkFormItems.forEach(
                item => {
                    rst[item[this.uniqueKey]] = item.link
                }
            )
            return rst
        },

        /**
         * @description 动态汇总需要显示的attribute(元数据linked:true),实现根据依赖关系动态显示/隐藏表单项的功能
         */
        formShowLinkedItems () {
            let linkedKeys = []
            this.hasLinkFormItemKeys.forEach(
                itemKey => {
                    if (this.formData[itemKey] && this.formItemLinkedInfo[itemKey]['link_' + this.formData[itemKey]])
                        linkedKeys = linkedKeys.concat(this.formItemLinkedInfo[itemKey]['link_' + this.formData[itemKey]])
                }
            )
            return linkedKeys
        },

        /**
         * @description 含有过滤属性(linked:true)的值集合，转为字符串方便观察数据变化
         */
        formDataString () {
            let formData = {}
            this.hasLinkFormItemKeys.forEach(
                itemKey => {
                    formData[itemKey] = this.transformedFormData[itemKey]
                }
            )
            return JSON.stringify(formData)
        },

        /**
         * @description UCMP3-1437 NAS 总大小和单位放置在一行显示
         */
        constructedFormItems () {
            let formItems = JSON.parse(JSON.stringify(this.formItems))
            let groups = {}
            for (let index = 0; index < formItems.length; index++) {
                // 当前formItem如果有display_same_row，则要摘出来合并显示
                if (formItems[index].display_same_row && formItems[index].display_same_row.key) {
                    if (!groups[formItems[index].display_same_row.key]) {
                        groups[formItems[index].display_same_row.key] = formItems[index].display_same_row
                        groups[formItems[index].display_same_row.key].children = []
                        formItems.splice(index, 0, groups[formItems[index].display_same_row.key])
                        index++
                    }
                    groups[formItems[index].display_same_row.key].children.push(formItems[index])
                }
            }

            return formItems
        },

        /**
         * @description 外部给出的需要显示的条目(linked:true)转义为string, 方便在watcher中观察
         */
        showLinkedItemKeysAsString () {
            return JSON.stringify(this.showLinkedItemKeys)
        },

        // UCMP3-2726 汇总所有实际显示的linked：true的属性key列表
        allShowLinkedItemKeys () {
            return this.showLinkedItemKeys.concat(this.formShowLinkedItems)
        }
    },

    methods: {
        focusWidget (formItem) {
            this.$emit('focusWidget', formItem)
        },

        blurWidget (formItem) {
            this.$emit('blurWidget', formItem)
        },

        /**
         * @description 根据显示规则（showLinkedItemKeys、formShowLinkedItems），动态删除不显示的值
         */
        dynamicDeleteFormDataByLinked () {
            // 删除标志，如果没有指定，则不予删除
            if (!this.keepValueFitDom)
                return
            let formData = JSON.parse(JSON.stringify(this.transformedFormData))
            let display = JSON.parse(JSON.stringify(this.display))

            // 含有过滤属性(linked:true)的项目，如果不在显示列表，则删除该项的值
            this.hasLinkedFormItemKeys.forEach(
                itemKey => {
                    if (this.allShowLinkedItemKeys.indexOf(itemKey) === -1) {
                        delete formData[itemKey] 
                        delete display[itemKey]
                    }
                }
            )
            // UCMP3-2215 删除以[formitem.key]:value的初始化值
            if (this.uniqueKey !== 'key') {
                let keys = this.formItems.filter(item => item.linked).map(item => item.key)
                keys.forEach(item => {
                    delete formData[item]
                    delete display[item]
                })
            }
            this.transformedFormData = formData
            this.formItemDisplay = display
        },

        initFormData (formData) {
            this.formItems.forEach(
                item => {
                    // 含有过滤属性(linked)的属性，且不在显示列表中，不做赋值操作 UCMP3-1528 深化过滤逻辑，含有过滤属性(linked)的属性，如果keepValueFitDom 为false， 需要初始化赋值
                    if (formData[item[this.uniqueKey]] === undefined && (!item.linked || (item.linked && (!this.keepValueFitDom || (this.keepValueFitDom && this.allShowLinkedItemKeys.indexOf(item[this.uniqueKey]) !== -1))))) {
                        // UCMP3-441， UCMP3-468
                        // 使用 el-input-number 组件时，如果传入值为undefined会被组件默认为空值，触发校验
                        // 但是如果手动将值表单中的值修改为null或0的话，则会干扰el-input-number组件内部的处理机制，将最小值赋值给该组件
                        // 从而导致清空组件之后不会触发校验，并且不会触发DOM的更新（显示为空，绑定值为min值）
                        let value
                        // UCMP-686 修复默认值不生效的问题
                        if (item.type !== 'number')
                            // eslint-disable-next-line
                            value = item.multiple || (item.children && item.children.length) ? [] : null
                      
                        this.$set(this.formData, item[this.uniqueKey], value)
                    }
                }
            )
        }
    },

    created () {
        // UCMP3-2352 初始化动态表单的值(针对undefined的场景)
        let formData = JSON.parse(JSON.stringify(this.formData))
        this.initFormData(formData)
        this.dynamicDeleteFormDataByLinked()
    },

    watch: {
        /**
         * @description 表单值方便变化后，对新加项目进行赋值
         */
        transformedFormDataString (newVal, oldVal) {
            if (newVal === oldVal || oldVal === '{}') return

            let formData = JSON.parse(newVal)
            this.initFormData(formData)            
        },

        formDataString (newVal, oldVal) {
            if (newVal === oldVal || oldVal === '{}')
                return
            this.dynamicDeleteFormDataByLinked()
        },

        showLinkedItemKeysAsString (newVal, oldVal) {
            if (newVal === oldVal)
                return
            this.dynamicDeleteFormDataByLinked()
        }
    }
}
</script>

<style lang="scss" scoped>

</style>

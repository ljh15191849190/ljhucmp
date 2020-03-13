<template lang="pug">
    div.multiple-form-items-container
        div.full-width.d-flex
            UcmpDynamicFormItem.multiple-form-items(
                v-for="formItem in children"
                v-if="!formItem.linked || formItem.linked && displayLinkedItemKeys.length && displayLinkedItemKeys.indexOf(formItem[uniqueKey]) !== -1"
                :key="formItem[uniqueKey]"
                :formItem="formItem"
                :class="formItem[uniqueKey]"
                :style="{'max-width': calcWidth}"
                :formData="formData"
                :externalFormData="externalFormData"
                :display="display"
                :value.sync="formData[formItem[uniqueKey]]"
                :uniqueKey="uniqueKey"
                :showFormItem="showFormItem")
        div.danger-text-container(v-if="multiErrors.length")
            span.is-danger {{multiErrors.join(' ')}}
</template>
<script>
/**
 * @description 简易多列(合并)显示表单项组件
 */
export default {
    inject: ['$validator'],
    props: ['itemsObject', 'formData', 'display', 'uniqueKey', 'externalFormData', 'displayLinkedItemKeys', 'formId', 'combinedIndex'],
    data () {
        return {
            showFormItem: false
        }
    },

    computed: {
        laebel () {
            return this.itemsObject.label || this.children[0].label
        },

        children () {
            return this.itemsObject.children
        },

        calcWidth () {
            let margins = 16 * (this.children.length - 1)
            return 'calc((100% - ' + margins + 'px) / ' + this.children.length + ')'
        },

        // UCMP3-860 处理编排时 脚本/基础配置 组件表单组件校验失败时蓝图中对应资源无提示问题
        // 根据resourceId（所属资源ID）和 combinedIndex 对表单组件的name属性进行重新计算
        nameAttribute () {
            return this.children.map(item => {
                if (this.formId)
                    return item[this.uniqueKey] + this.combinedIndex
                else return item[this.uniqueKey]
            })
        },

        /**
         * @description UCMP3-3373 获取所有字表单项的错误提示
         */
        multiErrors () {
            return this.nameAttribute.map(item => {
                return this.errors.first(item)
            }).filter(item => item !== undefined)
        }
    }
}
</script>
<style lang="scss" scoped>
.multiple-form-items {
    width: auto !important;
    margin-right: 10px;
    &:first-child {
        margin-left: 0;
    }
    &:last-child {
        margin-right: 0;
    }
}
.danger-text-container {
    line-height: 14px;
}
</style>

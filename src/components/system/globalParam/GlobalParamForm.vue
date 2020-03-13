<template lang="pug">
    div.global-param-item
        DynamicForm(
            :formItems="formItems"
            :formData.sync="transformedFormData"
            :display.sync="formItemDisplay"
            :labelPosition="'right'"
            :showLinkedItemKeys="showLinkedItemKeys"
        )
        div.history-resoucre(v-if="dictCode === 'tenancy' && formData.available")
            label.label 历史资源
            div.value
                div.time {{display.his_res_date}}
                div.tip (此项只针对未设置租期的历史资源起作用，时间以当前日期为起点，期限以“最长租期”为准。)
</template>
<script>
/**
 * @description 全局参数表单
 */
import DynamicForm from '@/components/common/dynamicForm/DynamicForm'
export default {
    name: 'GlobalParamForm',
    props: ['formItems', 'formData', 'display', 'dictCode'],
    components: {DynamicForm},
    data () {
        return {
            linkedKeyAttrs: []
        }
    },
    created () {
        this.init()
    },
    methods: {
        init () {
            this.formItems.forEach(attrItem => {
                //处理lined true
                if (attrItem.link)
                    this.linkedKeyAttrs.push(attrItem)
            })
        }
    },
    computed: {
        transformedFormData: {
            get () {
                return this.formData
            },
            set (newVal) {
                this.$emit('update:formData', newVal)
            }
        }, 
        formItemDisplay: {
            get () {
                return this.display
            },
            set (newVal) {
                this.$emit('update:display', newVal)
            }
        },
        showLinkedItemKeys () {
            let showLinkedKeys = []
            this.linkedKeyAttrs.forEach(linkeAttr => {
                let formItemData = this.formData[linkeAttr.key]
                if (formItemData && linkeAttr['link']['link_' + formItemData])
                    showLinkedKeys = [...showLinkedKeys, ...linkeAttr['link']['link_' + formItemData]]
            })
            return showLinkedKeys
        }
    }
}
</script>
<style lang="scss" scoped>
.global-param-item {
    width: 80%;
    margin-right: 60px;
    border: 1px solid $borderColor;
    padding: {
        top: 15px;
        right: 15px;
    }
    .history-resoucre {
        display: flex;
        margin-bottom: 15px;
        .label {
            width: 120px;
            padding-right: 12px;
            text-align: right;
        }
        .value {
            font-size: 14px;
        }
        .tip {
            padding-top: 3px;
            font-size: 12px;
            color: $fontTitleLight;
        }
    }
}
</style>

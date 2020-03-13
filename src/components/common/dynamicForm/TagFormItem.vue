<template lang="pug">
    div.tag-form-item
        div.tags
            el-tag.tag(v-for="(tagName, index) in display" closable type="info" :disable-transitions="false" @close="handleDelete(index)" :key="tagName") {{tagName}}
        div.line
        div.action
            div.formItem(v-for="(formItem, index) in tagFormItem.actionFormItems")
                UcmpDynamicFormItem.float-left.multiple-form-items(
                    :key="formItem[uniqueKey]"
                    :formItem="formItem"
                    :formData="formDatas"
                    :display="displays"
                    :value.sync="formDatas[formItem[uniqueKey]]"
                    :uniqueKey="uniqueKey"
                    :showFormItem="showFormItem")
            el-button.action-btn(@click="addTag" type="primary" plain) {{btnName}}

        // 工单 特殊处理
        TicketType(v-if="specialDialog.accessPermissions"
        :visible="specialDialog.accessPermissions"
        code="accessPermissions"
        @close="closeDialog"
        @add="add")

        TicketGeneral(v-if="specialDialog.general"
        :visible="specialDialog.general"
        code="general"
        @close="closeDialog"
        @add="add")
</template>
<script>
import TicketType from '@/components/system/globalParam/item/GlobalParamTicketType'
import TicketGeneral from '@/components/system/globalParam/item/GlobalParamTicketGeneral'
/**
 * @description 添加标签表单项
 */
export default {
    name: 'TagFormItem',
    components: {TicketType, TicketGeneral},
    props: {
        value: {
            type: Array,
            default: () => []
        },
        display: {
            type: Array,
            default: () => []
        },
        tagFormItem: {
            type: Object,
            default: () => {}
        },
        uniqueKey: {
            type: String,
            default: () => 'key'
        }
    },
    data () {
        return {
            showFormItem: true,
            formDatas: {},
            displays: {},
            specialItems: ['general', 'accessPermissions'],
            specialDialog: {
                general: false,
                accessPermissions: false
            }
        }
    },
    methods: {
        /**
         * @description 添加标签
         */
        addTag () {
            // 对于工单的配置需要在dialog中特殊处理
            if (this.specialItems.includes(this.tagFormItem.key)) {
                this.specialDialog[this.tagFormItem.key] = true
                return
            }

            let tag = ''
            let tagDisplay = ''
            let hasNullItem = this.tagFormItem.actionFormItems.some(item => !this.formDatas[item.key])
            if (hasNullItem) return
            let formItems = this.tagFormItem.actionFormItems
            for (let i = 0; i < formItems.length; i++) {
                //处理unique唯一性
                if (formItems[i].unique) {
                    let isExist = this.value.some(item => item.indexOf(this.formDatas[formItems[i].key]) === 0)

                    if (isExist) {
                        this.$notify({
                            title: '温馨提示',
                            message: `${this.tagFormItem.label}的${formItems[i].description}[${this.formDatas[formItems[i].key]}]不可重复!`,
                            type: 'warning'
                        })
                        return
                    }
                }
                tag += i % 2 === 1 ? ':' + this.formDatas[formItems[i].key] : this.formDatas[formItems[i].key]
                tagDisplay += this.displays[formItems[i].key]
            }

            this.value.push(tag)
            this.display.push(tagDisplay)
            this.$emit('update:display', this.display)
        },
        // 自定义的添加方式 data: {display: string, value: object}
        add (code, data) {
            this.value.push(data.value)
            this.display.push(data.display)
            this.$emit('update:display', this.display)
        },
        /**
         * @description 删除标签
         */
        handleDelete (index) {
            this.value.splice(index, 1)
            this.display.splice(index, 1)
            this.$emit('update:display', this.display)
        },

        closeDialog (key) {
            this.specialDialog[key] = false
        }
    },
    computed: {
        label () {
            return this.tagFormItem.label ? this.tagFormItem.label : ''
        },
        btnName () {
            return this.tagFormItem.actionName ? this.tagFormItem.actionName : '添加'
        }
    }
}
</script>
<style lang="scss" scoped>
.tag-form-item {
    display: flex;
    justify-content: space-around;
    .line {
        width: 1px;
        background-color: $borderColor;
        margin: 0 15px 0 5px;
    }
    .tags {
        flex: 1;
        .tag {
            margin: 0 5px 5px 0;
        }
    }
    .action {
        flex: 1;
        display: flex;
    }
    .action-btn {
        margin-top: 0px;
        margin-left: 15px;
        height: 32px;
    }
}
</style>

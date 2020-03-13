<template lang="pug">
    el-row.combinitem-box
        div.combinitem-title(v-if="!isFilterItem && !showItemLabel") {{combinitemLabel}}
        el-form(size="small" label-width="120px" :inline="inline" :class="{'combinitem-body': !isFilterItem, 'appserver': formId === 'appserver'}")
            UcmpDynamicFormItem.form-item-inline(
                :ref="'child'+item[uniqueKey]"
                v-for="item in copyChildren"
                :key="item[uniqueKey]"
                :value.sync="value[item[uniqueKey]]"
                :formData="value"
                :display.sync="updatedDisplay"
                :showFormItem="showFormItem"
                :formItem="item"
                :combinedIndex="combinedIndex"
                :uniqueKey="uniqueKey"
                :formId="formId"
                :showItemLabel="showItemLabel"
                :class="{'full-half': !hasOperation}"
                :disabled="disabled"
                :defaultValueKey="defaultValueKey"
                @focusWidget="focusWidget"
                @updateValue="updateValue"
            )
        //- 光大weblogic脚本中应用server名称的特殊处理
        div.form-body-item(v-if="!isFilterItem && !disabled")
            div.operation-div.pos-btn(v-if="hasOperation")
                el-button(v-if="!addDisabled && row === row_length - 1" type="primary" icon="ucmp-icon-plus" @click="handleOper('add', row)")
                el-button.remove-btn(v-if="!subDisabled && !(hidFirstDel && row_length === 1)" type="primary" icon="ucmp-icon-delete" @click="handleOper('delete', row)")
</template>
<script>
import IconButton from '../IconButton'
export default {
    props: {
        row: {
            type: Number,
            default: function () {
                return 0
            }
        },

        inline: {
            type: Boolean,
            default: function () {
                return true
            }
        },

        row_length: {
            type: Number,
            default: function () {
                return 0
            }
        },

        children: {
            type: Array,
            default: function () {
                return []
            }
        },
        value: {
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

        showFormItem: {
            type: Boolean,
            default: function () {
                return true
            }
        },

        uniqueKey: {
            type: String,
            default: function () {
                return 'key'
            }
        },

        subDisabled: {
            type: Boolean,
            default: function () {
                return true
            }
        },

        hidFirstDel: {
            type: Boolean,
            default: function () {
                return false
            }
        },

        addDisabled: {
            type: Boolean,
            default: function () {
                return true
            }
        },

        isScriptItem: {
            type: Boolean,
            default: false
        },

        combinedIndex: {
            type: [String, Number],
            default: ''
        },

        // 所属资源ID
        formId: {
            type: String,
            default: ''
        },

        combinitemLabel: {
            type: String,
            default: ''
        },

        isFilterItem: {
          type: Boolean,
          default: false
        },

        showItemLabel: {
            type: Boolean,
            default: false
        },

        disabled: {
            type: Boolean,
            default: false
        },
        defaultValueKey: {
            type: String,
            default: ''
        }
    },

    data () {
        return {
            isCombinItem: true
        }
    },

    computed: {
        /**
         * @description 更新display
         */
        updatedDisplay () {
            return JSON.parse(JSON.stringify(this.display))
        },

        // 对已有的props中的值进行深拷贝，避免直接修改发生报错
        copyChildren () {
            return JSON.parse(JSON.stringify(this.children))
        },

        /**
         * 影响其他属性数据列表的key，当前key的数据发生变化时，其他受影响的属性应该筛选重新得到数据列表
         * 目前该key只能有一个
         */
        influenceKey () {
            let filtered = this.copyChildren.filter(
                child => {
                    if (child.influence && child.influence.length)
                        return child
                }
            )
            let keys = filtered.map(
                child => {
                    return child[this.uniqueKey]
                }
            )
            if (keys.length)
                return keys[0]
            else return ''
        },

        /**
         * 影响其他属性数据列表的属性
         */
        influencedFormItem () {
            let items = this.copyChildren.filter(
                child => {
                    if (this.influenceKey && child[this.uniqueKey] === this.influenceKey)
                        return child
                }
            )
            if (items.length)
                return items[0]
            else return null
        },

        /**
         * 受影响的属性列表
         */
        beInfluencedFormItems () {
            if (this.influencedFormItem) {
                return this.copyChildren.filter(
                    child => {
                        if (this.influencedFormItem.influence.indexOf(child[this.uniqueKey]) !== -1)
                            return child
                    }
                )
            }
            return []
        },

        /**
         * 影响其他属性数据列表的属性值，需要监听当前值变化事件
         */
        influenceValue () {
            if (this.influenceKey)
                return this.value[this.influenceKey]
            else return ''
        },

        /**
         * @description 取值唯一的列
         */
        uniqueColumn () {
            let filtered = this.copyChildren.filter(
                child => {
                    if (!child.duplicated)
                        return child
                }
            )
            if (filtered.length)
                return filtered[0]
            else return ''
        },

        uniqueColumnValue () {
            if (!this.uniqueColumn)
                return ''
            return this.value[this.uniqueColumn[this.uniqueKey]]
        },

        /**
         * @description 是否存在增加/删除按钮
         */
        hasOperation () {
            // eslint-disable-next-line
            return !this.addDisabled && this.row === this.row_length - 1 || !this.subDisabled
        }
    },

    watch: {
        influenceValue (newVal, old) {
            let self = this
            if (newVal !== old) {
                if (this.beInfluencedFormItems.length) {
                    this.beInfluencedFormItems.forEach(
                        item => {
                            if (item.data_link && item.data_link.endpoint) {
                                if (!item._endpoint)
                                    this.$set(item, '_endpoint', item.data_link.endpoint)
                                item.data_link.params = {}
                                item.data_link.params[this.influenceKey] = newVal
                                // 强制获取数据
                                self.$refs['child' + item[self.uniqueKey]][0].updateDataSource()
                            }
                        }
                    )
                }
            }
        },

        /**
         * @description 值发生变化后，告知父组件，以便给其他行添加option禁用条件
         */
        uniqueColumnValue (newVal, old) {
            if (newVal !== old)
                this.$emit('updateDisabledRows', this.uniqueColumn[this.uniqueKey])
        },
        value: {
            deep: true,
            handler () {
                // 监听value更新display
                this.$nextTick(() => {
                    this.$emit('updateDisplay', this.row, this.updatedDisplay)
                })
            }
        }
    },

    methods: {
        handleOper (type, index) {
            if (type === 'add')
                this.$emit('addRow', type, index)
            else if (type === 'delete')
                this.$emit('deleteRow', type, index)
        },
        // oracle脚本的应用表空间名下拉选项更新
        updateEnum (val) {
            if (this.$refs.childAPP_DEFAULT_TABLESPACE_NAME) {
                this.$refs.childAPP_DEFAULT_TABLESPACE_NAME.forEach(item => {
                    item.updateList(val)
                })
            }
        },
        focusWidget (formId) {
            this.$emit('focusWidget', formId)
        },

        // 通知父组件去修改相应的校验规则
        updateValue (params) {
            let [formItemKey, relyOn, dependency] = [...params]
            if (dependency === 'including') { // 修改的表单元素为serverOrder时。需要更新对应的appserver_name
                relyOn.forEach(rely_item => {
                    this.$emit('updateCombinedItem', rely_item)
                })
            }
            if (!dependency)
                this.$emit('updateCombinedItem', formItemKey)
        }
    },

    components: {
        IconButton
    }
}
</script>
<style lang="scss" scoped>

</style>

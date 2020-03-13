<template lang="pug">
    div
        CombinedFormRow(
            ref="combinedFormRow"
            v-for="(children, index) in childrenRows"
            :key="index"
            :row="index"
            :inline="inline"
            :row_length="childrenRows.length"
            :children.sync="children"
            :value.sync="combinVal[index]"
            :display.sync="display[index]"
            :showFormItem="showFormItem"
            :uniqueKey="uniqueKey"
            :subDisabled="subDisabled"
            :addDisabled="addDisabled"
            :hidFirstDel="hidFirstDel"
            :isScriptItem="isScriptItem"
            :class="{'apply-combin-width': isApplyHandle && showItemLabel, 'tag-combin': formItem[uniqueKey] === 'tag'}"
            :combinedIndex="index"
            :formId="formId"
            :combinitemLabel="formItem.label"
            :isFilterItem="isFilterItem"
            :showItemLabel="showItemLabel"
            :disabled="disabled"
            :defaultValueKey="defaultValueKey"
            @addRow="addRow"
            @deleteRow="deleteRow"
            @updateDisabledRows="updateDisabledRows"
            @updateDisplay="updateDisplay"
            @focusWidget="focusWidget"
            @updateCombinedItem="updateCombinedItem")
        div.form-body-item(v-if="!childrenRows.length && !disabled")
            div.operation-div.add-btn(v-if="!childrenRows.length && !disabled")
                el-button(type="primary" size="mini" icon="el-icon-circle-plus-outline" @click="addRow") 添加{{formItem.label}}

</template>

<script>
import IconButton from '../IconButton'
import CombinedFormRow from './CombinedFormRow'

export default {
    props: {
        value: {
            type: [String, Array],
            // props 赋默认值时，如果为 {} 或 [] 需要使用 =》 函数方式
            default: () => []
        },

        display: {
            type: [String, Array],
            default: function () {
                return []
            }
        },

        showFormItem: {
            type: Boolean,
            default: function () {
                return true
            }
        },

        formItem: {
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
        validation: {
            type: Object,
            default: function () {
                return { max: '1', min: '1' }
            }
        },
        childrenKey: {
            type: String,
            default: 'children'
        },

        isScriptItem: {
            type: Boolean,
            default: false
        },

        isApplyHandle: { // 是否为申请资源流程
            type: Boolean,
            default: () => false
        },

        // 所属资源ID
        formId: {
            type: String,
            default: ''
        },

        isFilterItem: {
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
            row_length: 0,
            childrenRows: [], // formItem数组集合（包含child元数据）
            inline: true,
            combinVal: [] // 当前页面中需要用的value数组，避免直接修改props中的值
        }
    },

    methods: {
        addRow () {
            this.$nextTick(() => {
                // 添加一行数据
                let temp_arr = JSON.parse(JSON.stringify(this.chidlren))
                if (this.formItem[this.uniqueKey] === 'appserver') {
                    let ports = []
                    this.combinVal.forEach(item => {
                        if (item.port)
                            ports.push(item.port)
                    })
                    let port = this.getPort(ports)
                    if (temp_arr[2])
                        temp_arr[2].default = port
                    else
                        temp_arr[1].default = port
                }
                this.childrenRows.push(temp_arr)

                let value = JSON.parse(JSON.stringify(this.combinVal)) || [] //传入undefined
                let display = JSON.parse(JSON.stringify(this.display)) || []

                this.row_length++

                [value, display] = this.initRow(value, display, this.row_length - 1)
                this.combinVal.push(value[this.row_length - 1])
                this.$emit('update:display', display)
            })
        },

        /**
         * @description 通知所有行，添加当前列的option禁用条件
         */
        updateDisabledRows (key) {
            if (this.combinVal && this.combinVal.length) {
                let disabledRows = this.combinVal.map(
                    item => {
                        return JSON.parse(JSON.stringify(item[key] || ''))
                    }
                )
                this.childrenRows.forEach(
                    childRow => {
                        childRow.forEach(
                            child => {
                                if (child[this.uniqueKey] === key) {
                                    if (!child.disabledRows)
                                        this.$set(child, 'disabledRows', [])
                                    child.disabledRows = disabledRows
                                }
                            }
                        )
                    }
                )
            }
        },

        updateDisplay (index, val) {
            // 此处不能直接对display进行修改，需要对其进行深拷贝后操作
            let displayGriup = JSON.parse(JSON.stringify(this.display))
            displayGriup.splice(index, 1, val)
            // 同步更新display
            this.$emit('update:display', displayGriup)
        },

        deleteRow (type, index) {
            this.$nextTick(() => {
                this.row_length--
                let value = JSON.parse(JSON.stringify(this.combinVal))
                let display = JSON.parse(JSON.stringify(this.display))

                value.splice(index, 1)
                display.splice(index, 1)
                this.childrenRows.splice(index, 1)
                this.combinVal.splice(index, 1)

                this.chidlren.forEach(row_item => {
                    this.updateCombinedItem(row_item[this.uniqueKey], value)
                })

                this.$emit('update:display', display)
            })
        },

        initRow (row, display, index) {
            [row[index], display[index]] = [{}, {}]
            this.childrenRows.forEach((child, _index) => {
                if (_index === index) {
                    child.forEach(_item => {
                        row[index][_item[this.uniqueKey]] = _item[this.defaultValueKey]
                        display[index][_item[this.uniqueKey]] = _item[this.defaultValueKey]
                    })
                }
            })
            return [row, display]
        },

        changeType (child) {
            if (child.type === 'int')
                child.type = 'number'
            else if (child.type === 'array' || (child.enum || (child.data_link && !child.data_link.child)))
                child.type = 'select'
            else if (child.type === 'string')
                child.type = 'input'
            if (!child.validation)
                child.validation = {}
            if (child.required)
                child.validation.required = true
            if (child.type === 'select' && child.enum)
                child.defaultOptions = child.enum
        },

        // 初始化combinedRow集合
        /**
         * 场景1： 对已经有的值进行赋值操作（编辑）
         * 场景2: 根据formItem中的最小值进行初始化，所有值为空
         *  */
        initChildRows () {
            if (Array.isArray(this.combinVal) && this.combinVal.length) {
                this.combinVal.forEach((item, index) => {
                    this.childrenRows.push(JSON.parse(JSON.stringify(this.chidlren)))
                    this.childrenRows[index].forEach(child_item => {
                        if (item.hasOwnProperty(child_item.key))
                            child_item.default = item[child_item.key]
                    })
                })
            } else {
                for (let index = 0; index < this.row_length; index++) {
                    if (!this.childrenRows[index] && this.chidlren)
                        this.childrenRows.push(JSON.parse(JSON.stringify(this.chidlren)))
                }
            }
        },
        focusWidget (formId) {
            this.$emit('focusWidget', formId)
        },
        // 端口号递增相加，用于weblogic的VServer端口
        getPort (ports = [1], step = 1) {
            let port = Math.min.apply(null, ports) + step
            if (ports.includes(port))
                port = this.getPort(ports, ++step)
            return port
        },

        // 根据value同步修改该组中所有formItem的校验规则
        updateCombinedItem (formItemKey, value = JSON.parse(JSON.stringify(this.combinVal))) {
            this.childrenRows.forEach((row, rowIndex) => {
                let currentValueGroup = JSON.parse(JSON.stringify(value))
                currentValueGroup.splice(rowIndex, 1)
                row.forEach(child => {
                    if (child[this.uniqueKey] === 'appserver_name') {
                        if (value[rowIndex] && value[rowIndex].serverOrder)
                            child.relyParams = value[rowIndex].serverOrder
                        else
                            delete child.relyParams
                    }

                    if (child[this.uniqueKey] === formItemKey) {
                        let valueGroup = []
                        currentValueGroup.forEach((item, index) => {
                            if (item[formItemKey]) {
                                // weblogic的应用server名称为 appserver_name + serverOrder
                                if (formItemKey !== 'appserver_name')
                                    valueGroup.push(item[formItemKey])
                                else
                                    valueGroup.push(item.serverOrder ? (item[formItemKey] + item.serverOrder) : item[formItemKey])
                            }
                        })
                        valueGroup = Array.from(new Set(valueGroup))
                        this.$set(child, 'repeatVals', valueGroup)
                    }
                })
            })
            this.$nextTick(() => {
                this.initRowRules(formItemKey)
            })
        },

        // 通过调用ref获取到的表单元素中的updateCombinedValidation对已有的相关表单元素进行校验触发
        initRowRules (formItemKey) {
            if (Array.isArray(this.$refs.combinedFormRow)) {
                this.$refs.combinedFormRow.forEach(formRow => {
                    Object.values(formRow.$refs).forEach(ref_item => {
                        // 仅对值改变的表单元素集合进行校验信息修改
                        if (ref_item[0] && (ref_item[0].formItem[this.uniqueKey] === formItemKey))
                            ref_item[0].updateCombinedValidation()
                    })
                })
            }
        }
    },

    watch: {
        'formItem.children': {
            deep: true,
            handler (val) {
                if (this.formItem[this.uniqueKey] === 'app_user' && val && this.$refs.combinedFormRow) {
                    let tableSpaceChild = val.find(_enum => {
                        return _enum.key === 'APP_DEFAULT_TABLESPACE_NAME'
                    }) || {}
                    this.$refs.combinedFormRow.forEach(row => {
                      row.updateEnum(tableSpaceChild.enum)
                    })
                }
            }
        },

        // 监听当前组件的值，通知父组件
        combinVal: {
            deep: true,
            handler (newVal) {
                // 脚本中的value使用json字符串，标签等value为数组格式
                if (this.isScriptItem)
                    this.$emit('update:value', JSON.stringify(newVal))
                else
                    this.$emit('update:value', newVal)
            }
        }
    },

    computed: {
        iconText () {
            return '增加' + this.formItem.label
        },
        chidlren () {
            if (!this.formItem || !this.formItem[this.childrenKey])
                return []
            let children = JSON.parse(JSON.stringify(this.formItem[this.childrenKey]))
            children.forEach(child => {
                this.changeType(child)
            })
            return children
        },

        addDisabled () {
            return !!(this.validation.max && this.row_length === (/^\d+/g.test(this.validation.max) ? this.validation.max : this.validation.max - '0'))
        },

        subDisabled () {
            return !!(this.validation.min && this.row_length === (/^\d+/g.test(this.validation.min) ? this.validation.min : this.validation.min - '0'))
        },

        showItemLabel () {
            return this.formItem[this.uniqueKey] !== 'tag'
        },

        hidFirstDel () {
            return this.formItem.fe_type && this.formItem.fe_type.hidAdd
        }
    },

    created () {
        this.$nextTick(() => {
            if (this.validation) {
                let defaultValue = []
                if (this.value) { // 有默认值
                    defaultValue = Array.isArray(this.value) ? JSON.parse(JSON.stringify(this.value)) : JSON.parse(this.value)
                    if (!this.value.length) {
                        if (this.formItem.fe_type && this.formItem.fe_type.hidAdd)
                            this.addRow()
                    }
                } else {
                    if ((this.formItem.fe_type && this.formItem.fe_type.hidAdd) || this.formItem.key === 'tag')
                        this.addRow()
                }

                if (!defaultValue.length && this.formItem.default)
                    defaultValue = Array.isArray(this.formItem.default) ? JSON.parse(JSON.stringify(this.formItem.default)) : JSON.parse(this.formItem.default)

                this.row_length = defaultValue.length || 0

                let value = JSON.parse(JSON.stringify(defaultValue))

                // UCMP-1318 申请带有云主机的编排实例，申请单确认主机详情的标签显示是id内容
                let display = JSON.parse(JSON.stringify(this.display || []))
                if (typeof display === 'string')
                    display = JSON.parse(display)

                this.initChildRows()

                for (let i = 0; i < this.row_length; i++) {
                    if (!value[i])
                        [value, display] = this.initRow(value, display, i)
                }

                this.combinVal = value

                // UCMP-1690处理申请单申请页面，因display中tag属性缺少导致的缺少优先级选择框问题
                if (!this.display || !Array.isArray(this.display) || (Array.isArray(this.display) && !this.display.length))
                    this.$emit('update:display', display)
                }
            })
    },

    components: {
        CombinedFormRow,
        IconButton
    }
}
</script>
<style lang="scss" scoped>
.label-width {
  display: inline-block;
  text-align: right;
  width: 120px;
}
</style>

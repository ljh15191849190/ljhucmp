<template lang="pug">
    span(v-if="column.filters || column.order")
        el-dropdown.header-filter-drop(v-if="column.filters" size="small" trigger="click" @command="handleHeaderCommand" placement="bottom-start" :class="{'active': selectedVal !== undefined}")
            span
                | {{column.label}}
                i.el-icon-caret-bottom.el-icon--right
            el-dropdown-menu.filter-drop-menu(slot="dropdown")
                el-dropdown-item.dropdown-top(:command="undefined") 全部
                el-dropdown-item.dropdown-top(v-if="loading") 加载中...
                el-dropdown-item(
                    v-for="(command, index) in column.filters"
                    :class="{'is-selected': !!((selectedVal !== undefined) && selectedVal.toString() === (command[column.filter_link && column.filter_link.value_field || 'value']).toString())}"
                    :key="column.useIndex ? index : command[column.filter_link &&   column.filter_link.value_field || 'value']"
                    :command="command[column.filter_link &&  column.filter_link.value_field || 'value']") {{formatterListDisplay(column, command)}}
        span(v-if="!column.filters") {{column.label}}
        span.sort-btn(v-if="column.order" @click="toggleOrder()")
            i.el-icon-sort-up(:class="{'active': (order && searchParams.order_by === filterKey)}")
            i.el-icon-sort-down(:class="{'active': !order && searchParams.order_by === filterKey}")
    span(v-else) {{column.label}}
</template>
<script>
import Api from '@api'

export default {
    props: ['column', 'searchParams'],
    data () {
        return {
            order: true,
            loading: false
        }
    },
    created () {
        if (this.column.filter_link && this.column.filter_link.link_url) {
            this.loading = true
            Api[this.column.filter_link.method || 'get'](this.column.filter_link.link_url, {}, true).then(res => {
                // 如果 filters 不存在则将其转为空数组，防止报错
                if (!this.column.filters) 
                    this.column.filters = []

                if (!this.column.filter_link.data_pos)
                    this.column.filters = [...[], ...res, ...this.column.filters]
                else {
                    let prop_keys = this.column.filter_link.data_pos.split('.')
                    let val_arr = this.getArrFromRes(res, prop_keys)
                    this.column.filters = [...[], ...val_arr, ...this.column.filters]
                }
                this.loading = false
            }, () => {
                this.loading = false
            })
        }
    },
    methods: {
        getArrFromRes (res, keys) {
            if (res && keys[0] && res.hasOwnProperty(keys[0])) {
                if (!keys[1])
                    return res[keys[0]]
                else
                    this.getArrFromRes(res[keys[0]], keys.shift())
            } else
                return []
        },
        handleHeaderCommand (command) {
            this.$emit('handleHeaderCommand', {[this.filterKey]: command})
        },
         /**
         * @description 下拉框显示内容格式化
         */
        formatterListDisplay (column, command) {
            let labelKey = column.filter_link && column.filter_link.label_field ? column.filter_link.label_field : 'label'
            let rst = command[labelKey]

            // 副标题显示
            let subKey = column.filter_link && column.filter_link.sub_label_field ? column.filter_link.sub_label_field : ''
            if (subKey)
                rst = rst + '(' + command[subKey] + ')'

            return rst
        },

        toggleOrder () {
            this.order = !this.order
            this.$emit('handleHeaderCommand', {
                order_by: this.filterKey,
                order: this.order ? 'asc' : 'desc'
            })
        }
    },
    computed: {
        selectedVal () {
            return this.searchParams[this.filterKey]
        },
        filterKey () {
            return this.column.filterKey || this.column.prop
        }
    }
}
</script>
<style lang="scss" scoped>
.sort-btn{
    cursor: pointer;
    white-space: nowrap;
}
</style>


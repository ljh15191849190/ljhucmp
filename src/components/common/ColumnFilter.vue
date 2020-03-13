<template lang="pug">
    div.th-filter(
        v-clickoutside="clickoutside"
        v-if="show")
        ul(v-if="filterItem.type === 'select' || filterItem.type === 'selectObj'")
                li.el-dropdown-menu__item.dropdown-top(
                    @click="headFilter('all')"
                    :class="{'th-filter-item-checked': activedId === 'all'}"
                ) 全部
                li.el-dropdown-menu__item(
                    v-for="item in filterItem.options" 
                    :key="item[config.prop]"
                    @click="headFilter(item[config.prop])" 
                    :class="{'th-filter-item-checked': activedId === item[config.prop]}"
                    ) {{item[config.label]}}
</template>
<script>
/**
 * @description a dropdown component for table column filter 
 */
import Clickoutside from 'element-ui/lib/utils/clickoutside'

export default {
    directives: {
        Clickoutside
    },
    props: {
        filterItem: {
            required: true,
            type: Object,
            default: () => {}
        },
        show: {
            required: true,
            type: Boolean,
            default: false
        },
        activedId: {
            required: true,
            type: String | Number
        },
        config: {
            type: Object,
            default: () => { return {prop: 'id', label: 'name'} }
        }
    },
    data () {
        return {
            
        }
    },
    methods: {
        headFilter (value) {
            this.$emit('headFilter', this.filterItem, value)
        },

        clickoutside () {
            this.$emit('update:show', false)
            this.$emit('clickoutside')
        }
    }
}
</script>
<style lang="scss" scoped>
.th-filter{
    z-index: 2000;
    background: #fff;
}
ul {
    list-style: none;
    margin: 0;
    padding-left: 0;
}
</style>

<template lang="pug">
    div.full-height
        UcmpContainer(:breadcrumbItems="breadcrumbItems")
            div.full-height(slot="content")
                div.top-btns
                    el-button(size="small" type="primary" icon="el-icon-plus" @click="addRule") 添加规则
                div.bottom-container.overflow-y-auto
                    el-card.margin-top.box-card(v-for="(ruleList, index) in ruleLists" :key="index")
                        div(slot="header")
                            span {{ruleList.label}}
                            span.margin-left.margin-right {{ruleList.subtitle}}
                            el-button(type="primary" size="small" icon="el-icon-delete" :disabled="ruleList.disabled") 删除
                        div.table-container
                            el-table(:data="ruleList.list" @select="handleSelectionChange(selection, ruleList.type)" border)
                                el-table-column(type="selection" width="45")
                                el-table-column(
                                    v-for="(column, index) in columns"
                                    :key="index"
                                    :prop="column.prop"
                                    :label="column.label"
                                    :width="column.width")
                                    template(slot-scope="scope")
                                        div(v-if="column.prop === 'operation'")
                                            el-button(size="small") 修改
                                            el-button(size="small") 禁用
                                        span(v-else) {{scope.row[column.prop]}}
        Create-Rule(v-if="fireRuleVisible"  :visible="fireRuleVisible" @closeDialog="closeDialog")
</template>
<script>
import CreateRule from './CreateRule'
import firewallMock from '@/mock/iaas/firewall'
export default {
    data () {
        return {
            breadcrumbItems: [
                {prop: '/firewall', label: '防火墙管理'},
                {prop: '', label: '规则详情'}
            ],
            columns: [
                {prop: 'security_group_rule_name', label: '名称', width: 150},
                {prop: 'priority', label: '优先级', width: 150},
                {prop: 'protocol', label: '协议', width: 150},
                {prop: 'action', label: '行为', width: 150},
                {prop: 'val1', label: '起始端口', width: 250},
                {prop: 'val2', label: '结束端口', width: 250},
                {prop: 'val3', label: '源IP', width: 150},
                {prop: 'operation', label: '操作'}
            ],
            tableData: [],
            ruleLists: [
                {
                    label: '下行规则',
                    subtitle: '(从外部访问云资源)',
                    type: 'down',
                    disabled: true,
                    list: firewallMock.downRuleList
                },
                {
                    label: '上行规则',
                    subtitle: '(从云资源访问外部)',
                    type: 'up',
                    disabled: true,
                    list: firewallMock.upRuleLsit
                }
            ],
            fireRuleVisible: false
        }
    },
    methods: {
        // 表格列选择操作
        handleSelectionChange (val, type) {
            console.log(val, type)
        },
        /**
         * @description 创建防火墙规则
         */
        addRule () {
            this.fireRuleVisible = true
        },
        /**
         * @description 关闭创建防火墙规则对话框
         */
        closeDialog () {
            this.fireRuleVisible = false
        }
    },
    components: {
        CreateRule
    }
}
</script>
<style lang="scss" scoped>
.bottom-container{
    height: calc(100% - 30px);
}
</style>



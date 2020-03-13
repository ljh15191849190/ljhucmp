<template lang="pug">
    div.full-height
        UcmpContainer(:breadcrumbItems="breadcrumbItems")
            div.full-container(slot="content")
                div.top-button-container
                    el-button.default-button(type="primary" size="small" icon="el-icon-plus" @click="createApp") 创建应用系统
                div.full-height(label-width="120px" size="small" label-position="left")
                    UcmpTableContainer(:advance="advanceSwitch" :pagination="pagination" :filterItems="filterItems" @size-change="handleSizeChange" @current-change="handleCurrentChange")
                        div.full-height.border-top.padding-top(slot="tableContainer")
                            div.d-flex
                                el-button.default-button(type="primary" size="mini" icon="el-icon-plus") 分配管理员
                            el-table.panel-table(:data="tableData" border)
                                el-table-column(type="selection" width="45")
                                el-table-column(type="expand")
                                    template(slot-scope="props")
                                        el-form(label-position="left" inline)
                                            el-form-item(label="描述")
                                                span {{ props.row['desc'] }}
                                el-table-column(:prop="column.prop" v-for="column in columns" :key="column.prop" :label="column.label" :width="column.width")
                                el-table-column(label="操作" width="150")
                                    template(slot-scope="scope")
                                        Icon-Button(v-for="operation in operations" :key="operation.prop" :type="operation.type" @iconClick="handleOperation" :args="{id: operation.prop, row: scope.row}" :text="operation.label")
                        el-button.default-button(slot="filter-btns" type="primary" size="small") 查询
        Edit-Application(v-if="appVisible"  :visible="appVisible" @closeDialog="closeDialog")
</template>
<script>
/**
 * @description 应用系统管理
 */
import EditApplication from './EditApplication'
export default {
    name: 'ApplicationMgmt',
    data () {
        return {
            appVisible: false,
            breadcrumbItems: [
                { prop: '', label: '应用系统管理' }
            ],
            advanceSwitch: false,
            pagination: {
                index: 1,
                count: 1,
                size: 20
            },
            operations: [
                {
                    type: 'ucmp-icon-edit',
                    label: '编辑',
                    prop: 'edit'
                },
                {
                    prop: 'delete',
                    label: '删除',
                    type: 'ucmp-icon-delete'
                },
                {
                    prop: 'view',
                    label: '查看',
                    type: 'ucmp-icon-view'
                }
            ],
            filterItems: [
                {
                    label: '系统名称',
                    key: 'appName',
                    type: 'input'
                }
            ],
            columns: [
                { prop: 'appName', label: '应用系统名称' },
                { prop: 'applicationGrade', label: '应用系统级别' },
                { prop: 'org', label: '所属机构' },
                { prop: 'tenant', label: '所属VDC' }
            ],
            tableData: [
               { id: '1', appName: 'lxksystem', applicationGrade: 'SLA1', org: 'lxkOrg', tenant: 'VDC', desc: '这是应用系统的详细信息描述。' },
               { id: '1', appName: 'lxksystem', applicationGrade: 'SLA1', org: 'lxkOrg', tenant: 'VDC', desc: '这是应用系统的详细信息描述。' },
               { id: '1', appName: 'lxksystem', applicationGrade: 'SLA1', org: 'lxkOrg', tenant: 'VDC', desc: '这是应用系统的详细信息描述。' },
               { id: '1', appName: 'lxksystem', applicationGrade: 'SLA1', org: 'lxkOrg', tenant: 'VDC', desc: '这是应用系统的详细信息描述。' },
               { id: '1', appName: 'lxksystem', applicationGrade: 'SLA1', org: 'lxkOrg', tenant: 'VDC', desc: '这是应用系统的详细信息描述。' },
               { id: '1', appName: 'lxksystem', applicationGrade: 'SLA1', org: 'lxkOrg', tenant: 'VDC', desc: '这是应用系统的详细信息描述。' },
               { id: '1', appName: 'lxksystem', applicationGrade: 'SLA1', org: 'lxkOrg', tenant: 'VDC', desc: '这是应用系统的详细信息描述。' },
               { id: '1', appName: 'lxksystem', applicationGrade: 'SLA1', org: 'lxkOrg', tenant: 'VDC', desc: '这是应用系统的详细信息描述。' },
               { id: '1', appName: 'lxksystem', applicationGrade: 'SLA1', org: 'lxkOrg', tenant: 'VDC', desc: '这是应用系统的详细信息描述。' },
               { id: '1', appName: 'lxksystem', applicationGrade: 'SLA1', org: 'lxkOrg', tenant: 'VDC', desc: '这是应用系统的详细信息描述。' },
               { id: '1', appName: 'lxksystem', applicationGrade: 'SLA1', org: 'lxkOrg', tenant: 'VDC', desc: '这是应用系统的详细信息描述。' },
               { id: '1', appName: 'lxksystem', applicationGrade: 'SLA1', org: 'lxkOrg', tenant: 'VDC', desc: '这是应用系统的详细信息描述。' },
               { id: '1', appName: 'lxksystem', applicationGrade: 'SLA1', org: 'lxkOrg', tenant: 'VDC', desc: '这是应用系统的详细信息描述。' },
               { id: '1', appName: 'lxksystem', applicationGrade: 'SLA1', org: 'lxkOrg', tenant: 'VDC', desc: '这是应用系统的详细信息描述。' },
               { id: '1', appName: 'lxksystem', applicationGrade: 'SLA1', org: 'lxkOrg', tenant: 'VDC', desc: '这是应用系统的详细信息描述。' },
               { id: '1', appName: 'lxksystem', applicationGrade: 'SLA1', org: 'lxkOrg', tenant: 'VDC', desc: '这是应用系统的详细信息描述。' }
            ]
        }
    },
    methods: {
        /**
         * @description 默认每页查询条数发生变化
         */
        handleSizeChange () {

        },
        handleCurrentChange () {

        },
        /**
         * @description 关闭对话框
         */
        closeDialog () {
            this.appVisible = false
        },
        /**
         * @description 创建应用系统
         */
        createApp () {
            this.appVisible = true
        },
        /**
         * @description 操作处理
         */
        handleOperation (obj) {
             //删除操作
            if (obj.id === 'delete')
                this.deleteApp(obj)
            else if (obj.id === 'edit')
                this.appVisible = true
            else
                this.$router.push('/application/appMgmtView/333')
        },
        /**
         * @description 删除应用系统
         */
        deleteApp (obj) {
            let vm = this
            vm.$confirm(`确定要删除应用系统 ${obj.row.appName} 吗?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                vm.$notify({
                    title: '通知',
                    type: 'success',
                    message: '删除成功!'
                })
            }).catch(() => {
            })
        }
    },
    components: {
        EditApplication
    },
    created () {
    }
}
</script>
<style lang="scss" scoped>
</style>


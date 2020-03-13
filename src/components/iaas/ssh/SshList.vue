<template lang="pug">
    div.full-height
        UcmpContainer(:breadcrumbItems="breadcrumbItems")
            div.overflow-y-auto.full-container(slot="content")
                div.top-button-container
                    el-button.default-button(type="primary" size="small" icon="el-icon-plus" @click="createSsh") 创建密钥
                el-form.full-height(label-width="120px" size="small" label-position="left")
                    UcmpTableContainer(:advance="advanceSwitch" :pagination="pagination" :filterItems="filterItems" @size-change="handleSizeChange" @current-change="handleCurrentChange")
                        div.full-height.border-top.padding-top(slot="tableContainer")
                            div.d-flex.padding-bottom
                                el-button.default-button(type="primary" size="mini") 添加到主机
                                el-button.default-button(type="primary" size="mini") 删除
                            el-table.panel-table-container(:data="tableData" border)
                                el-table-column(type="selection" width="45")
                                el-table-column(:prop="column.prop" v-for="column in columns" :key="column.prop" :label="column.label" :width="column.width")
                                el-table-column(label="操作" width="150")
                                    template(slot-scope="scope")
                                        Icon-Button(v-for="operation in operations" :key="operation.prop" :type="operation.type" @iconClick="handleOperation" :args="{id: operation.prop, row: scope.row}" :text="operation.label")
                        el-button.default-button(slot="filter-btns" type="primary" size="small") 查询
        Edit-Ssh(v-if="sshVisible"  :visible="sshVisible" @closeDialog="closeDialog")
</template>
<script>
import Ssh from '@mock/ssh/ssh.mock'
import EditSsh from './EditSsh'
/**
 * @description ssh密钥
 */
export default {
    data () {
        return {
            sshVisible: false,
            cloudProvider: '',
            breadcrumbItems: [
                { prop: '', label: '密钥管理' }
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
                }
            ],
            filterItems: [
                {
                    label: '云厂商',
                    key: 'name',
                    type: 'select'
                },
                {
                    label: '可用区',
                    key: 'cloudProvider',
                    type: 'select'
                }
            ],
            columns: Ssh.columns,
            tableData: Ssh.tableList
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
         * @description 宿主机详情
         */
        toDetail () {

        },
        /**
         * @description 创建密钥
         */
        createSsh () {
            this.sshVisible = true
        },
        /**
         * @description 关闭创建/编辑密钥对话框
         */
        closeDialog () {
            this.sshVisible = false
        },
        /**
         * @description 操作处理
         */
        handleOperation (obj) {
            //删除操作
            if (obj.id === 'delete')
                this.handleDelete(obj)
            else
                this.handleEdit(obj)
        },
        /**
         * @description 删除操作
         */
        handleDelete (obj) {
            let vm = this
            vm.$confirm(`确定删除密钥 ${obj.row.name}, 是否继续?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                vm.$message({
                    type: 'success',
                    message: '删除成功!'
                })
            }).catch(() => {
            })
        },
        /**
         * @description 编辑操作
         */
        handleEdit (obj) {
            this.sshVisible = true
        }
    },
    components: {
        EditSsh
    },
    created () {
    }
}
</script>
<style lang="scss" scoped>
.panel-table-container {
    height: calc(100% - 48px);
}
</style>

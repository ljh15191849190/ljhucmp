<template lang="pug">
  UcmpContainer(:breadcrumbItems="breadcrumbItems")
    div.overflow-y-auto.full-container(slot="content")
        div.top-button-container
            el-button.default-button(type="primary" size="small" icon="el-icon-plus" @click="createFirewall") 创建安全组
        UcmpTableContainer(:advance="advanceSwitch" :pagination="pagination" :filterItems="filterItems" @size-change="handleSizeChange" @current-change="handleCurrentChange")
            div.full-height.border-top.padding-top(slot="tableContainer")
                div.d-flex
                    el-button.default-button(type="primary" size="mini" :disabled="!selectedItems.length" @click="deleteFirewall") 删除
                el-table.panel-table-container.margin-top(:data="tableData" @selection-change="handleSelectionChange" border)
                    el-table-column(type="selection" width="35")
                    el-table-column(type="expand")
                        template(slot-scope="props")
                            el-form.demo-table-expand(label-position="left" inline)
                                el-form-item(v-for="item in propArr" :label="item.label" :key="item.prop")
                                    span {{ props.row[item.prop] }}
                    el-table-column(
                        :prop="column.prop"
                        v-for="column in columns"
                        :key="column.prop"
                        :label="column.label"
                        :width="column.width")
                        template(slot-scope="scope")
                            router-link(:to="{name: 'firewallRule', query:{id: scope.row.security_group_id}}" v-if="column.prop === 'security_group_id'") {{scope.row.security_group_id}}
                            div.handleBtns(v-else-if="column.prop === 'operation'")
                                Icon-Button(v-for="operation in operations" :key="operation.prop" :type="operation.type" @iconClick="handleOperation" :args="{id: operation.prop, row: scope.row}" :text="operation.label")
                            span(v-else) {{scope.row[column.prop]}}
        el-dialog(:title="dialogInfo.title" :visible.sync="dialogInfo.dialogVisible" width="550px")
            el-form(:model="formData" :rules="rules" ref="ruleFoem" label-width="120px")
                el-form-item(label="安全组名称" prop="name")
                    el-input.input-width(size="small" v-model="formData.name")
                el-form-item(v-if="dialogInfo.type === 'modify'" label="描述" prop="description")
                    el-input.input-width(size="small" type="textarea" v-model="formData.description")
                el-form-item.text-center
                    el-button(@click="dialogInfo.dialogVisible = false") 取消
                    el-button(type="primary" @click="confirmHandle") 保存
</template>
<script>
/**
 * @description ssh密钥
 */
// mock
import FirewallListMock from '@/mock/iaas/firewall'
export default {
    name: 'FirewallList',
    data () {
        return {
            cloudProvider: '',
            breadcrumbItems: [
                { prop: '/firewall', label: '安全组管理' }
            ],
            advanceSwitch: false,
            pagination: {
                index: 1,
                count: 1,
                size: 20
            },
            operations: [
                {
                    prop: 'edit',
                    label: '修改',
                    type: 'ucmp-icon-edit'
                }, {
                    prop: 'delete',
                    label: '删除',
                    type: 'ucmp-icon-delete'
                }
            ],
            columns: [
                { prop: 'security_group_id', label: 'ID' },
                { prop: 'security_group_name', label: '名称' },
                { prop: 'create_time', label: '创建时间' },
                { prop: 'operation', label: '操作' }
            ],
            tableData: FirewallListMock.security_group_set,
            selectedItems: [],
            propArr: [
                {
                    label: '安全组ID',
                    prop: 'security_group_id'
                },
                {
                    label: '名称',
                    prop: 'security_group_name'
                },
                {
                    label: '创建时间',
                    prop: 'create_time'
                },
                {
                    label: '资源',
                    prop: 'resources',
                    colspan: 3
                },
                {
                    label: '描述',
                    prop: 'description',
                    colspan: 3
                }
            ],
            formData: {
                name: '',
                description: ''
            },
            rules: {
                name: [
                    { required: true, message: '防火墙名称不能为空', trigger: 'blur' }
                ]
            },
            dialogInfo: {
                title: '',
                type: '',
                dialogVisible: false
            }
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
        // 创建安全组操作
        createFirewall () {
            this.dialogInfo.title = '创建安全组'
            this.dialogInfo.type = 'add'
            this.dialogInfo.dialogVisible = true
        },
        // 编辑安全组信息
        editFirewallInfo () {
            this.dialogInfo.title = '编辑安全组'
            this.dialogInfo.type = 'modify'
            this.dialogInfo.dialogVisible = true
        },
        // 创建/编辑安全组信息之后的保存操作
        confirmHandle () {
            this.dialogInfo.dialogVisible = false
        },
        // 删除安全组操作
        deleteFirewall () {
            this.$confirm('此操作将永久删除选中的安全组, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$message({
                    type: 'success',
                    message: '删除成功!'
                })
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消删除'
                })
            })
        },
        // 监控安全组列表选中动作
        handleSelectionChange (val) {
            console.log(val)
            this.selectedItems = val
        },
        handleOperation (scope) {
            if (scope.id === 'edit')
                this.editFirewallInfo()
            else
                this.deleteFirewall()
        }
    },
    created () {
    },
    computed: {
        filterItems () {
            return [
                {
                    label: '云厂商',
                    type: 'select'
                },
                {
                    label: '云资源',
                    type: 'select'
                }
            ]
        }
    },
    components: {
    }
}
</script>
<style lang="scss" scoped>
.text-right{
    width: 200px;
    line-height: 40px;
    padding-right: 20px;
}
.text-left{
    line-height: 40px;
}
.panel-table-container {
    height: calc(100% - 48px);
}
.demo-table-expand {
    font-size: 0;
}
.demo-table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 33%;
}
</style>

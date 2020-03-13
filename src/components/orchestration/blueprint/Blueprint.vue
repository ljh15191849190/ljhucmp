<template lang="pug">
    UcmpContainer(:breadcrumbItems="breadcrumbItems")
        div.full-container(slot="content")
            div.top-button-container
                el-button.default-button.creat-button(type="primary" size="small" icon="el-icon-plus" @click="$router.push('/orchestrate-app/add')") 新建编排
            UcmpTableContainer(
                    :advance="advanceSwitch"
                    :filterItems="filterItems"
                    :pagination.sync="pagination"
                    @sizeChange="handleSizeChange"
                    @currentChange="handleCurrentChange"
                    searchPlaceholder="请输入编排名称进行搜索"
                    :submit="query")
                    div.full-height(slot="tableContainer")
                        el-table(:data="blueprintData" v-loading="isLoading" element-loading-spinner="ucmp-icon-loading" border)
                            el-table-column(
                                v-for="column in columns"
                                :type="column.type"
                                :prop="column.prop"
                                :key="column.prop"
                                :show-overflow-tooltip="column.show_overflow_tooltip"
                                :width="column.width"
                                :label="column.label")
                                template(slot-scope="scope")
                                    span(v-if="column.prop === 'operation'")
                                        IconButton(
                                            v-for="oper in operations"
                                            :key="oper.type"
                                            :type="oper.icon"
                                            :text="oper.title"
                                            @iconClick="handleOper(scope.row, oper.type)"
                                        )
                                    span(v-else-if="column.prop === 'created_at'") {{scope.row[column.prop] | FormatTime}}
                                    span(v-else) {{scope.row[column.prop]}}
</template>
<script>
/**
 * @description 编排管理页面，汇总显示编排模板数据
 * 申请应用服务、修改编排模板、删除编排模板按钮
 */
import Api from '@api'
import { mapActions } from 'vuex'

export default {
    data () {
        return {
            breadcrumbItems: [{ prop: '/blueprint', label: '编排管理' }],
            columns: [
                { prop: 'name', label: '编排名称', show_overflow_tooltip: true },
                { prop: 'service_code', label: '编排编码', show_overflow_tooltip: true },
                { prop: 'created_by_name', label: '创建人' },
                { prop: 'created_at', label: '创建时间' },
                { prop: 'operation', label: '操作' }
            ],
            operations: [
                { type: 'edit', icon: 'ucmp-icon-edit', title: '编辑' },
                { type: 'delete', icon: 'ucmp-icon-delete', title: '删除' },
                { type: 'deploy', icon: 'ucmp-icon-model-deploy', title: '立即部署' }
            ],
            blueprintData: [],
            originPagination: {
                offset: 1,
                limit: 20,
                count: 0,
                total: 0
            },
            advanceSwitch: false,
            filterItems: [{
                key: 'searchKey',
                label: '编排名称'
            }],
            checkedBlueprint: null,
            searchKey: '',
            isLoading: false
        }
    },

    methods: {
        handleOper (row, type) {
            if (type === 'edit') {
                this.$router.push('/orchestrate-app/' + row.service_code)
                return
            }
            if (type === 'delete') {
                this.$confirm('删除编排' + row.name + ',是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    Api.delete('getMetadata', { _code: 'blueprint/' + row.service_code }, true).then(
                        res => {
                            this.getBlueprints()
                            // 删除成功编排任务之后从元数据中也同步将其删除
                            this.setMetaData([])
                            // 获取 metadata列表信息
                            Api.get('getBasicMetadata', {}, true).then(
                                metas => {
                                    let metadata = metas.map(
                                        item => {
                                            return item.metadata
                                        }
                                    )
                                    this.setMetaData(metadata)
                                }
                            )
                            this.$message({
                                type: 'success',
                                message: '编排' + row.name + '删除成功'
                            })
                        }
                    )
                }).catch(() => {})
                return
            }
            if (type === 'deploy') {
                // 将部署操作的【打开弹窗】动作修改为【页面跳转】，取消弹窗操作
                this.$router.push({path: '/catalog/' + row.service_code, query: {type: 'blueprint-deploy'}})
            }
        },

        handleSizeChange (val) {
            this.originPagination.limit = val
            this.getBlueprints()
        },

        handleCurrentChange (val) {
            this.originPagination.offset = val
            this.getBlueprints()
        },

        getBlueprints () {
            const params = {_code: 'blueprint', offset: this.originPagination.offset, limit: this.originPagination.limit}
            if (this.searchKey) params.name = this.searchKey
            this.isLoading = true
            Api.get('getMetadata', params, true).then(
                res => {
                    this.isLoading = false
                    this.blueprintData = res.list
                    this.originPagination.total = res.total
                    this.originPagination.count = res.size
                }, () => {
                    this.isLoading = false
                }
            )
        },
        /**
         * @description 搜索
         */
        query (param) {
            this.originPagination.offset = 1
            this.searchKey = param.searchKey
            this.getBlueprints()
        },
        ...mapActions([
            'setMetaData'
        ])
    },

    computed: {
        pagination: {
            get () {
                return {
                    index: this.originPagination.offset,
                    size: this.originPagination.limit,
                    count: this.originPagination.count,
                    total: this.originPagination.total
                }
            },
            set (val) {
                this.originPagination.offset = val.index
            }
        }
    },

    created () {
        this.getBlueprints()
    }
}
</script>
<style lang="scss" scoped>

</style>

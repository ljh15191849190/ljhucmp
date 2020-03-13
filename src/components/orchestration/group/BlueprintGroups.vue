<template lang="pug">
    UcmpContainer(:breadcrumbItems="breadcrumbItems")
        div.full-container(slot="content")
            div.top-button-container
                el-button.default-button.creat-button(type="primary" size="small" icon="el-icon-plus" @click="$router.push('/blueprint-group/add')") 新建编排分层
            UcmpTableContainer(
                    :advance="advanceSwitch"
                    :filterItems="filterItems"
                    :pagination.sync="pagination"
                    @sizeChange="handleSizeChange"
                    @currentChange="handleCurrentChange"
                    searchPlaceholder="请输入编排分层名称进行搜索"
                    :submit="query")
                    div.full-height(slot="tableContainer")
                        el-table(:data="blueprintData" border)
                            el-table-column(
                                v-for="column in columns"
                                :type="column.type"
                                :prop="column.prop"
                                :key="column.prop"
                                :show-overflow-tooltip="column.show_overflow_tooltip"
                                :width="column.width"
                                :label="column.label"
                                v-loading="isLoading" element-loading-spinner="ucmp-icon-loading")
                                template(slot-scope="scope")
                                    span(v-if="column.prop === 'operation'")
                                        IconButton(
                                            v-for="oper in operations"
                                            :key="oper.type"
                                            :type="oper.icon"
                                            :text="oper.title"
                                            @iconClick="handleOper(scope.row, oper.type)"
                                        )
                                    span.color-picker-color.is-alpha(v-else-if="column.prop === 'fill' || column.prop === 'stroke'")
                                        span.inner(:style="{'background-color': scope.row.config.styles[column.prop] ? scope.row.config.styles[column.prop] : 'transparent'}")
                                        span.empty.el-icon-close(v-if="scope.row.config.styles[column.prop] === ''")
                                    span(v-else) {{scope.row[column.prop]}}
</template>
<script>
/**
 * @description 编排分层管理页面，汇总编排分层的数据，以表格展示
 * 提供修改、删除分层等操作按钮
 */
import Api from '@api'

export default {
    data () {
        return {
            breadcrumbItems: [{ prop: '/blueprint-group', label: '编排分层' }],
            columns: [
                { prop: 'name', label: '分层名称', show_overflow_tooltip: true },
                { prop: 'stroke', label: '分层边框颜色' },
                { prop: 'fill', label: '分层背景颜色' },
                { prop: 'operation', label: '操作' }
            ],
            operations: [
                { type: 'edit', icon: 'ucmp-icon-edit', title: '编辑' },
                { type: 'delete', icon: 'ucmp-icon-delete', title: '删除' }
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
                label: '分层名称'
            }],
            checkedBlueprint: null,
            searchKey: '',
            isLoading: false
        }
    },

    methods: {
        handleOper (row, type) {
            if (type === 'edit') {
                this.$router.push('/blueprint-group/' + row.id)
                return
            }
            if (type === 'delete') {
                this.$confirm('删除编排分层' + row.name + ',是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    Api.delete('blueprintGroups', { group_id: row.id }, true).then(
                        res => {
                            this.getBlueprintGroups()
                            this.$message({
                                type: 'success',
                                message: '编排分层' + row.name + '删除成功'
                            })
                        }
                    )
                }).catch(() => {})
            }
        },

        handleSizeChange (val) {
            this.originPagination.limit = val
            this.getBlueprintGroups()
        },

        handleCurrentChange (val) {
            this.originPagination.offset = val
            this.getBlueprintGroups()
        },

        getBlueprintGroups () {
            const params = {offset: this.originPagination.offset, limit: this.originPagination.limit}
            if (this.searchKey) params.name = this.searchKey

            this.isLoading = true
            Api.get('blueprintGroups', params, true).then(
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
            this.getBlueprintGroups()
        }
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
        this.getBlueprintGroups()
    }
}
</script>
<style lang="scss" scoped>
.color-picker-color {
    height: 20px;
    width: 20px;
    position: relative;
    display: block;
    box-sizing: border-box;
    border: 1px solid $fontTitleLight;
    border-radius: 2px;
    text-align: center;
    .inner {
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
    }
    .empty {
        font-size: 12px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate3d(-50%,-50%,0);
        color: $fontTitleLight;
    }
}
.is-alpha {
    background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAIAAADZF8uwAAAAGUlEQVQYV2M4gwH+YwCGIasIUwhT25BVBADtzYNYrHvv4gAAAABJRU5ErkJggg==);
}
.color-picker-icon {
    display: none;
    font-size: 12px;
    width: 100%;
    color: #fff;
    text-align: center;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate3d(-50%,-50%,0);
    &.active {
        display: inline-block;
    }
}
</style>

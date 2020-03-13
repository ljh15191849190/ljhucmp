<template lang="pug">
    UcmpTableContainer(
        :searchPlaceholder="filter.searchPlaceholder"
        :pagination.sync="pagination"
        @sizeChange="handleSizeChange"
        @currentChange="handleCurrentChange"
        :submit="searchNetwork"
    )
        div.full-height.padding-top(slot="tableContainer")
            el-table(:data="tableData" v-loading="isLoading" element-loading-spinner="ucmp-icon-loading" border)
                el-table-column(:prop="column.prop" v-for="column in columns" :key="column.prop" :label="column.label" :width="column.width")
                    template(slot-scope="scope")
                        span(v-if="column.prop !== 'family' && column.prop !== 'rir'") {{ scope.row[column.prop] }}
                        span(v-else-if="column.prop === 'family'") {{ 'IPv' + scope.row[column.prop] }}
                        span(v-else) {{scope.row.rir.name}}
        el-button.default-button(slot="filter-btns" type="primary" size="small") 查询
</template>

<script>
import Subnet from '@mock/subnet/subnet.mock'
import Api from '@api'
/**
 * @description 网段管理
 */
export default {
    name: 'SubnetList',
    data () {
        return {
            searchParams: {},
            originPagination: {
                offset: 0,
                limit: 20,
                total: 0
            },
            filter: {
                advanceSwitch: true,
                searchPlaceholder: '请输入网段'
            },
            formItems: Subnet.formItems,
            columns: Subnet.columns,
            tableData: [],
            isLoading: false
        }
    },
    methods: {
        /**
         * @description 默认每页查询条数发生变化
         */
        handleSizeChange (size) {
            this.originPagination.limit = size
            this.getNetworkList()
        },

        handleCurrentChange (index) {
            this.originPagination.offset = index - 1
            this.getNetworkList()
        },
        /**
         * @description 搜索网段
         * @param [param] 搜索对象
         */
        searchNetwork (param) {
            this.originPagination.offset = 0
            if (param.searchKey) {
                this.$set(param, 'q', param.searchKey)
                delete param.searchKey
            }
            this.searchParams = Object.assign({}, param)
            this.getNetworkList()
        },
        /**
         * @description 获取网段列表
         * @param [params] 搜索参数对象
         */
        getNetworkList (params) {
            let pageParam = { offset: this.originPagination.offset * this.originPagination.limit, limit: this.originPagination.limit }
            let resObj = Object.assign(pageParam, this.searchParams)
            this.isLoading = true
            Api.get('iaas_networks', resObj, false).then(
                res => {
                    this.isLoading = false
                    this.tableData = res.results
                    this.originPagination.total = res.count
                },
                () => {
                    this.isLoading = false
                }
            )
        }
    },
    created () {
        this.getNetworkList()
    },
    computed: {
        pagination: {
            get () {
                return {
                    index: this.originPagination.offset + 1,
                    size: this.originPagination.limit,
                    count: this.originPagination.count,
                    total: this.originPagination.total
                }
            },
            set (val) {
                this.originPagination.offset = val.index - 1
            }
        }
    }
}
</script>
<style lang="scss" scoped>
</style>

<template lang="pug">
    div.full-container(slot="content")
        UcmpTableContainer(
            :advance="advanceSwitch"
            :pagination.sync="pagination"
            :filterItems="filterPanelItems"
            :submit="serachRecyleList"
            @sizeChange="handleSizeChange"
            @currentChange="handleCurrentChange"
        )
            div.full-height(slot="tableContainer")
                ColumnFilter(
                    v-if="currentFilterItem && currentFilterItem.key"
                    :show.sync="showFilter[currentFilterItem.key]"
                    :filterItem="currentFilterItem"
                    :activedId="filterActived[currentFilterItem.key]"
                    :config="filterConfig[currentFilterItem.key]"
                    @headFilter="headFilter"
                    )
                el-table.recycle-table(
                    :data="tableData"
                    row-key="instance_id"
                    stripe 
                    border
                    v-loading="isLoading" 
                    element-loading-spinner="ucmp-icon-loading" 
                    @selection-change="handleSelectionChange" 
                    @header-click="headerClick")
                    el-table-column(:prop="column.prop" v-for="column in columns" :key="column.prop" :label="column.label" :width="column.width")
                        template(slot="header" slot-scope="scope")
                            span(:class="{'th-filter-checked': filterActived[scope.column.property]}") {{scope.column.label}}
                                i.ucmp-icon-filter-down.el-icon--right(v-if="headFilterKeys[scope.column.property]")
                        template(slot-scope="scope")
                            span(v-if="column.prop === 'recycle_at'") {{scope.row[column.prop] | timeFormat}}
                            el-tag(v-else-if="column.prop === 'resource_status'" :type="stateObj[scope.row.resource_status].type" size="mini") {{ stateObj[scope.row.resource_status].label }}
                            span(v-else) {{scope.row[column.prop]}}
</template>
<script>
/**
 * @description 回收站-已回收
 */
import Api from '@api'
import {mapGetters} from 'vuex'
import columnFilterMixin from '@mixins/columnFilter.mixin'
import { columns, filterItems } from '@mock/recycle/recycle.mock'

//状态
const states = [
    {type: 'info', prop: 'deleted', label: '已回收'},
    {type: 'info', prop: 'deleting', label: '删除中'},
    {type: 'warning', prop: 'approving', label: '审批中'},
    {type: 'danger', prop: 'waiting', label: '等待中'},
    {type: 'error', prop: 'failed', label: '删除失败'}
]

export default {
    name: 'RecycleBinList',
    mixins: [columnFilterMixin],
    data () {
        return {
            isLoading: true,
            tableData: [],
            columns: columns,
            states: states,
            searchParams: {},
            advanceSwitch: false,
            headFilterKeys: {instance_type: true},
            filterItems: filterItems,
            pagination: {
                index: 1,
                size: 20,
                total: 0
            },
            selectedRecycleList: [],
            filterConfig: {
                instance_type: {
                    prop: 'type',
                    label: 'name'
                }
            }
        }
    },
    created () {
        this.init()
    },
    methods: {
        /**
         * @description 初始化
         */
        init () {
            // 获取资源类型列表
            // this.getRecycleTypeList()
            // 获取回收站列表
            this.getRecycleList()
             // 获取资源类型列表（从接口中获取）
            this.getrecycleFilter()
            this.showFilter = {instance_type: false}
            this.filterActived = {instance_type: null}
        },
        getrecycleFilter () {
            let resObj = {deleted: true}
            Api.get('recycleFilter', resObj, true).then(
                res => {
                    if (res) {
                        res.forEach(item => {
                            item.name = item.name
                            item.type = item.service_code
                        })
                        this.filterItems[1].defaultOptions = res
                    }
                }
            )
        },
        
        /**
         * @description 表格每页显示条数更改
         * @param size 新的每页显示条数
         */
        handleSizeChange (size) {
            this.pagination.size = size
            this.getRecycleList()
        },
        /**
         * @description 表格页面跳转
         * @param index 跳转的页面
         */
        handleCurrentChange (index) {
            this.pagination.index = index
            this.getRecycleList()
        },
        /**
         * @description 查询点击事件
         * @param params 查询参数对象
         */
        serachRecyleList (params) {
            this.pagination.index = 1
            this.searchParams = Object.assign({}, params)
            this.getRecycleList()
        },
        handleSelectionChange (recycles) {
            this.selectedRecycleList = recycles
        },
        /**
         * @description 获取资源类型列表
         */
        getRecycleTypeList () {
            this.filterItems[1].defaultOptions = this.metadata.reduce((recycleTypeList, item) => {
                // 过滤掉没有删除动作的元数据
                if (item.normal_actions && item.normal_actions.delete && item.normal_actions.delete.enabled && item.normal_actions.delete.recycle) {
                    let recycleTypeItem = {
                        name: item.name,
                        type: item.service_code
                    }

                    recycleTypeList.push(recycleTypeItem)
                }
            
                return recycleTypeList
            }, [])
        },
        /**
         * @description 获取回收站列表
         */
        getRecycleList () {
            this.isLoading = true
            let pageParam = { id: this.templateType, offset: this.pagination.index, limit: this.pagination.size }
            let resObj = Object.assign(pageParam, this.searchParams)
            //recycleWaitBin recycleBin
            Api.get('recycleWaitBin', resObj, true).then(
                res => {
                    this.tableData = res.list || []
                    this.pagination.total = res.total || 0
                    this.isLoading = false
                },
                () => {
                    this.isLoading = false
                }
            )
        },
        headFilter (filterItem, value) {
            this.$set(this.filterActived, [this.currentFilterItem.key], value)
            if (!value || value === 'all')
                delete this.searchParams[this.currentFilterItem.key]
            else this.$set(this.searchParams, this.currentFilterItem.key, value)
            this.getRecycleList()
            this.showFilter[this.currentFilterItem.key] = false
            this.currentFilter = null
            this.currentFilterItem = null
        }
    },

    computed: {
        ...mapGetters([
            'metadata'
        ]),
        filterPanelItems () {
            return this.filterItems.filter(item => !item.query_condition || !item.query_condition.table_head)
        },
        selectedRecycleIds () {
            return this.selectedRecycleList.map(item => item.instance_id)
        },
        stateObj () {
            let rst = {}
            this.states.forEach(
                item => {
                    rst[item.prop] = {
                        type: item.type,
                        label: item.label
                    }
                }
            )
            return rst
        }
    },
    filters: {
        timeFormat (timestams) {
            let date = new Date(timestams)
            let year = date.getFullYear()
            let month = date.getMonth() + 1
            let day = date.getDate()
            let hours = date.getHours()
            let minu = date.getMinutes()
            let second = date.getSeconds()
            //判断是否满10
            let arr = [month, day, hours, minu, second]
            arr.forEach((item, index) => {
                arr[index] = item < 10 ? '0' + item : item
            })
            return year + '-' + arr[0] + '-' + arr[1] + ' ' + arr[2] + ':' + arr[3] + ':' + arr[4]
        }
    }
}
</script>
<style lang="scss" scoped>
.recycle-table {
    height: calc(100% - 40px);
}
.th-filter {
    position: absolute;
}
</style>

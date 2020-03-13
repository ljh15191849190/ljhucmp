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
                div.d-flex
                    el-button(type="default" size="small" @click="deleteRecycle(true)" :disabled="selectedRecycleList.length === 0") 还原
                    el-button(type="default" size="small" @click="deleteRecycle(false)" :disabled="selectedRecycleList.length === 0") 彻底删除
                ColumnFilter(
                    v-if="currentFilterItem && currentFilterItem.key"
                    :show.sync="showFilter[currentFilterItem.key]"
                    :filterItem="currentFilterItem"
                    :activedId="filterActived[currentFilterItem.key]"
                    :config="filterConfig[currentFilterItem.key]"
                    @headFilter="headFilter"
                    )
                el-table.recycle-table.margin-top(
                    :data="tableData"
                    stripe
                    lazy
                    border
                    :key="tableIndex"
                    v-loading="isLoading"
                    element-loading-spinner="ucmp-icon-loading"
                    @selection-change="handleSelectionChange"
                    @header-click="headerClick"
                    :load="loadChildren"
                    :tree-props="{hasChildren: 'is_blueprint'}"
                    row-key="instance_id"
                    )
                    el-table-column(type="selection" width="45" :selectable="selectable")
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
 * @description 回收站
 */
import Api from '@api'
import {mapGetters} from 'vuex'
import columnFilterMixin from '@mixins/columnFilter.mixin'
import { columns, filterItems } from '@mock/recycle/recycle.mock'

//状态
const states = [
    {type: 'success', prop: 'recycled', label: '待回收'},
    {type: 'info', prop: 'deleting', label: '删除中'},
    {type: 'warning', prop: 'approving', label: '审批中'},
    {type: 'danger', prop: 'waiting', label: '等待中'},
    {type: 'error', prop: 'failed', label: '删除失败'}
]
export default {
    name: 'RecycleWaitList',
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
            tableIndex: 0,
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
        selectable (row, index) {
            return !row.disable
        },
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
        // 服务名称（查询）
        getrecycleFilter () {
            let resObj = {deleted: false}
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
            this.tableIndex = ++this.tableIndex % Number.MAX_SAFE_INTEGER
            this.getRecycleList()
        },
        /**
         * @description 还原删除的资源
         * @param isRestore 是否是还原操作
         */
        deleteRecycle (isRestore) {
            let recyleNameList = this.selectedRecycleList.map(item => item.instance_name)
            let recyleNames = recyleNameList.join(',')
            let conformMsg = isRestore ? '确定还原选中的资源: ' + recyleNames + ' 吗?' : '确定彻底删除选中的资源: ' + recyleNames + ' 吗?'
            this.$confirm(conformMsg, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let resObj = {
                    type: isRestore ? 'restore' : 'delete',
                    instance_ids: this.selectedRecycleIds.join(',')
                }

                Api.delete('recycleBin', resObj, true).then(
                    res => {
                        //UCMP-1667【回收站】回收站彻底删除资源，提示信息需修改优化为“正在删除中，请稍后查询删除结果”
                        let successMsg = isRestore ? '还原操作成功!' : '正在删除中，请稍后查询删除结果!'
                        this.$message({
                            type: 'success',
                            message: successMsg
                        })
                        this.getRecycleList()
                    }
                )
            })
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
            Api.get('recycleBin', resObj, true).then(
                res => {
                    this.tableData = res.list
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
        },

        loadChildren (tree, treeNode, resolve) {
            Api.get('recycleBlueprintResources', {instance_id: tree.instance_id}, true).then(
                res => {
                    res.forEach(item => {
                        item.disable = true
                    })
                    resolve(res)
                }
            )
        }
    },
    computed: {
        ...mapGetters([
            'metadata'
        ]),
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
        },
        filterPanelItems () {
            return this.filterItems.filter(item => !item.query_condition || !item.query_condition.table_head)
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
</style>

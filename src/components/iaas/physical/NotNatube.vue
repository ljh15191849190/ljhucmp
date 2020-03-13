<template lang="pug">
    div.full-height
        UcmpTableContainer(
            :searchPlaceholder="filter.searchPlaceholder"
            :pagination.sync="pagination"
            :filterItems="filter"
            @sizeChange="handleSizeChange"
            @currentChange="handleCurrentChange"
            :submit="searchNetwork"
        )
            div.full-height(slot="tableContainer")
                div.d-flex.justify-content-between
                    div.d-flex
                        el-button.oper-icon-btn( size="mini" title="纳管" circle icon="ucmp-icon-donatube" @click="doNutube" :disabled="dutubeDisabled")
                    div.d-flex.align-items-center
                        DynamicTableCol(:columns.sync="columns" :serviceCode="serviceCode")
                        el-button.oper-icon-btn(@click="exportContent" size="mini" icon="ucmp-icon-download" title="导出")
                el-table.margin-top(style="width: 100%" :data="tableData" v-loading="isLoading" @selection-change="handleSelectionChange" element-loading-spinner="ucmp-icon-loading" border)
                    el-table-column(type="selection" width="45")
                    el-table-column(:prop="column.prop" v-for="column in columns" :key="column.prop" :label="column.label" :width="column.width" v-if="column.isShow")
                        template(slot='header' slot-scope="scope")
                            TableFilterHeader(@handleHeaderCommand="handleHeaderCommand" :column="column" :searchParams="searchParams")
                        template(slot-scope="scope")
                            a(v-if="column.prop === 'name'" href="javascript:;" @click="checkDetail(scope.row)") {{scope.row[column.prop]}}
                            span(v-else-if="column.prop === 'oob_ip'") {{ scope.row["oob"].oob_ip }}
                            span(v-else-if="column.prop === 'created_at'") {{ formatterTime(scope.row.created_at) }}
                            span(v-else-if="column.prop === 'type'") {{ typeObj[scope.row[column.prop]] }}
                            span(v-else-if="column.prop === 'power'") {{ stateObj[scope.row[column.prop]] }}
                            span(v-else-if="column.prop === 'os_status'") {{ osstateObj[scope.row[column.prop]] }}
                            span(v-else) {{scope.row[column.prop]}}
            el-button.default-button(slot="filter-btns" type="primary" size="small") 查询
        el-dialog(title="纳管物理机" v-if="phyVisible" :visible.sync="phyVisible" width="800px")        
            Newphysical(@closeDialog="closeDialog" @submitPhy="submitPhy" :selectRow="selectedInstances")
</template>

<script>
import Physical from '@mock/subnet/physical.mock'
import Newphysical from './Newphysical'
import TableFilterHeader from '@/components/common/TableFilterHeader'
import DynamicTableCol from '@/components/common/DynamicTableCol'
import Api from '@api'
import DateUtil from '@server/date-utils'
import FileSaver from 'file-saver'
/**
 * @description 网段管理
 */
// 过滤条件配置
const filterItems = [
    {
        label: '物理机名称',
        key: 'name',
        type: 'input'
    }, {
        label: 'SN',
        key: 'sn',
        type: 'input'
    }, {
        label: '制造商',
        key: 'company',
        type: 'input'
    }, {
        label: '型号',
        key: 'model',
        type: 'input'
    }, {
        label: '带外ip',
        key: 'oob_ip',
        type: 'input'
    }
]
export default {
    name: 'NotNatube',
    data () {
        return {
            selectedInstances: [],
            phyVisible: false,
            searchParams: {},
            originPagination: {
                offset: 0,
                limit: 20,
                total: 0
            },
            filter: filterItems,
            columns: Physical.notColumns,
            tableData: [],
            isLoading: false,
            dutubeDisabled: true
        }
    },
    methods: {
        getSystemsList () {
            let obj = {idFiled: 'system_id', nameFiled: 'system_name'}
            Api.get('physic_getSystem', obj, true).then(
                res => {
                    this.columns[5].filters = res
                }
            )
        },
        /**
         * @description 初始化获取云厂商列表
         */
        getProviderList () {
            Api.get('physic_provider', {provider_code: 'cloudboot', service_code: 'baremetal'}, true).then(
                res => {
                    if (res) 
                        this.columns[16].filters = res
                }
            )
        },
        handleHeaderCommand (filterParam) {
            this.searchParams = {...this.searchParams, ...filterParam}
            this.pagination.index = 1
            this.getNetworkList()
        },
        checkDetail (row) {
            let param = {...row, ...{id: row.bare_id}}
            this.$router.push({ name: 'physicalDetail', params: param })
            // this.$router.push({path: '/physical/physicalDetail/' + row.bare_id})
        },
        doNutube () {
            if (this.selectedInstances.length !== 1) {
                this.$message({
                        type: 'warn',
                        title: '警告',
                        message: '请选择一个实例'
                    })
            } else 
                this.phyVisible = true
        },
        // 表格选择列勾选变化处理(操作按钮的禁用是否有关)
        handleSelectionChange (val) {
            this.selectedInstances = val
            if (this.selectedInstances.length > 0) 
                this.dutubeDisabled = false
            else 
                this.dutubeDisabled = true
        },
         closeDialog () {
            this.phyVisible = false
        },
        /**
         * @description 创建物理机
         */
        submitPhy () {
            this.phyVisible = false
            this.$router.push({path: '/physical/notnatube', query: {uuid: new Date().getTime()}})
        },
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
            let pageParam = { status: 'unmanaged', pageNum: this.pagination.index, pageSize: this.pagination.size }
            let resObj = Object.assign(pageParam, this.searchParams)
            this.isLoading = true
            Api.get('physic_doList', resObj, false).then(
                res => {
                    this.isLoading = false
                    res.list.forEach(item => {
                        if (item.oob === null)  
                            item.oob = {}
                        else if (item.vnc === null) 
                            item.vnc = {}
                    })
                    this.tableData = res.list
                },
                () => {
                    this.isLoading = false
                }
            )
        },
        formatterTime (time) {
            return DateUtil.formate(new Date(time))
        },
        // 下载
        exportContent () {
            let param = Object.assign({}, {query: this.searchParams}, {status: 'unmanaged'}, {metaDatas: Physical.notColumns})
            Api.post('physic_downList', param, true, {responseType: 'blob'}).then(
                res => {
                    let blob = new Blob([res], { type: 'application/vnd.ms-excel' })
                    FileSaver.saveAs(blob, '物理机.xlsx')
                    this.$notify({
                        type: 'success',
                        title: '成功',
                        message: '导出成功'
                    })
                }
            )
        }
    },
    created () {
        this.getNetworkList()
        this.getProviderList()
        this.getSystemsList()
    },
    computed: {
        serviceCode () {
            return this.$route.name
        },
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
        },
        stateObj () {
            const configIcon = {
                start: '开机',
                stop: '关机',
                starting: '开机中',
                stopping: '关机中',
                rebooting: '重启中'
          }
            return configIcon
        },
        osstateObj () {
            const configIcon = {
                success: '安装成功',
                failure: '安装失败',
                running: '正在安装'
            }
            return configIcon
        },
        typeObj () {
            const configIcon = {
                metal: '裸物理机',
                virtual: '虚拟服务器'
          }
            return configIcon
        }
    },
    components: {
         Newphysical, TableFilterHeader, DynamicTableCol
    }
}
</script>
<style lang="scss" scoped>
    .el-table{
        height: calc(100% - 35px);
    }
</style>

<template lang="pug">
    div.full-container.resource-use-coantainer
        div.head-panel
            div.filter-panel
                div.filter-intm
                    SearchInputOrganization(v-model="selectedOrgs")
                el-select.margin-right(size="small" clearable v-model="searchParams.owner" :disabled="!selectedOrgs" filterable :placeholder="!selectedOrgs ? '请先选择组织机构' : '应用'"  collapse-tags)
                    el-option(v-for="(item, index) in appList" :key="index" :label="`${item.app_name}(${item.short})`" 
                    :value="item.app_id")
                el-input.filter-intm(v-model="searchParams.startIp" placeholder="请输入IP地址" size="small" clearable)
                span.range 至
                el-input.filter-intm(v-model="searchParams.endIp" placeholder="请输入IP地址" size="small" clearable)
                el-date-picker.picker-width.margin-right(size="small" v-model="dateRange" type="daterange" :value-format="dateFormat" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期")
                el-button.default-button(type="primary" size="small" @click="query") 查询
            el-button.oper-icon-btn(@click="exportReport" size="mini" icon="ucmp-icon-download" title="导出")
        div.analysis-table-container
            UcmpTableContainer(
                :pagination="pagination"
                :advance="advanceSwitch"
                @sizeChange="handleSizeChange" 
                @currentChange="handleCurrentChange"
            )
                div.full-height(slot="tableContainer")
                    el-table.el-table--summary(:data="tableData" stripe v-loading="isLoading" element-loading-spinner="ucmp-icon-loading" border)
                        el-table-column(v-for="column in columns" :prop="column.prop" :label="column.label" :key="column.prop" :width="column.width")
                            template(slot='header' slot-scope="scope")
                                TableFilterHeader(@handleHeaderCommand="handleHeaderCommand" :column="column" :searchParams="searchParams")
                            template(slot-scope="scope")
                                span(v-if="column.prop === 'created_at'") {{ formatterTime(scope.row[column.prop]) }}
                                span.ucmp-icon(v-else-if="column.prop === 'os_icon'" :class="scope.row[column.prop]")
                                el-tag(v-else-if="(column.prop === 'status')" :color="stateObj[scope.row[column.prop]].color" size="mini") 
                                    span.tag-color {{ stateObj[scope.row[column.prop]].label }}
                                span(v-else-if="column.prop === 'owner_name'") {{(scope.row['owner_type'] === 'app' ? scope.row[column.prop] : '--')}}
                                span(v-else) {{scope.row[column.prop]}}
</template>
<script>
/**
 * @description 资源使用统计
 */
import Api from '@api'
import FileSaver from 'file-saver'
import DateUtil from '@server/date-utils'
import TableFilterHeader from '@/components/common/TableFilterHeader'
import SearchInputOrganization from '@common/SearchInputOrganization'
const OsTypes = [
    {
        'id': 'ucmp-icon-os-debian',
        'name': 'Debian'
    },
    {
        'id': 'ucmp-icon-os-ubuntu',
        'name': 'Ubuntu'
    },
    {
        'id': 'ucmp-icon-os-suse',
        'name': 'Suse'
    },
    {
        'id': 'ucmp-icon-os-centos',
        'name': 'Centos'
    },
    {
        'id': 'ucmp-icon-os-windows',
        'name': 'Windows'
    }
]
export default {
    name: 'ResourceUseAnalysis',
    components: { TableFilterHeader, SearchInputOrganization },
    data () {
        return {
            isLoading: false,
            advanceSwitch: false,
            selectedOrgs: null,
            dateRange: null,
            searchParams: {
                orgId: '',
                owner: '',
                startIp: '',
                endIp: '',
                startDate: '',
                endDate: ''
            },
            dateFormat: 'yyyy-MM-dd',
            appList: [],
            tableData: [],
            pagination: { index: 1, total: 1, size: 20 },
            columns: [
                { prop: 'org_name', label: '组织机构', link: true },
                { prop: 'owner_name', label: '应用', link: true },
                { prop: 'instance_name', label: '云主机名称', fixed: true },
                { prop: 'ip', label: 'IP地址' },
                { prop: 'status', label: '状态' },
                {
                    prop: 'os_icon',
                    label: '操作系统',
                    filterKey: 'osIcon',
                    filters: OsTypes,
                    filter_link: {
                        label_field: 'name',
                        value_field: 'id'
                    }
                },
                { prop: 'cpu_core_count', label: 'CPU(核)' },
                { prop: 'cpu_use', label: 'CPU使用率(%)' },
                { prop: 'memory_size', label: '内存' },
                { prop: 'memory_use', label: '内存使用率(%)' },
                { prop: 'disk_total', label: '磁盘' },
                { prop: 'disk_use', label: '磁盘使用率(%)' },
                { prop: 'created_at', label: '创建时间' },
                { prop: 'user', label: '负责人' },
                { prop: 'phone', label: '联系方式' }
            ]
        }
    },
    created () {
        this.getResouceList()
    },
    methods: {
        handleHeaderCommand (filterParam) {
            this.handleSearchParam()
            this.searchParams = {...this.searchParams, ...filterParam}
            this.pagination.index = 1
            this.getResouceList() 
        },
        /**
         * @description 格式化时间显示
         * @param time  时间戳
         */
        formatterTime (time) {
            if (!time) return ''
            return DateUtil.formate(new Date(time))
        },
        /**
         * @description 每页查询条数变化
         * @param size  页码大小
         */
        handleSizeChange (size) {
            this.pagination.size = size
            this.getResouceList()
        },
        /**
         * @description 页码变化
         * @param index 页码索引
         */
        handleCurrentChange (index) {
            this.pagination.index = index
            this.getResouceList()
        },
        /**
         * @description 组织机构获取应用
         */
        getBusinessListByOrg (newVal) {
            if (!newVal)
                this.searchParams.owner = ''
            let org_id = newVal ? newVal.org_id : ''
            if (!org_id) return
            let resObj = {org_id: org_id, page: '1', limit: '99999'}
            Api.get('businessListByOrg', resObj, true).then(
                res => {
                   this.appList = res.data.apps
                }
            )
        },
        /**
         * @description 获取资源列表
         */
        getResouceList () {
            let pageParam = { offset: this.pagination.index, limit: this.pagination.size }
            let resObj = Object.assign(pageParam, this.searchParams)
            this.isLoading = true
            Api.get('resource_use_analyze', resObj, true).then(
                res => {
                    this.isLoading = false
                    this.tableData = res.list
                    this.pagination.total = res.total
                }, () => {
                    this.isLoading = false
                }
            )
        },
        handleSearchParam () {
            // 处理日期参数
            if (this.dateRange) {
                this.searchParams.startDate = this.dateRange[0]
                this.searchParams.endDate = this.dateRange[1]
            } else {
                delete this.searchParams.startDate
                delete this.searchParams.endDate
            }
            // 处理组织机构参数
            if (this.selectedOrgs) 
                this.searchParams.orgId = this.selectedOrgs.org_id
            else 
                delete this.searchParams.orgId
        },
        /**
         * @description 查询
         */
        query () {
            this.handleSearchParam()
            this.getResouceList()
        },
        exportReport () {
            this.handleSearchParam()
            Api.get('expoort_resource_use', this.searchParams, true, 'blob').then(res => {
                let blob = new Blob([res], {type: 'application/vnd.ms-excel'})
                FileSaver.saveAs(blob, '资源使用统计.xlsx')
                this.$notify({
                    type: 'success',
                    title: '成功',
                    message: '导出成功'
                })
            })
        }
    },
    computed: {
        stateObj () {
            let rst = {}
            const states = [
                {color: '#61c359', type: 'success', prop: 'running', label: '运行中'},
                {color: '#ffaa00', type: 'detail', prop: 'stopped', label: '已停止'},
                {color: '#0198e4', type: 'success', prop: 'starting', label: '启动中'},
                {color: '#8bd8fe', type: 'success', prop: 'stopping', label: '停止中'},
                {color: '#006699', type: 'success', prop: 'rebooting', label: '重启中'},
                {color: '#cccccc', type: 'detail', prop: 'not_exist', label: '已销毁'},
                {color: '#e64451', type: 'error', prop: 'error', label: '错误'},
                {color: '#707993', type: 'primary', prop: 'unknown', label: '未知'}
            ]
            states.forEach(
                item => {
                    rst[item.prop] = {
                        label: item.label,
                        color: item.color
                    }
                }
            )
            return rst
        }
    },
    watch: {
        selectedOrgs (newVal) {
            this.getBusinessListByOrg(newVal)
        }
    }
}
</script>
<style lang="scss" scoped>
.head-panel {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.filter-panel {
    display: flex;
    align-items: center;
    .filter-intm {
        max-width: 150px;
        margin-right: 16px;
    }
    .range {
        padding-right: 10px;
    }
}
.analysis-table-container {
    height: calc(100% - 40px);
}
.tag-color {
    color: #ffffff;
}
.ucmp-icon {
    font-size: 24px;
    line-height: 1;
}
</style>

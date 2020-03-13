<template lang="pug">
    div.full-height
        UcmpTableContainer(
            :pagination.sync="pagination"
            :filterItems="filter"
            @sizeChange="handleSizeChange"
            @currentChange="handleCurrentChange"
            :submit="searchDo"
        )
            div.full-height(slot="tableContainer")
                div.d-flex.justify-content-between
                    div.d-flex
                        OperatorPanel.margin-left(
                            ref="operatorRef"
                            :basicBtns="allActions.iconGroup"
                            :advancedBtns="allActions.moreGroup"
                            :instances="selectedInstances"
                            @operationClick="operationClick"
                        )
                        // OperatorPanel(
                        //     ref="operatorRef"
                        //     :basicBtns="allActions.iconGroup"
                        //     :advancedBtns="allActions.moreGroup"
                        //     :instances="selectedInstances"
                        //     :serviceCode="serviceCode"
                        //     checkedMetadata={}
                        //     @operatorSuccess="operationClick"
                        // )
                    div.d-flex.align-items-center
                        DynamicTableCol(:columns.sync="columns" :serviceCode="serviceCode")
                        el-button.oper-icon-btn(@click="exportContent" size="mini" icon="ucmp-icon-download" title="导出")
                el-table.margin-top.panel-table-container(style="width: 100%" :data="tableData" @selection-change="handleSelectionChange" highlight-current-row @current-change="handleTableCurrentChange" v-loading="isLoading" element-loading-spinner="ucmp-icon-loading" border)
                    el-table-column(type="selection" width="45")
                    el-table-column(:prop="column.prop" :width="column.width" v-for="column in columns" :key="column.prop" :label="column.label" v-if="column.isShow")
                        template(slot='header' slot-scope="scope")
                            TableFilterHeader(@handleHeaderCommand="handleHeaderCommand" :column="column" :searchParams="searchParams")
                        template(slot-scope="scope")
                            a(v-if="column.prop === 'name'" href="javascript:;" @click="checkDetail(scope.row)") {{scope.row[column.prop]}}
                            span(v-else-if="column.prop === 'oob_ip'") {{ scope.row["oob"].oob_ip }}
                            span(v-else-if="column.prop === 'created_at'||column.prop === 'expired_at'") {{ formatterTime(scope.row[column.prop]) }}
                            span(v-else-if="column.prop === 'power'") {{ stateObj[scope.row[column.prop]] }}
                            span(v-else-if="column.prop === 'type'") {{ typeObj[scope.row[column.prop]] }}
                            span(v-else-if="column.prop === 'os_status'") {{ osstateObj[scope.row[column.prop]] }}
                            span(v-else) {{ scope.row[column.prop] }}
            el-button.default-button(slot="filter-btns" type="primary" size="small") 查询
        el-dialog(title="修改物理机" v-if="phyVisible" :visible.sync="phyVisible" width="800px")        
            Newphysical(@closeDialog="closeDialog" @submitPhy="submitPhy" :selectRow="selectedInstances")
</template>
<script>
import Api from '@api'
import DateUtil from '@server/date-utils'
import Physical from '@mock/subnet/physical.mock'
import OperMixin from '@mixins/operatorLog.mixin'
// import OperatorPanel from '@/components/console/OperatorPanel'
import OperatorPanel from '@/components/common/panels/OperatorPanel'
import DynamicTableCol from '@/components/common/DynamicTableCol'
import TableFilterHeader from '@/components/common/TableFilterHeader'
import Newphysical from './Newphysical'
import FileSaver from 'file-saver'

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
        label: '责任人',
        key: 'user_name',
        type: 'input'
    }, {
        label: '带外ip',
        key: 'oob_ip',
        type: 'input'
    }, {
        label: '操作系统IP',
        key: 'ip',
        type: 'input'
    }
]
export default {
    mixins: [OperMixin],
    props: ['visible'],
    name: 'DoNatube',
    data () {
        return {
            phyVisible: false,
            allActions: {
                iconGroup: Physical.allActions.iconGroup,
                moreGroup: Physical.allActions.moreGroup
            },
            searchParams: {},
            checkedIp: null,
            pagination: {
                index: 1,
                size: 20,
                total: 0
            },
            filter: filterItems,
            states: Physical.ipStates,
            columns: Physical.doColumns,
            tableData: [],
            isLoading: false,
            selectedInstances: []
        }
    },
    computed: {
        serviceCode () {
            return this.$route.name
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
        typeObj () {
            const configIcon = {
                metal: '裸物理机',
                virtual: '虚拟服务器'
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
        }
    },
    methods: {
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
        getSystemsList () {
            let obj = {idFiled: 'system_id', nameFiled: 'system_name'}
            Api.get('physic_getSystem', obj, true).then(
                res => {
                    this.columns[5].filters = res
                }
            )
        },
        checkDetail (row) {
            let param = {...row, ...{id: row.bare_id}, ...{donatube: 'donatube'}}
            this.$router.push({ name: 'physicalDetail', params: param })
            // this.$router.push({path: '/physical/physicalDetail/' + row.bare_id})
        },
                /**
         * @description 关闭对话框
         */
        closeDialog () {
            this.phyVisible = false
        },
        /**
         * @description 创建物理机
         */
        submitPhy () {
            this.phyVisible = false
            this.$router.push({path: '/physical/donatube', query: {uuid: new Date().getTime()}})
        },
        handleHeaderCommand (filterParam) {
            this.searchParams = {...this.searchParams, ...filterParam}
            this.pagination.index = 1
            this.getIpList()
        },
        // 下载
        exportContent () {
            let columns = []
            this.columns.forEach(item => {
                columns.push(item.prop)
            })
            let param = Object.assign({}, {query: this.searchParams}, {status: 'managed'}, {metaDatas: Physical.doColumns})
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
        },

        operationClick (btn, self) {
            // console.log(btn, self)
            // console.log(this.selectedInstances)
            if (btn.name === 'modify') {
                if (this.selectedInstances.length > 1) {
                    this.$message({
                        type: 'warn',
                        title: '警告',
                        message: '每次操作只能修改一个实例'
                    })
                } else 
                    this.phyVisible = true
            } else {
                let instanceNames = []
                let instanceIds = []
                this.selectedInstances.forEach(instance => {
                    instanceNames.push(instance.name)
                    instanceIds.push(instance.bare_id)
                })
                let msg_tip = `确定${btn.label}${instanceNames.join(',')}吗？`
                this.$confirm(msg_tip, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(
                    () => {
                        let params = {}
                        if (btn.name === 'console') {
                            params = {
                                id: instanceIds.join(','),
                                target_type: 'physical'
                            }
                        } else {
                            params = {
                                bareId: instanceIds.join(',') 
                            }
                        }
                        Api[btn.endpoint.method.toLowerCase()](btn.endpoint.url, params, true).then(res => {
                            if (btn.name === 'console') 
                                window.open(res.uri)
                            this.getIpList()
                        }).catch(() => {})
                    }
                ).catch(() => {})
            }
        },
                // 表格选择列勾选变化处理(操作按钮的禁用是否有关)
        handleSelectionChange (val) {
            this.selectedInstances = val
        },
        handleTableCurrentChange (val) {
            this.checkedIp = val
        },
        /**
         * @description 默认每页查询条数发生变化
         */
        handleSizeChange (size) {
            this.pagination.size = size
            this.getIpList()
        },
        handleCurrentChange (index) {
            this.pagination.index = index
            this.getIpList()
        },
        /**
         * @description 搜索
         * @param [param] 搜索对象
         */
        searchDo (param) {
            this.pagination.index = 1
            this.searchParams = Object.assign({}, param)
            this.getIpList()
        },
        /**
         * @description 获取列表
         */
        getIpList () {
            let pageParam = { status: 'managed', pageNum: this.pagination.index, pageSize: this.pagination.size }
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
            if (time) 
                return DateUtil.formate(new Date(time))
        }
    },

    created () {
        this.getIpList()
        this.getProviderList()
        this.getSystemsList()
    },
    components: {
        OperatorPanel, DynamicTableCol, TableFilterHeader, Newphysical
    }
}
</script>
<style lang="scss" scoped>
.state-panel {
    margin-left: 30px;
}
.demo-table-expand {
    font-size: 0;
}
.demo-table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 33%;
}
.panel-table-container {
    height: calc(100% - 37px);
}
</style>

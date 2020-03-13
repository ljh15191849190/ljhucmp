<template lang="pug">
    UcmpContainer(:breadcrumbItems="breadcrumbItems")
        div.full-container(slot="content")
            div.top-button-container
                el-button.default-button.creat-button(type="primary" size="small" icon="el-icon-plus" @click="addCostRule") 添加策略
            UcmpTableContainer(
                :pagination="pagination"
                :advance="advanceSwitch"
                :filterItems="filterItems"
                @sizeChange="handleSizeChange" @currentChange="handleCurrentChange"
                :submit="handleSearch"
            )
                div.full-height(slot="tableContainer")
                    div.d-flex.justify-content-end.table-top-pane
                        div.billing-container
                            div.upload-pane
                                div.upload-desc 仅支持上传xml文件
                                div.upload
                                    el-upload(
                                        action="/billing3/rule"
                                        :headers="billRuleHearder"
                                        accept="text/*"
                                        :multiple="false"
                                        :limit="1"
                                        :show-file-list="false"
                                        :before-upload="beforeUpload"
                                        :on-error="uploadError"
                                        :on-success="uploadSuccess"
                                    )
                                        el-tooltip(content="上传规则" placement="bottom")
                                            el-button.oper-icon-btn(size="small" icon="ucmp-icon-upload")
                                el-tooltip(content="下载规则" placement="bottom")
                                    el-button.oper-icon-btn.margin-right(size="small" @click="downLoad" icon="ucmp-icon-download")
                                el-tooltip(content="设置结算时间" placement="bottom")
                                    el-popover(width="250" trigger="click")
                                        div.time-pane
                                            div.title 结算时间设置
                                            div.time {{priceTimeTxt}}
                                            div.time-select
                                                el-time-picker(v-model="priceTime" @change="setPriceTime" :picker-options="{ selectableRange: '00:00:00 - 23:59:59' }" placeholder="选择时间" )
                                            div.desc 此设置为前一日系统结算日期
                                        el-button.oper-icon-btn(size="small" slot="reference" icon="ucmp-icon-cost-set")
                    el-table.panel-table-container(:data="tableData" stripe v-loading="isLoading" element-loading-spinner="ucmp-icon-loading" border)
                        el-table-column(v-for="column in columns" :prop="column.prop" :label="column.label" :key="column.prop" :width="column.width")
                            template(slot='header' slot-scope="scope")
                                TableFilterHeader(@handleHeaderCommand="handleHeaderCommand" :column="column" :searchParams="searchParams")
                            template(slot-scope="scope")
                                span(v-if="column.prop === 'code'") {{ formatterCode(scope.row[column.prop]) }}
                                span(v-else-if="column.prop === 'durationCode'") {{ formatterDuration(scope.row[column.prop]) }}
                                span(v-else-if="column.prop === 'type'") {{ formatterType(scope.row[column.prop]) }}
                                span(v-else) {{scope.row[column.prop]}}
                        el-table-column(label="操作")
                            template(slot-scope="scope")
                                Icon-Button(v-for="oper in operations" :key="oper.prop" :type="oper.type" @iconClick="handleOpration" :args="{id: oper.prop, row: scope.row}" :text="oper.label")
</template>
<script>
/**
 * @description 计费策略-列表
 */
import Api from '@api'
import {mapGetters} from 'vuex'
import DateUtil from '@server/date-utils'
import FileSaver from 'file-saver'
import {BillType, BillPeriod} from '@server/ConstParams'
import TableFilterHeader from '@/components/common/TableFilterHeader'
export default {
    name: 'CostRuleList',
    components: {TableFilterHeader},
    data () {
        return {
            tableData: [],
            isLoading: false,
            searchParams: {},
            advanceSwitch: false,
            serviceDefines: [],
            priceTime: '',
            priceTimeTxt: '',
            billRuleHearder: {},
            breadcrumbItems: [
                { prop: '', label: '计费策略' }
            ],
            pagination: { index: 1, total: 1, size: 20 },
            filterItems: [
                { label: '计费策略名称', key: 'strategyName' }
            ],
            operations: [
                { prop: 'edit', label: '编辑', type: 'ucmp-icon-edit' },
                { prop: 'delete', label: '删除', type: 'ucmp-icon-delete' }
            ],
            columns: [
                { prop: 'strategyName', label: '策略名称' },
                { 
                    prop: 'code', 
                    label: '服务类型', 
                    filterKey: 'code',
                    filters: [],
                    filter_link: {
                        link_url: 'billingServices',
                        label_field: 'name',
                        value_field: 'service_code'
                    } 
                },
                { prop: 'durationCode', label: '计费周期' },
                { 
                    prop: 'type', 
                    label: '计费方式', 
                    filterKey: 'type',
                    filters: BillType,
                    filter_link: {
                        label_field: 'name',
                        value_field: 'id'
                    } 
                }
            ]
        }
    },
    methods: {
        init () {
            this.initCostMgmt()
            this.getProvideDefine()
            this.getCostRuleList()
        },
        /**
         * @description 设置计费配置
         */
        initCostMgmt () {
            //设置表单上传token
            let token = localStorage.getItem('authenticationToken')
            if (token)
                this.billRuleHearder['X-Subject-Token'] = token
            Api.get('priceTime', {}, true).then(
                res => {
                    this.priceTimeTxt = res.time
                    let tempArr = this.priceTimeTxt.split(':')
                    this.priceTime = new Date(2018, 8, 8, tempArr[0], tempArr[1], tempArr[2])
                }
            )
        },
        /**
         * @description 添加计费策略
         */
        addCostRule () {
            this.$router.push('/cost-rule/add')
        },
        /**
         * @description 初始化获取云厂商列表
         */
        getProviderList () {
            Api.get('provider', {}, true).then(
                res => {
                    this.columns[2].filters = res = res.list
                }
            )
        },
        /**
         * @description 获取所有计费的服务
         */
        getProvideDefine () {
            Api.get('billingServices', {}, true).then(
                res => {
                    this.serviceDefines = res
                }
            )
        },
        /**
         * @description 获取配置计费策略列表
         */
        getCostRuleList () {
            let pageParam = { offset: this.pagination.index, limit: this.pagination.size }
            let resObj = Object.assign(pageParam, this.searchParams)
            this.isLoading = true
            Api.get('billingPrice', resObj, true).then(
                res => {
                    this.isLoading = false
                    this.tableData = res.list
                    this.pagination.total = res.total
                }, () => {
                    this.isLoading = false
                }
            )
        },
        /**
         * @description 按钮操作
         * @param obj 
         */
        handleOpration (obj) {
            if (obj.id === 'edit')
                this.editCostRule(obj.row)
            else
                this.deleteCostRule(obj.row)
        }, 
        /**
         * @description  编辑计费策略
         * @params rowObj  当前行数据
         */ 
        editCostRule (rowObj) {
            this.$router.push(`/cost-rule/${rowObj.id}`)
        },
        /**
         * @description 删除计费策略
         * @params rowObj 当前行数据
         */
        deleteCostRule (rowObj) {
            this.$confirm(`删除计费策略: ${rowObj.strategyName}, 是否继续?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                Api.delete('billingPrice', {id: rowObj.id}, true).then(
                    res => {
                        this.$message({
                            type: 'success',
                            message: '删除操作成功!'
                        })
                        this.searchParams = {}
                        this.getCostRuleList()
                    }
                )
            }).catch(() => {
            })
        },    
        /**
         * @description 每页查询条数变化
         * @param size  页码大小
         */
        handleSearch (param) {
            this.pagination.index = 1
            this.searchParams = Object.assign({}, param)
            this.getCostRuleList()
        },
        handleHeaderCommand (filterParam) {
            this.searchParams = {...this.searchParams, ...filterParam}
            this.pagination.index = 1
            this.getCostRuleList()
        },
        /**
         * @description 每页查询条数变化
         * @param size  页码大小
         */
        handleSizeChange (size) {
            this.pagination.size = size
            this.getCostRuleList()
        },
        /**
         * @description 页码变化
         * @param index 页码索引
         */
        handleCurrentChange (index) {
            this.pagination.index = index
            this.getCostRuleList()
        },
        /**
         * @description 格式化服务名称显示
         * @param code  服务code
         */
        formatterCode (code) {
            let serviceItem = this.serviceDefines.find(item => item.service_code === code)
            return serviceItem && serviceItem.name ? serviceItem.name : ''
        },
        formatterDuration (duration) {
            return BillPeriod[duration] || '--'
        },
        formatterType (type) {
            let typeItem = BillType.find(item => item.id === type)
            return typeItem ? typeItem.name : '--'
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
         * @description 上传文件钩子函数
         */
        beforeUpload (file) {
            if (!/\.(xml)$/.test(file.name)) {
                this.$message({
                    type: 'warning',
                    message: '仅支持上传xml文件!'
                })
                return false
            }

            return true
        },
        /**
         * @description 上传失败
         */
        uploadError () {
            this.$message({
                type: 'success',
                message: '上传失败, 请检查上传文件后重新上传!'
            })
        },
        /**
         * @description 上传成功
         */
        uploadSuccess () {
            this.$message({
                type: 'success',
                message: '上传成功!'
            })
        },
        /**
         * @description 下载计费策略
         */
        downLoad () {
            //UCMP-555 【运营管理】计费策略中，已经有保存好的计费规则，下载规则的时候，下载出来的文件是空的
            Api.get('priceRule', {name: 'cost'}, true, 'blob').then(
                res => {
                    let blob = new Blob([res], { type: 'application/octet-stream' })
                    FileSaver.saveAs(blob, 'costRule.xml')
                }
            )
        },
        /**
         * @description 设置计费结算时间
         */
        setPriceTime () {
            let date = new Date(this.priceTime)
            let hour = date.getHours()
            hour = hour < 10 ? '0' + hour : hour
            let minitue = date.getMinutes()
            minitue = minitue < 10 ? '0' + minitue : minitue
            let second = date.getSeconds()
            second = second < 10 ? '0' + second : second
            this.priceTimeTxt = hour + ':' + minitue + ':' + second
            Api.post('priceTime', { time: this.priceTimeTxt }, true).then(
                res => {
                    this.$message({
                        type: 'success',
                        message: '设置成功'
                    })
                }
            )
        }
    },
    created () {
        this.init()
    },
    computed: {
        ...mapGetters([
            'metadata'
        ])
    }
}
</script>
<style lang="scss" scoped>
.table-top-pane {
    position: absolute;
    top: 50px;
    right: 20px;
}
</style>

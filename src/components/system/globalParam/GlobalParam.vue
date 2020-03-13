<template lang="pug">
    UcmpContainer(:breadcrumbItems="breadcrumbItems")
        div.full-container(slot="content")
            UcmpTableContainer(
                :pagination="pagination"
                :advance="advanceSwitch"
                :filterItems="filterItems"
                @sizeChange="handleSizeChange" @currentChange="handleCurrentChange"
                :submit="handleSearch"
            )
                div.full-height(slot="tableContainer")
                    el-table.panel-table-container(:data="tableData" v-loading="isLoading" element-loading-spinner="ucmp-icon-loading")
                        el-table-column(type="index" width="50" label="序列")
                        el-table-column(v-for="column in columns" :prop="column.prop" :label="column.label" :key="column.prop" :width="column.width")
                            template(slot='header' slot-scope="scope")
                                TableFilterHeader(@handleHeaderCommand="handleHeaderCommand" :column="column" :searchParams="searchParams")
                            template(slot-scope="scope")
                                template(v-if="column.prop === 'param'" )
                                    div(v-for="displayItem in scope.row.defaultValues" :key="displayItem.key")
                                        span(v-if="isShowdisplayItem(scope.row, displayItem.key)")
                                            span(v-if="scope.row.defaultValues.length > 1") {{displayItem.label}}: 
                                            span {{displayItem.value}}
                                span(v-else) {{scope.row[column.prop]}}
                        el-table-column(label="操作" width="100" type="expand")
                            template(slot-scope="scope")
                                div.global-param-pane
                                    GlobalParamForm(:formItems="transformParam(scope.row)"
                                    :formData.sync="scope.row.formData"
                                    :display.sync="scope.row.displays"
                                    :dictCode="scope.row.dictCode")
                                    el-button(type="warning" size="small" @click="save(scope.row)") 保存
</template>
<script>
/**
 * @description 全局参数
 */
import Api from '@api'
import TableFilterHeader from '@/components/common/TableFilterHeader'
import GlobalParamForm from './GlobalParamForm'
import {mapActions, mapGetters} from 'vuex'
export default {
    name: 'GlobalParam',
    $_veeValidate: {
        validator: 'new'
    },
    components: { TableFilterHeader, GlobalParamForm },
    data () {
        return {
            states: [],
            tableData: [],
            isLoading: false,
            searchParams: {},
            breadcrumbItems: [
                { prop: '', label: '全局参数' }
            ],
            pagination: { index: 1, total: 1, size: 20 },
            operations: [
                { prop: 'delete', label: '关闭', type: 'ucmp-icon-close' }
            ],
            columns: [
                { prop: 'name', label: '参数名称' },
                { prop: 'param', label: '参数值' },
                { prop: 'levelCN', label: '参数级别' },
                { prop: 'desc', label: '参数说明' }
            ],
            advanceSwitch: false,
            
            filterItems: [
                {
                    label: '请输入参数名称',
                    key: 'name'
                }
            ],
            copyTableData: []
        }
    },
    created () {
        this.init()
    },
    computed: {
        ...mapGetters([
            'businessOrproject'
        ]),
        selectedBusinessLabel () {
            return this.businessOrproject === 'business' ? '业务属性显示' : '项目属性显示'
        }
    },
    methods: {
        transformParam (obj) {
            if (obj.dictCode === 'create_service_conf') {
                obj.formItems.forEach(item => {
                    if (item.key === 'business_display') 
                        item.label = this.selectedBusinessLabel
                })
            } 
            return obj.formItems
        },
        /**
         * @description 初始化
         */
        init () {
            this.getGlobalParams()
        },
        /**
         * @description 格式化数据
         */
        formatData () {
            this.copyTableData = []
            this.tableData.forEach(rowItem => {
                rowItem.formItems.forEach(attr => {
                    if (attr.enum)
                        attr.defaultOptions = attr.enum
                    //针对网段需要添加租户隔离逻辑
                    if (rowItem.dictCode === 'internet_conf') {
                        attr.actionFormItems.forEach(item => {
                            if (item.data_link.params)
                                this.$set(item.data_link.params, 'tenant', localStorage.getItem('tenant'))
                        })
                    }
                })

                //转换formData(array -> object)
                let formData = {}
                rowItem.formData.forEach(item => {
                    formData = {...formData, ...item}
                })

                rowItem.formData = formData

                //处理默认值显示
                let displays = []
                Object.keys(rowItem.displays).forEach(key => {
                    if ((Array.isArray(rowItem.displays[key]) && rowItem.displays[key].length) || (!Array.isArray(rowItem.displays[key]) && rowItem.displays[key])) {
                        let formItem = rowItem.formItems.find(item => item.key === key)
                        if (formItem) {
                            let displayItem = {key: '', label: '', value: ''}
                            displayItem.key = key
                            displayItem.label = rowItem.formItems.find(item => item.key === key).label
                            displayItem.value = Array.isArray(rowItem.displays[key]) ? rowItem.displays[key].join('、') : rowItem.displays[key]
                            displays.push(displayItem)
                        }
                    }
                })

                rowItem.defaultValues = displays
            })

            this.copyTableData = JSON.parse(JSON.stringify(this.tableData))
        },
        isShowdisplayItem (row, key) {
            // 针对全局参数环境和自服务租期作显示处理
            if (row.dictCode === 'tenancy') {
                let rowItem = this.copyTableData.find(item => item.dictCode === row.dictCode)
                if (rowItem.formData.available === '0' || rowItem.formData.available === 0)
                    return key === 'available'
            }

            // UCMP3-5596 自动处理 formItem link:true 不应该显示其display的内容
            let formItems = {}
            row.formItems.forEach(item => {
                formItems[item.key] = item
            })
            let showItems = []
            if (formItems[key].linked) {
                // 遍历得到含有link属性且符合当前值内容的属性显示列表
                let hasLinkItems = row.formItems.filter(item => item.link)
                hasLinkItems.forEach(item => {
                    if (item.link['link_' + row.formData[item.key]])
                        showItems = showItems.concat(item.link['link_' + row.formData[item.key]])
                })
                if (showItems.indexOf(key) !== -1)
                    return true
                else return false
            }
            return true
        },
        /**
         * @description 获取全局参数列表
         */
        getGlobalParams () {
            let pageParam = { offset: this.pagination.index, limit: this.pagination.size }
            let resObj = Object.assign(pageParam, this.searchParams)
            this.isLoading = true
            Api.get('globalParam', resObj, true).then(
                res => {
                    this.isLoading = false
                    this.tableData = res.list
                    this.formatData()
                    this.pagination.total = res.total
                }, () => {
                    this.isLoading = false
                }
            )
        },
        /**
         * @description 获取保存需要的formData
         */
        getFormData (formData) {
            let result = []
            for (let [key, value] of Object.entries(formData)) {
                let item = {}
                item[key] = value
                result.push(item)
            }

            return result
        },
        /**
         * @description 保存事件
         */
        save (rowObj) {
            this.$validator.validate().then(result => {
                if (result) {
                    let resObj = {
                        level: rowObj.level,
                        dictCode: rowObj.dictCode,
                        name: rowObj.name,
                        displays: rowObj.displays,
                        formData: this.getFormData(rowObj.formData)  
                    }
                    Api.put('updateGlobalParam', resObj, true).then(res => {
                        this.$notify({
                            type: 'success',
                            message: '保存成功！'
                        })
                        this.getGlobalParams()

                        // 更新回收站配置
                        if (rowObj.dictCode === 'recycle_conf') this.getRecycleConfig()
                        if (rowObj.dictCode === 'tenancy') this.getTenancy()
                        if (rowObj.dictCode === 'create_service_conf') this.getAttachmentDisplay()
                        if (rowObj.dictCode === 'ticket_type') this.getGlobalWorkSheet(true)
                        if (rowObj.dictCode === 'order_level_display') this.getOrderLevelDisplay()
                    })
                }
            })
        },
        /**
         * @description 每页查询条数变化
         * @param size  页码大小
         */
        handleSearch (param) {
            this.pagination.index = 1
            this.searchParams = Object.assign({}, param)
            this.getGlobalParams()
        },
        handleHeaderCommand (filterParam) {
            this.searchParams = {...this.searchParams, ...filterParam}
            this.pagination.index = 1
            this.getGlobalParams()
        },
        /**
         * @description 每页查询条数变化
         * @param size  页码大小
         */
        handleSizeChange (size) {
            this.pagination.size = size
            this.getGlobalParams()
        },
        /**
         * @description 页码变化
         * @param index 页码索引
         */
        handleCurrentChange (index) {
            this.pagination.index = index
            this.getGlobalParams()
        },
        ...mapActions([
            'getTenancy',
            'getRecycleConfig',
            'getAttachmentDisplay',
            'getGlobalWorkSheet',
            'getOrderLevelDisplay'
        ])
    }
}
</script>
<style lang="scss" scoped>
.global-param-pane {
    display: flex;
    align-items: center;
}
</style>

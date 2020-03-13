<template lang="pug">
    UcmpContainer(:breadcrumbItems="breadcrumbItems")
        div.full-container(slot="content")
            div.top-button-container
                el-button.default-button.creat-button(type="primary" size="small" icon="el-icon-plus" @click="toCfgTemplate") 创建{{systemConfig.configure_template}}
            UcmpTableContainer(
                :pagination="pagination"
                :advance="advanceSwitch"
                :filterItems="filterItems"
                @sizeChange="handleSizeChange" @currentChange="handleCurrentChange"
                :submit="handleSearch"
            )
                div.full-height(slot="tableContainer")
                    el-table.panel-table-container(:data="tableData" stripe v-loading="isLoading" element-loading-spinner="ucmp-icon-loading" border)
                        el-table-column(v-for="column in columns" :prop="column.prop" :label="column.label" :key="column.prop" :width="column.width")
                            template(slot='header' slot-scope="scope")
                                TableFilterHeader(@handleHeaderCommand="handleHeaderCommand" :column="column" :searchParams="searchParams")
                            template(slot-scope="scope")
                                span(v-if="column.prop === 'modified_at'") {{ formatterTime(scope.row[column.prop]) }}
                                span(v-else-if="column.prop === 'service_code'") {{ formatterCode(scope.row[column.prop]) }}
                                span(v-else) {{scope.row[column.prop]}}
                        el-table-column(label="操作")
                            template(slot-scope="scope")
                                Icon-Button(v-for="oper in operations" :key="oper.prop" :type="oper.type" @iconClick="handleOpration" :args="{id: oper.prop, row: scope.row}" :text="oper.label")
</template>
<script>
/**
 * @description 配置模板列表
 */
import Api from '@api'
import {mapGetters} from 'vuex'
import DateUtil from '@server/date-utils'
import TableFilterHeader from '@/components/common/TableFilterHeader'

export default {
    name: 'CfgTemplateList',
    components: {TableFilterHeader},
    data () {
        return {
            tableData: [],
            isLoading: false,
            searchParams: {},
            advanceSwitch: false,
            
            breadcrumbItems: [
                { prop: '', label: '配置模板' }
            ],
            pagination: { index: 1, total: 1, size: 20 },
            filterItems: [
                { label: '配置模板名称', key: 'keyword' }
            ],
            operations: [
                { prop: 'edit', label: '编辑', type: 'ucmp-icon-edit' },
                { prop: 'delete', label: '删除', type: 'ucmp-icon-delete' }
            ],
            columns: [
                { prop: 'template_name', label: '配置模板名称' },
                { 
                    prop: 'service_code', 
                    label: '服务名称', 
                    filterKey: 'service_code',
                    filters: [],
                    filter_link: {
                        label_field: 'service_name',
                        value_field: 'service_code'
                    } 
                },
                { 
                    prop: 'provider_name', 
                    label: '云厂商',
                    filterKey: 'provider_id',
                    filters: [],
                    filter_link: {
                        label_field: 'name',
                        value_field: 'id'
                    } 
                },
                { prop: 'provider_code', label: '云厂商类型' },
                { prop: 'modified_by_name', label: '更新人' },
                { prop: 'modified_at', label: '更新时间' }
            ]
        }
    },
    methods: {
        initSystemConfig () {
            this.breadcrumbItems[0].label = this.systemConfig.configure_template
            this.filterItems[0].label = `${this.systemConfig.configure_template}名称`
            this.columns[0].label = `${this.systemConfig.configure_template}名称`
        },
        init () {
            this.initSystemConfig()
            this.getProvideDefine()
            this.getProviderList()
            this.getConfigTemplateList()
        },
        /**
         * @description 创建配置模板
         */
        toCfgTemplate () {
            this.$router.push('/config-template/edit/add')
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
         * @description 获取所有厂商配置的服务
         */
        getProvideDefine () {
            Api.get('cfgProviderDefine', {}, true).then(
                res => {
                    this.columns[1].filters = res
                }
            )
        },
        /**
         * @description 获取配置模板列表
         */
        getConfigTemplateList () {
            let pageParam = { offset: this.pagination.index, limit: this.pagination.size, template_id: 'page' }
            let resObj = Object.assign(pageParam, this.searchParams)
            this.isLoading = true
            Api.get('configTemplate', resObj, true).then(
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
                this.editCfgTemplate(obj.row)
            else
                this.deleteCfgTemplate(obj.row)
        }, 
        /**
         * @description  编辑模板
         * @params rowObj  当前行数据
         */ 
        editCfgTemplate (rowObj) {
            this.$router.push(`/config-template/edit/${rowObj.template_id}`)
        },
        /**
         * @description 删除模板
         * @params rowObj 当前行数据
         */
        deleteCfgTemplate (rowObj) {
            this.$confirm(`删除${this.systemConfig.configure_template}: ${rowObj.template_name}, 是否继续?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                Api.delete('configTemplate', {template_id: rowObj.template_id}, true).then(
                    res => {
                        this.$message({
                            type: 'success',
                            message: '删除操作成功!'
                        })
                        this.searchParams = {}
                        this.getConfigTemplateList()
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
            if (param.searchKey) {
                this.$set(param, 'query_keyword', param.searchKey)
                delete param.searchKey
            }
            this.searchParams = Object.assign({}, param)
            this.getConfigTemplateList()
        },
        handleHeaderCommand (filterParam) {
            this.searchParams = {...this.searchParams, ...filterParam}
            this.pagination.index = 1
            this.getConfigTemplateList()
        },
        /**
         * @description 每页查询条数变化
         * @param size  页码大小
         */
        handleSizeChange (size) {
            this.pagination.size = size
            this.getConfigTemplateList()
        },
        /**
         * @description 页码变化
         * @param index 页码索引
         */
        handleCurrentChange (index) {
            this.pagination.index = index
            this.getConfigTemplateList()
        },
        /**
         * @description 格式化服务名称显示
         * @param code  服务code
         */
        formatterCode (code) {
            let serviceItem = this.metadata.find(item => item.service_code === code)
            return serviceItem && serviceItem.name ? serviceItem.name : ''
        },
        /**
         * @description 格式化时间显示
         * @param time  时间戳
         */
        formatterTime (time) {
            if (!time) return ''
            return DateUtil.formate(new Date(time))
        }
    },
    created () {
        this.init()
        console.log('this.$store', this.$store)
    },
    computed: {
        ...mapGetters([
            'metadata',
            'systemConfig'
        ])
    }
}
</script>
<style lang="scss" scoped>

</style>

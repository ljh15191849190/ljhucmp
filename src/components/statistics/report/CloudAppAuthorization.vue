<template lang="pug">
    div.report-item.full-container
        div.report-item__panel.position-relative.margin-bottom
            el-tooltip(content="导出" placement="bottom")
                el-button.oper-icon-btn(
                size="small"
                icon="ucmp-icon-download"
                @click="exportReport"
                :disabled="!exportParams.provider_id")

            div.report-item__filter-panel
                label.margin-right 日期范围
                el-date-picker(
                v-model="searchParams.dateRange"
                type="daterange"
                value-format="yyyy-MM-dd"
                size="small"
                :picker-options="pickerOptions")

                label.margin-left.margin-right 云厂商
                el-select(v-model="searchParams.provider_id" size="small" v-loading="!reportProviderReady")
                    el-option(v-for="item in reportProvider" :key="item.id" :value="item.id" :label="item.name")

                el-button.filter-btn(type="primary" size="small" @click="search" :disabled="!searchParams.provider_id") 查询

                el-button.more-filter-btn(icon="el-icon-tickets" size="small" type="text" @click="toggleMoreFilter") 更多过滤

            el-collapse-transition
                div.report-item__filter-more.margin-top(v-show="moreFilter")
                    el-card(:body-style="{padding: '16px 16px 0 16px'}")
                        el-form(inline size="small" label-width="80px")
                            el-form-item(label="用户名")
                                el-input(v-model="searchParams.realname" placeholder="请输入用户名" clearable)
                            el-form-item(label="登录名")
                                el-input(v-model="searchParams.username" placeholder="请输入登录名" clearable)
                            el-form-item(label="组织机构")
                                SearchInputOrganization(v-model="searchParams.org")
                            el-form-item(label="云应用")
                                el-select(v-model="searchParams.app_id" placeholder="请选择云应用" clearable)
                                    el-option(v-for="item in appList" :key="item.application_uid" :value="item.application_uid" :label="item.application_name")
        div.report-item__table
            el-table(:data="reportData")
                el-table-column(v-for="column in columns" :label="column.label" :prop="column.prop" :key="column.prop" :width="column.width")

        div.report-item__pagination
            el-pagination(
            background
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            layout="sizes, total, prev, pager, next"
            :current-page.sync="pagination.index"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="pagination.size"
            :total="pagination.total"
            :page-count="pagination.count"
            )
</template>

<script>
    import SearchInputOrganization from '@common/SearchInputOrganization'
    import {mapGetters} from 'vuex'
    import reportMixin from './report.mixin'
    import Api from '@api'
    import FileSaver from 'file-saver'

    /**
     * 云应用授权记录报表
     *
     * @description
     * @author jia.lu
     */
    export default {
        name: 'CloudAppAuthorization',
        mixins: [reportMixin],
        components: {SearchInputOrganization},
        data () {
            return {
                name: '云应用授权记录报表',
                pagination: {
                    index: 1,
                    size: 20,
                    total: 0
                },
                reportData: [],
                searchParams: {
                    provider_id: '',
                    dateRange: null,
                    realname: '',
                    username: '',
                    org: '',
                    app_id: ''
                },
                columns: [
                    {prop: 'realname', label: '用户名'},
                    {prop: 'username', label: '登录名'},
                    {prop: 'org_name', label: '组织机构'},
                    {prop: 'created_at', label: '授权日期'},
                    {prop: 'app_name', label: '云应用名称'},
                    {prop: 'role_name', label: '角色名称'}
                ],
                moreFilter: true,
                exportParams: {},
                appList: []
            }
        },
        computed: {
            ...mapGetters([
                'reportProvider',
                'reportProviderDefault',
                'reportProviderReady'
            ])
        },
        methods: {
            init () {
                this.searchParams.dateRange = this.getCurMonthRange()

                // 获取云厂商默认值
                if (this.reportProviderReady) {
                    this.searchParams.provider_id = this.reportProviderDefault
                    this.getReport()
                }
            },

            search () {
                this.pagination.index = 1
                this.getReport()
            },

            getReport () {
                let params = JSON.parse(JSON.stringify(this.searchParams))

                params.from = params.dateRange ? Date.parse((params.dateRange[0] + ' 00:00:00').replace(/-/g, '/')) : ''
                params.to = params.dateRange ? Date.parse((params.dateRange[1] + ' 23:59:59').replace(/-/g, '/')) : ''

                delete params.dateRange

                if (params.org) {
                    params.org_id = params.org.org_id
                    delete params.org
                }

                let paramsWithPage = Object.assign({
                    limit: this.pagination.size,
                    offset: this.pagination.index
                }, params)

                Api.get('user_apps', paramsWithPage, true).then(res => {
                    // 搜索的添加到导出过滤项
                    this.exportParams = params
                    this.reportData = res.list || []
                    this.pagination.total = res.total || 0
                })
            },

            exportReport () {
                Api.get('user_apps_export', this.exportParams, true, 'blob').then(res => {
                    let blob = new Blob([res], {type: 'application/vnd.ms-excel'})
                    FileSaver.saveAs(blob, `${this.name}.xlsx`)
                    this.$notify({
                        type: 'success',
                        title: '成功',
                        message: `${this.name}导出成功`
                    })
                })
            },

            handleSizeChange (val) {
                this.pagination.size = val
                this.getReport()
            },

            handleCurrentChange () {
                this.getReport()
            },

            toggleMoreFilter () {
                this.moreFilter = !this.moreFilter
            },

            getAppList () {
                let params = {
                    limit: 999999,
                    offset: 1
                }
                Api.get('app_list', params, true).then(res => {
                    this.appList = res.list || []
                })
            }
        },
        created () {
            this.init()
            this.getAppList()
        },
        watch: {
            reportProviderDefault (val) {
                this.searchParams.provider_id = val
                this.getReport()
            }
        }
    }
</script>

<style lang="scss" scoped>
    .el-input, .el-select {
        width: 200px;
    }

    .el-card {
        overflow: unset;
    }

    .report-item__filter-panel {
        .margin-left {
            margin-left: 24px;
        }
    }
</style>

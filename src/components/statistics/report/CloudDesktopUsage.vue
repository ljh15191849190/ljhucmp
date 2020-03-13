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
                el-select(v-model="searchParams.provider_id" size="small")
                    el-option(v-for="item in reportProvider" :key="item.id" :value="item.id" :label="item.name")

                el-button.filter-btn(type="primary" size="small" @click="search" :disabled="!searchParams.provider_id") 查询

        div.report-item__table
            el-table.el-table--summary(:data="reportData" show-summary :summary-method="setSummary")
                el-table-column(label="序号" type="index" width="50")
                el-table-column(label="云桌面" prop="desktop_name")
                el-table-column(label="在线使用人数" prop="user_count" width="200")
                el-table-column(label="峰值人数" prop="peak_count" width="200")
                el-table-column(label="时间段")
                    template(slot-scope="scope")
                        span(v-if="exportParams.from") {{exportParams.from | dateFormat}} 至 {{exportParams.to | dateFormat}}
                        span(v-else) --

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
    import {mapGetters} from 'vuex'
    import reportMixin from './report.mixin'
    import Api from '@api'
    import FileSaver from 'file-saver'

    /**
     * 云桌面使用统计报表
     *
     * @description
     * @author jia.lu
     */
    export default {
        name: 'CloudDesktopUsage',
        mixins: [reportMixin],
        data () {
            return {
                name: '云桌面使用统计报表',
                pagination: {
                    index: 1,
                    size: 20,
                    total: 0
                },
                reportData: [],
                totalData: {
                    user_count: '正在查询中...',
                    peak_count: '正在查询中...'
                },
                searchParams: {
                    dateRange: null,
                    provider_code: ''
                },
                exportParams: {}
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
                    this.getSummaries()
                }
            },

            search () {
                this.pagination.index = 1
                this.getReport()
                this.getSummaries()
            },

            getReport () {
                let params = {
                    provider_id: this.searchParams.provider_id
                }
                params.from = this.searchParams.dateRange ? Date.parse((this.searchParams.dateRange[0] + ' 00:00:00').replace(/-/g, '/')) : ''
                params.to = this.searchParams.dateRange ? Date.parse((this.searchParams.dateRange[1] + ' 23:59:59').replace(/-/g, '/')) : ''

                let paramsWithPage = Object.assign({
                    limit: this.pagination.size,
                    offset: this.pagination.index
                }, params)
                Api.get('desktop_active_user_count', paramsWithPage, true).then(res => {
                    // 搜索的添加到导出过滤项
                    this.exportParams = params
                    this.reportData = res.list
                    this.pagination.total = res.total || 0
                })
            },

            getSummaries () {
                let params = {provider_id: this.searchParams.provider_id}
                params.from = this.searchParams.dateRange ? new Date(this.searchParams.dateRange[0] + ' 00:00:00').getTime() : ''
                params.to = this.searchParams.dateRange ? new Date(this.searchParams.dateRange[1] + ' 23:59:59').getTime() : ''
                Api.get('desktop_total_active_count', params, true).then(res => {
                    this.totalData = res
                    this.setSummary()
                })
            },

            setSummary () {
                return ['总和', '', this.totalData.user_count, this.totalData.peak_count, '']
            },

            exportReport () {
                Api.get('desktop_active_export', this.exportParams, true, 'blob').then(res => {
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
            }
        },
        created () {
            this.init()
        },
        watch: {
            reportProviderDefault (val) {
                this.searchParams.provider_id = val
                this.getReport()
                this.getSummaries()
            }
        }
    }
</script>

<style lang="scss" scoped>
    .report-item__filter-panel {
        .margin-left {
            margin-left: 24px;
        }
    }
</style>

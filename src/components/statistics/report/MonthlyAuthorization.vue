<template lang="pug">
    div.report-item.full-container
        div.report-item__panel.position-relative.margin-bottom
            el-tooltip(content="导出" placement="bottom")
                el-button.oper-icon-btn(size="small" icon="ucmp-icon-download" @click="exportReport" :disabled="!exportParams.provider_id")

            div.report-item__filter-panel
                label.margin-right 年份
                el-date-picker(
                v-model="searchParams.year"
                type="year"
                value-format="yyyy"
                size="small"
                @change="yearChange")

                label.margin-right.margin-left 月份
                el-date-picker(
                v-model="searchParams.month"
                type="month"
                value-format="yyyy-MM"
                format="MM"
                :disabled="!searchParams.year"
                :default-value="searchParams.year"
                :picker-options="monthPickerOptions"
                size="small")

                label.margin-left.margin-right 云厂商
                el-select(v-model="searchParams.provider_id" size="small")
                    el-option(v-for="item in reportProvider" :key="item.id" :value="item.id" :label="item.name")

                el-button.filter-btn(type="primary" size="small" @click="search" :disabled="!searchParams.provider_id") 查询

        div.report-item__table
            el-table(:data="reportData")
                el-table-column(label="序号" type="index" width="50")
                el-table-column(label="云应用" prop="app_name")
                el-table-column(label="该时间段授权人数" prop="count" width="200")
                el-table-column(label="授权总人数" prop="total_count" width="200")
                el-table-column(label="时间段")
                    template(slot-scope="scope")
                        span(v-if="exportParams.month") {{exportParams.year}}年{{exportParams.month}}月
                        span(v-else-if="exportParams.year") {{exportParams.year}}年
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
     * 月度/年度授权报表
     *
     * @description
     * @author jia.lu
     */
    export default {
        name: 'MonthlyAuthorization',
        mixins: [reportMixin],
        data () {
            return {
                name: '月度/年度授权报表',
                pagination: {
                    index: 1,
                    size: 20,
                    total: 0
                },
                reportData: [],
                searchParams: {
                    provider_id: '',
                    year: '',
                    month: ''
                },
                exportParams: {}
            }
        },
        computed: {
            monthPickerOptions () {
                let self = this

                return {
                    disabledDate (time) {
                        let timeYear = new Date(time).getFullYear().toString()
                        return timeYear !== self.searchParams.year || time.getTime() > Date.now()
                    }
                }
            },
            ...mapGetters([
                'reportProvider',
                'reportProviderDefault',
                'reportProviderReady'
            ])
        },
        methods: {
            init () {
                this.searchParams.year = new Date().getFullYear().toString()

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
                params.month = params.month ? params.month.slice(-2) : ''

                let paramsWithPage = Object.assign({
                    limit: this.pagination.size,
                    offset: this.pagination.index
                }, params)
                Api.get('user_app_count', paramsWithPage, true).then(res => {
                    this.exportParams = params
                    this.reportData = res.list || []
                    this.pagination.total = res.total || 0
                })
            },

            exportReport () {
                Api.get('user_app_count_export', this.exportParams, true, 'blob').then(res => {
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

            yearChange () {
                this.searchParams.month = ''
            }
        },
        created () {
            this.init()
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
    .margin-left {
        margin-left: 24px;
    }
</style>

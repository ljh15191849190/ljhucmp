<template lang="pug">
    div.report-item.full-container
        div.report-item__panel.position-relative.margin-bottom
            el-tooltip(content="导出" placement="bottom")
                el-button.oper-icon-btn(size="small" icon="ucmp-icon-download" @click="exportReport" :disabled="!exportParams.provider_id")

            div.report-item__filter-panel
                label.margin-right
                el-checkbox(v-model="searchParams.never_login") 查询未登录

                template(v-if="!searchParams.never_login")
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

        div.report-item__table
            el-table(:data="reportData")
                el-table-column(label="序号" type="index" width="50")
                el-table-column(label="桌面云资源" prop="desktopName")
                el-table-column(label="账号" prop="username")
                el-table-column(label="组织机构" prop="orgName")
                el-table-column(label="最后登录时间" prop="lastLoginDate")
                    template(slot-scope="scope")
                        span {{scope.row.lastLoginDate | dateFormat}}

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
    import Utils from '@server/date-utils'

    /**
     * 过期账号统计
     *
     * @description
     * @author jia.lu
     */
    export default {
        name: 'AccountLastLogin',
        mixins: [reportMixin],
        data () {
            return {
                name: '过期账号统计',
                pagination: {
                    index: 1,
                    size: 20,
                    total: 0
                },
                reportData: [],
                searchParams: {
                    provider_id: '',
                    dateRange: null,
                    never_login: false
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
                // 获取服务器时间，设置默认日期范围是当前自然月
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

                if (!params.never_login) {
                    params.from = params.dateRange ? Date.parse((params.dateRange[0] + ' 00:00:00').replace(/-/g, '/')) : ''
                    params.to = params.dateRange ? Date.parse((params.dateRange[1] + ' 23:59:59').replace(/-/g, '/')) : ''
                }

                delete params.dateRange

                let paramsWithPage = Object.assign({
                    limit: this.pagination.size,
                    offset: this.pagination.index
                }, params)

                Api.get('active_user_desktop', paramsWithPage, true).then(res => {
                    // 搜索的添加到导出过滤项
                    this.exportParams = params
                    this.reportData = res.list || []
                    this.pagination.total = res.total || 0
                })
            },

            exportReport () {
                Api.get('active_user_desktop_export', this.exportParams, true, 'blob').then(res => {
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
            }
        },
        filters: {
            dateFormat (val) {
                return val ? Utils.formate(val) : ''
            }
        }
    }
</script>

<style lang="scss" scoped>

</style>
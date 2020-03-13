<template lang="pug">
    div.report-item.full-container
        div.report-item__panel.position-relative.margin-bottom
            el-tooltip(content="导出" placement="bottom")
                el-button.oper-icon-btn(
                size="small"
                icon="ucmp-icon-download"
                @click="exportReport"
                :disabled="!exportParams.provider_id || !exportParams.from || !exportParams.to")

            div.report-item__filter-panel
                label.margin-right 日期范围
                el-date-picker(
                v-model="searchParams.dateRange"
                type="daterange"
                size="small"
                value-format="yyyy-MM-dd"
                :picker-options="pickerOptions")

                label.margin-left.margin-right 云厂商
                el-select(v-model="searchParams.provider_id" size="small" v-loading="!reportProviderReady")
                    el-option(v-for="item in reportProvider" :key="item.id" :value="item.id" :label="item.name")

                el-button.filter-btn(type="primary" size="small" @click="getReport" :disabled="!searchParams.provider_id || !searchParams.dateRange") 查询
        div.report-item__table
            el-table(:data="reportData")
                el-table-column(label="序号" type="index" width="50")
                el-table-column(label="统计对象" prop="label")
                    template(slot-scope="scope")
                        span {{scope.row.label}}
                        span(v-if="scope.row.key === 'userOrgChange' || scope.row.key === 'addOrg'")
                            el-tooltip(:content="scope.row.label + '不受云厂商查询条件影响'" placement="right")
                                i.ucmp-icon-question.theme-color.margin-left
                el-table-column(label="数量" prop="count" width="200")
                el-table-column(label="时间段")
                    template(slot-scope="scope")
                        span(v-if="exportParams.from") {{exportParams.from | dateFormat}} 至 {{exportParams.to | dateFormat}}
                        span(v-else) --
</template>

<script>
    import {mapGetters} from 'vuex'
    import reportMixin from './report.mixin'
    import Api from '@api'
    import FileSaver from 'file-saver'

    /**
     * 桌面云综合统计报表
     *
     * @description
     * @author jia.lu
     */
    export default {
        name: 'CloudDesktopSummary',
        mixins: [reportMixin],
        data () {
            return {
                name: '桌面云综合统计报表',
                reportDataOrigin: [{
                    label: '新发布应用数',
                    key: 'published_app_count',
                    count: '正在查询中...'
                }, {
                    label: '新桌面云授权人数',
                    key: 'desktop_apply_count',
                    count: '正在查询中...'
                }, {
                    label: '新建组织机构数',
                    key: 'addOrg',
                    count: '正在查询中...'
                }, {
                    label: '用户组织机构调整数',
                    key: 'userOrgChange',
                    count: '正在查询中...'
                }, {
                    label: '虚拟桌面数',
                    key: 'vmDesktopCount',
                    count: '正在查询中...'
                }, {
                    label: '随机桌面数',
                    key: 'randomDesktopCount',
                    count: '正在查询中...'
                }, {
                    label: '静态桌面数',
                    key: 'vipDesktopCount',
                    count: '正在查询中...'
                }, {
                    label: '授权应用总人数',
                    key: 'app_apply_count',
                    count: '正在查询中...'
                }],
                reportData: [],
                searchParams: {
                    provider_id: '',
                    dateRange: null
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
                }
            },

            getReport () {
                this.reportData = this.reportDataOrigin

                // ucmp3-4958 时间格式的-连接符在ie和firefox下不认，使用/连接是通用的
                let params = {provider_id: this.searchParams.provider_id}
                params.from = this.searchParams.dateRange ? Date.parse((this.searchParams.dateRange[0] + ' 00:00:00').replace(/-/g, '/')) : ''
                params.to = this.searchParams.dateRange ? Date.parse((this.searchParams.dateRange[1] + ' 23:59:59').replace(/-/g, '/')) : ''

                this.getPublishApp(params)
                this.getDesktopApply(params)
                this.getDesktopCount(params)
                this.getAppApply(params)
                this.getDeptAppApply(params)

                // py 时间戳单位是秒
                let orgParams = {
                    start_time: String.prototype.slice.call(params.from, 0, -3),
                    end_time: String.prototype.slice.call(params.to, 0, -3)
                }
                this.getUserOrgChange(orgParams)
                this.getAddOrg(orgParams)

                this.exportParams = params
            },

            // 新发布应用数
            getPublishApp (params) {
                // label: '新发布应用数 /statistic/{provider_id}/published_app_count',
                Api.get('published_app_count', params, true).then(res => {
                    this.reportData.find(item => item.key === 'published_app_count').count = res && res.app_count ? res.app_count : 0
                }).catch(() => {

                })
            },

            // 新桌面云授权人数
            getDesktopApply (params) {
                // label: '新桌面云授权人数 /statistic/{provider_id}/desktop_apply_count',
                Api.get('desktop_apply_count', params, true).then(res => {
                    this.reportData.find(item => item.key === 'desktop_apply_count').count = res && res.desktop_count ? res.desktop_count : 0
                }).catch(() => {

                })
            },

            // 虚拟/随机/VIP 桌面数
            getDesktopCount (params) {
                // label: '虚拟/随机/VIP 桌面数 /statistic/{provider_id}/daily_app_and_desktop_count',
                Api.get('daily_app_and_desktop_count', params, true).then(res => {
                    this.reportData.find(item => item.key === 'vmDesktopCount').count = res && res.desktopCount ? res.desktopCount : 0
                    this.reportData.find(item => item.key === 'randomDesktopCount').count = res && res.randomDesktopCount ? res.randomDesktopCount : 0
                    this.reportData.find(item => item.key === 'vipDesktopCount').count = res && res.staticDesktopCount ? res.staticDesktopCount : 0
                }).catch(() => {

                })
            },

            // 授权应用总人数
            getAppApply (params) {
                // label: '授权应用总人数  /statistic/{provider_id}/app_apply_count',
                Api.get('app_apply_count', params, true).then(res => {
                    this.reportData.find(item => item.key === 'app_apply_count').count = res && res.app_count ? res.app_count : 0
                }).catch(() => {

                })
            },

            // 授权应用-部门
            getDeptAppApply (params) {
                // label: '授权应用-部门  /statistic/{provider_id}/dept_app_apply_count',
                Api.get('dept_app_apply_count', params, true).then(res => {
                    let arr = []
                    if (res && res.length) {
                        arr = res.map(item => {
                            return {
                                label: `授权应用-${item.org_tag_name}用户人数`,
                                count: item.count
                            }
                        })
                    }

                    this.reportData = this.reportData.concat(arr)
                }).catch(() => {

                })
            },

            // 新建组织机构
            getAddOrg (params) {
                // 新建组织机构 /user/org/count/addorg
                Api.get('add_org', params, true).then(res => {
                    this.reportData.find(item => item.key === 'addOrg').count = res.data.total
                }).catch(() => {

                })
            },

            // 用户组织机构调整数
            getUserOrgChange (params) {
                // 用户组织机构调整数 /user/org/count/userorg
                Api.get('user_org_change', params, true).then(res => {
                    this.reportData.find(item => item.key === 'userOrgChange').count = res.data.total
                }).catch(() => {

                })
            },

            exportReport () {
                Api.get('summary_export', this.exportParams, true, 'blob').then(res => {
                    let blob = new Blob([res], {type: 'application/vnd.ms-excel'})
                    FileSaver.saveAs(blob, `${this.name}.xlsx`)
                    this.$notify({
                        type: 'success',
                        title: '成功',
                        message: `${this.name}导出成功`
                    })
                })
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
    .report-item__filter-panel {
        .margin-left {
            margin-left: 24px;
        }
    }
</style>

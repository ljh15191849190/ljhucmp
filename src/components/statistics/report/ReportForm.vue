<template lang="pug">
    UcmpContainer.report-form(:breadcrumbItems="breadcrumbItems")
        div.full-container.position-relative(slot="content")
            el-tabs(v-model="reportPage")
                el-tab-pane(v-for="report in reportList" :key="report.prop" :label="report.label" :name="report.prop")
            keep-alive
                div.report-content(:is="reportPage")
</template>

<script>
    // 台账 -- 桌面云综合统计报表
    import CloudDesktopSummary from './CloudDesktopSummary'
    // 台账 -- 云桌面使用统计报表
    import CloudDesktopUsage from './CloudDesktopUsage'
    // 台账 -- 云应用使用统计报表
    import CloudAppUsage from './CloudAppUsage'
    // 台账 -- 月度年度授权统计报表
    import MonthlyAuthorization from './MonthlyAuthorization'
    // 台账 -- 云桌面授权记录报表
    import CloudDesktopAuthorization from './CloudDesktopAuthorization'
    // 台账 -- 云应用授权记录报表
    import CloudAppAuthorization from './CloudAppAuthorization'
    // 台账 -- 过期账号
    import AccountLastLogin from './AccountLastLogin'
    import {mapActions} from 'vuex'

    /**
     * 台账首页
     *
     * @description
     * @author jia.lu
     */
    export default {
        name: 'ReportForm',
        components: {
            CloudDesktopSummary,
            CloudDesktopUsage,
            CloudAppUsage,
            MonthlyAuthorization,
            CloudDesktopAuthorization,
            CloudAppAuthorization,
            AccountLastLogin
        },
        data () {
            return {
                breadcrumbItems: [{prop: '/ReportForm', label: '台账'}],
                reportPage: 'CloudDesktopSummary',
                reportList: [
                    {prop: 'CloudDesktopSummary', label: '桌面云综合统计报表'},
                    {prop: 'CloudDesktopUsage', label: '云桌面使用统计报表'},
                    {prop: 'CloudAppUsage', label: '云应用使用统计报表'},
                    {prop: 'MonthlyAuthorization', label: '月度/年度授权报表'},
                    {prop: 'CloudDesktopAuthorization', label: '云桌面授权记录报表'},
                    {prop: 'CloudAppAuthorization', label: '云应用授权记录报表'},
                    {prop: 'AccountLastLogin', label: '过期账号清单统计'}
                ]
            }
        },
        computed: {},
        methods: {
            ...mapActions([
                'getReportProvider',
                'clearReportProvider'
            ])
        },
        created () {
            this.getReportProvider()
        },
        destroyed () {
            this.clearReportProvider()
        }
    }
</script>

<style lang="scss" scoped>
    .report-content {
        height: calc(100% - 64px);
    }
</style>
<style lang="scss">
    .report-form {
        /* ucmp-5091 tab在最后子元素取消了右方的padding，导致按钮遮挡 */
        .el-tabs--top .el-tabs__item.is-top:last-child {
            padding-right: 20px;
        }
    }

    .report-form .report-item {
        display: flex;
        flex-direction: column;

        .oper-icon-btn {
            position: absolute;
            top: 0;
            right: 0;
        }

        .filter-btn {
            margin-top: 0;
            margin-left: 12px;
        }

        .report-item__filter-panel {
            margin-right: 60px;
        }

        .report-item__table {
            flex: auto;
            overflow: hidden;
        }

        .report-item__pagination {
            display: flex;
            justify-content: flex-end;
        }
    }
</style>

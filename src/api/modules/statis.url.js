/**
 * @description 统计分析接口
 */

import {UCMP_ROOT, STATS_ROOT, VDI_ROOT, PORTAL_ROOT_V2, HACKSAW_ROOT} from './root.url'

export default {
    quotaApi: `${UCMP_ROOT}/quota/detail_list`,
    res_trend: `${STATS_ROOT}/res_trend/trend/:status`,
    each_provider_resource: `${STATS_ROOT}/capacity/provider_sort`, // 各厂商容量使用排行接口 {startTime=2018-06-28+23:34:45}{endTime=···}
    resource_usage: `${STATS_ROOT}/capacity/date_sort`, // 资源使用率对比接口
    suggestion_edit_conf: `${UCMP_ROOT}/statistics/capacity/config`, // 修改、查看配置接口 建议增加、减少， 空闲实例
    api_capacity_conf_data: `${UCMP_ROOT}/statistics/capacity/configanddata`, // 获取配置及配置下的列表
    suggestion_ecs_list: `${UCMP_ROOT}/statistics/capacity/list`, // 获取容量优化建议实例列表
    capacitySuggestEmailApi: `${UCMP_ROOT}/statistics/capacity/send_message`,

    // 资源概览下的资源统计分析接口
    // 各组织机构云服务使用情况
    resource_occupy_data: `${STATS_ROOT}/service/instance/statistics/:service_code`,
    // 本月/上月/本季度资源变化量情况
    resource_variation_data: `${STATS_ROOT}/service/instance/statistics/trend/:service_code`,
    // 组织机构/组织机构应用/应用/个人 维度下的云资源现况
    each_role_resource_data: `${STATS_ROOT}/service/instance/statistics/total/:statistics_type`,
    export_use_statics: `${STATS_ROOT}/export/excel/analysis`, // 使用分析表格导出
    export_resource_tend: `${STATS_ROOT}/export/excel/resource`, // 资源趋势表格导出
    export_resource_analysis: `${STATS_ROOT}/export/excel/trend`, // 资源统计表格导出
    resource_use_analyze: `${STATS_ROOT}/ecs/resource`, //云主机资源使用分析
    expoort_resource_use: `${STATS_ROOT}/ecs/resource/excel`, //云主机资源使用分析导出
    reportProvider: `${VDI_ROOT}/provider`, // 云桌面厂商list
    desktop_list: `${VDI_ROOT}/xen_machine/groups`, // 云桌面list
    app_list: `${VDI_ROOT}/xen_application/page`, // 云应用list

    user_org_change: `${PORTAL_ROOT_V2}/user/org/count/userorg`, // 用户组织机构调整
    add_org: `${PORTAL_ROOT_V2}/user/org/count/addorg`, // 组织机构增加
    published_app_count: `${VDI_ROOT}/statistic/:provider_id/published_app_count`, // 新发布应用
    desktop_apply_count: `${VDI_ROOT}/statistic/:provider_id/desktop_apply_count`, // 新桌面授权
    daily_app_and_desktop_count: `${VDI_ROOT}/statistic/:provider_id/daily_app_and_desktop_count`, // 虚拟/随机/VIP 桌面
    app_apply_count: `${VDI_ROOT}/statistic/:provider_id/app_apply_count`, // 授权应用总人数
    dept_app_apply_count: `${VDI_ROOT}/statistic/:provider_id/dept_app_apply_count`, // 授权分部门

    desktop_active_user_count: `${VDI_ROOT}/statistic/:provider_id/desktop_active_user_count`, // 在线桌面用户数
    desktop_total_active_count: `${VDI_ROOT}/statistic/:provider_id/desktop_total_active_count`, // 在线桌面用户数总计

    app_active_user_count: `${VDI_ROOT}/statistic/:provider_id/app_active_user_count`, // 在线应用用户数
    app_total_active_count: `${VDI_ROOT}/statistic/:provider_id/app_total_active_count`, // 在线应用用户数总计

    user_app_count: `${VDI_ROOT}/statistic/:provider_id/user_app_count`, // 用户应用数量， 月度、年度统计

    user_desktops: `${VDI_ROOT}/statistic/:provider_id/user_desktops`, // 云桌面授权记录
    user_apps: `${VDI_ROOT}/statistic/:provider_id/user_apps`, // 云应用授权记录
    active_user_desktop: `${VDI_ROOT}/statistic/:provider_id/active_user_desktop`, // 账号过期记录

    summary_export: `${VDI_ROOT}/statistic/:provider_id/summary/export`, // 云桌面综合统计导出
    desktop_active_export: `${VDI_ROOT}/statistic/:provider_id/desktop/active/export`, // 云桌面使用统计导出
    app_active_export: `${VDI_ROOT}/statistic/:provider_id/app/active/export`, // 云应用使用统计导出
    user_app_count_export: `${VDI_ROOT}/statistic/:provider_id/user/app/count/export`, // 月度年度授权统计导出
    user_desktops_export: `${VDI_ROOT}/statistic/:provider_id/user/desktop/export`, // 云桌面授权统计导出
    user_apps_export: `${VDI_ROOT}/statistic/:provider_id/user/app/export`, // 云应用授权统计导出
    active_user_desktop_export: `${VDI_ROOT}/statistic/:provider_id/active_user_desktop/export`, // 过期账号统计导出

    resource_month_export: `${STATS_ROOT}/export/pdf/groupByMonth`, // 资源概览--月度统计导出

    // 总览图表相关
    daily_app_and_desktop_active_count: `${VDI_ROOT}/statistic/:provider_id/daily_active_app_and_desktop_count`, // 每日桌面应用活跃次数
    session_duration_top: `${VDI_ROOT}/statistic/:provider_id/session_duration_top`, // 在线时长排名
    active_user_top: `${VDI_ROOT}/statistic/:provider_id/active_user_top`, // 在线用户排名
    resource_count: `${UCMP_ROOT}/service_instance/:service_code/count`, // 资源数量统计
    license_count: `${HACKSAW_ROOT}/citrix/license/monitor`, // 许可证数量统计
    license_count_all: `${HACKSAW_ROOT}/citrix/licenses`, // 许可证全厂商的总数量统计

    // 配额统计
    get_Quota_object_types: `${UCMP_ROOT}/quota/object_types`, // 配额类型
    get_Quota_service_codes: `${UCMP_ROOT}/quota/service_codes`, // 配额service_codes
    get_Quota_static_chart: `${UCMP_ROOT}/quota/statistics/chart`, // 配额service_codes
    get_Quota_Statistic_item: `${UCMP_ROOT}/quota/detail_statistics_items`, // 配额表头
    get_Quota_Statistic_download: `${UCMP_ROOT}/quota/detail_statistics_file`, // 配额下载
    get_Quota_Statistics: `${UCMP_ROOT}/quota/detail_statistics` // 配额数据
}

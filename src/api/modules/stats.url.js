/**
 * @description 总览页面接口
 */

import { STATS_ROOT, BPM_ROOT } from './root.url'

export default {
    db_apps: `${STATS_ROOT}/user_app/app`,  // 我的应用
    db_resources: `${STATS_ROOT}/user_res/list`, // 我的资源
    db_orders: `${STATS_ROOT}/user_order/order`, // 我的申请单
    db_business: `${STATS_ROOT}/user_business/business`, //
    db_provider: `${STATS_ROOT}/provider_res/list`, // 厂商概况
    db_resource_overview: `${STATS_ROOT}/provider_use/list`, // 厂商容量概况
    db_org: `${STATS_ROOT}/org_info/info`, // 组织信息
    db_resource_apply: `${STATS_ROOT}/res_apply/apply`, // 资源申请趋势
    db_approve: `${BPM_ROOT}/api/workflow/tasks-count`,
    db_capacity_distribute: `${STATS_ROOT}/capacity/tendency`, // 容量分配趋势
    // 大屏数据接口
    bs_resource_total: `${STATS_ROOT}/capacity/analyze`,
    export_overview: `${STATS_ROOT}/export/excel/overview` // 总览表格导出
}

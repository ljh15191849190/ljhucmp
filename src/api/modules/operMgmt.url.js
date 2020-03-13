/**
 * @description 运营管理请求API的url
 */

import { UCMP_ROOT, ATOMFLOW_ROOT, PORTAL_ROOT_V2 } from './root.url'

export default {
    getOrgTagList: `${PORTAL_ROOT_V2}/user/tag`,
    resourceQuota: `${UCMP_ROOT}/quota`,
    api_script_node: `${ATOMFLOW_ROOT}/v1/script/node`,
    api_script_tags: `${ATOMFLOW_ROOT}/v1/script/tag`,
    // 配额
    getresourceQuota: `${UCMP_ROOT}/quota/config_item`,
    getQuotaData: `${UCMP_ROOT}/quota`,
    SaveQuotaApprove: `${UCMP_ROOT}/order/quota/approve`,
    SaveQuota: `${UCMP_ROOT}/quota`,
    getApproveQuota: `${UCMP_ROOT}/quota/approve`,
    // pytnon
    getAllProject: `${PORTAL_ROOT_V2}/business/sum/list`,
    getProjectAllBusiness: `${PORTAL_ROOT_V2}/business/get/apps`,
    getProjectAllApps: `${PORTAL_ROOT_V2}/business/get/all_apps`,
    getSearchProject: `${PORTAL_ROOT_V2}/business/search/apps`,
    getProjectOfApps: `${PORTAL_ROOT_V2}/business/apps/list`,
    // 配额权限
    getorgTreeAuthor: `${PORTAL_ROOT_V2}/user/org/filter`,
    getProjectAuthor: `${PORTAL_ROOT_V2}/user/item/filter`,
    getappAuthor: `${PORTAL_ROOT_V2}/user/app/filter`
}

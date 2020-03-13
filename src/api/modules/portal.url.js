/**
 * @description portal-ui工程的url，用户、组织机构、业务、应用、角色等接口
 * @author xinghua.wen
 */

import { PORTAL_ROOT_V2 } from './root.url'

export default {
    businessListByName: `${PORTAL_ROOT_V2}/business/list`,
    // 获取此组织机构及其子孙节点下的业务
    businessListByOrgRoot: `${PORTAL_ROOT_V2}/business/org/businessinfo`,
    businessByAppId: `${PORTAL_ROOT_V2}/business/app/businessinfo`,
    orgTreeWithBusiness: `${PORTAL_ROOT_V2}/user/org/business`,
    userListByName: `${PORTAL_ROOT_V2}/user/lists`,
    userById: `${PORTAL_ROOT_V2}/user/detail`,
    orgLazy: `${PORTAL_ROOT_V2}/user/orgs`,
    orgQuery: `${PORTAL_ROOT_V2}/user/org/query`,
    userMenus: `${PORTAL_ROOT_V2}/sys/user/menus`,
    // 租户信息
    tenantInfo: `${PORTAL_ROOT_V2}/user/project/lists`,
    modules: `${PORTAL_ROOT_V2}/sys/modules`,
    // 获取全部应用
    appListByName: PORTAL_ROOT_V2 + '/business/apps/list',
    // 获取该用户组织机构下的应用
    appListByUserOrg: PORTAL_ROOT_V2 + '/business/org/apps/list',
    // 应用名称相似度（>= 50%）
    appNameSimilarity: PORTAL_ROOT_V2 + '/business/app/name/similar?name=:business_app_name&similar=0.5',
    roleList: PORTAL_ROOT_V2 + '/user/roles/lists',
    // 组织机构获取应用
    businessListByOrg: `${PORTAL_ROOT_V2}/business/org/apps`,
    getRolesByPlatform: `${PORTAL_ROOT_V2}/user/roles`,
    // 获取域的信息
    getLdap: `${PORTAL_ROOT_V2}/sys/ldap/userinfo`,
    // 获取ad用户
    getADUser: `${PORTAL_ROOT_V2}/sys/ldap/all_users`,
    // 获取ad用户组
    getADUserGroup: `${PORTAL_ROOT_V2}/sys/ldap/all_groups`,
    //项目or业务
    businessOrproject: `${PORTAL_ROOT_V2}/business/choose/name`,

    //资源所属为组织机构或应用接口
    getresourcebelongForm: `${PORTAL_ROOT_V2}/sys/modify_resource`,
    //资源所属是否项目负责人
    getresourceManager: `${PORTAL_ROOT_V2}/user/check/item_manager`,

    //资源所属应用
    getresourceApp: `${PORTAL_ROOT_V2}/business/org/apps/list`,
    getappAllList: `${PORTAL_ROOT_V2}/business/get/all_apps`
}

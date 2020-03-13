/**
 * @description 元数据相关url
 */

import { UCMP_ROOT } from './root.url'

export default {
    // 获取控制台下的基础资源元数据信息（不包括编排资源）
    getBasicMetadata: `${UCMP_ROOT}/service_define/basic_service_defines`,
    // 获取元数据列表|某服务指定的元数据
    getMetadata: UCMP_ROOT + '/service_define/:_code',
    // 获取所有服务定义元数据
    getAllMetadata: `${UCMP_ROOT}/service_define/list/all/limited`,
    // 配置元数据的租户信息
    setMetaDataTenant: `${UCMP_ROOT}/service_define/tenant_service/limited`,
    setMetaDataApplyPrivilegeByTenant: `${UCMP_ROOT}/role_service`,
    // 获取元数据的租户信息
    getMetaDataTenant: `${UCMP_ROOT}/service_define/tenant_service/:_code`,
    // 获取指定服务和角色下的可直接申请属性列表
    getAttributePrivilegesByRole: `${UCMP_ROOT}/role_service/attributes`,
    // 获取当前用户的角色在申请节点各个服务的可修改属性列表
    getAllServiceAttributeByRolePrivilege: `${UCMP_ROOT}/role_service/service_attributes`,
    // 编排分层
    blueprintGroups: `${UCMP_ROOT}/service_define/blueprint/hierarchy/:group_id`,
    // 申请单管理url
    orderDetailList: `${UCMP_ROOT}/order/:orderCode/detail/:orderDetailCode/:group`,
    orderDetailAction: `${UCMP_ROOT}/order/:orderCode/detail/:orderDetailCode/:action`,
    // Download order
    downloadOrder: `${UCMP_ROOT}/order/file/xlsx`,
    // 获取申请单具体配置
    getOrderDetailConfig: `${UCMP_ROOT}/order/:orderCode/detail/:orderDetailCode/items`,
    // 获取蓝图服务下的实例详情
    getBlueorintDetail: `${UCMP_ROOT}/service_define/blueprint_summary`,

    /**
     * 资源变更时所需的API接口
     * @params [serviceCode] 变更对象的service_code编码
     *         [action] 资源变更的类型 create | modify | (action的name)
     *
     * @action --云主机克隆不用处理，使用原有接口
     */
    changeResourceByOrder: `${UCMP_ROOT}/order/:serviceCode/:action`,
    deployConf: `${UCMP_ROOT}/service_define/:serviceCode/metadata`
}

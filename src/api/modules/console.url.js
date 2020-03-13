/**
 * @description 控制台url
 * @author xinghua.wen
 */

import {UCMP_ROOT, F5_ROOT} from './root.url'

const root = '/api/'
const baseUrl = `${UCMP_ROOT}/service_instance`
const ESC_ROOT = '/ecs/'

export default {
    serviceApply: baseUrl,
    bingTag: `${UCMP_ROOT}/tag_bind`,
    getTagByTypeAndName: `${UCMP_ROOT}/tag_bind/validate/:serviceCode`,
    escList: root + 'escs',
    // 获取服务实例
    serviceInstance: `${baseUrl}/:service`,
    // 获取服务实例详情
    serviceInstanceDetail: `${baseUrl}/:service/:instanceId`,
    serviceInstanceAttributesCount: `${baseUrl}/:service/attribute_group/:_attribute`,
    volumeInstances: `${baseUrl}/ecs/all`,
    assign: `${baseUrl}/org/bind`, //分配存量
    // Download service instance data
    serviceInstanceDownload: `${baseUrl}/:service_code/file/:suffix`,
    authorize: `${UCMP_ROOT}/user_instance`,
    resourceAuthority: `${UCMP_ROOT}/user_instance/:_serviceCode/:_instanceId/:_info`,
    // 获取f5_pool 详情
    getF5PoolDetail: `${F5_ROOT}/f5Pool/:_f5Id`,
    getF5NodeListData: `${F5_ROOT}/f5Pool/:_f5Id/nodes`,
    // f5Node操作处理
    f5NodeReduceOper: `${UCMP_ROOT}/order/pool/remove_node`,
    f5NodeAddOper: `${UCMP_ROOT}/order/pool/add_node `,
    f5NodeAsyncOper: `${F5_ROOT}/f5Pool/:poolId/status`,
    f5PortExist: `${F5_ROOT}/port_check`,
    // ecs clone 获取网络
    getEcsCloneNetwork: `${UCMP_ROOT}/resource_pool/:provider_id/net_work/:owner`,
    modifyServiceResource: `${UCMP_ROOT}/service_instance/:service_code/:instance_id/responsible_person`,
    customTableCols: `${UCMP_ROOT}/column/exhibit/:tableId`,
    // 获取租期授权
    getResourceExpired: `${UCMP_ROOT}/resource_ext_instances/:serviceCode/:instanceId/expired_at`,
    // 租期续期
    renewal: `${UCMP_ROOT}/resource_ext_instances/expired_at`,
    // 控制台下载
    downloadConsole: '/vmware/provider/console_install_package',
    osVersion: `${ESC_ROOT}/os_version`,

    // 修改资源配置
    modifyResourceBelong: `${UCMP_ROOT}/order/ecs/modify_resource_belong`,
    // oracle
    oracleUpdatePass: '/oracle_rac/instance/:oracleRacInstanceId/sysdba',
    oracleInstanceList: '/oracle_rac/instance/:oracleRacInstanceId/sid'
}

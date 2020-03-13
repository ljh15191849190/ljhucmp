/**
 * @description 云基础架构url
 * @author davidPan
 */
import { PROVIDER_ROOT, UCMP_ROOT, NETWORK_ROOT, BAREMETAL_ROOT, HACKSAW_ROOT } from './root.url'
const ESC_ROOT = '/ecs/'
export default {
    //***********************云厂商接口定义*************************//
    provider: PROVIDER_ROOT + '/provider/:id',             //云厂商列表、创建、编辑、删除
    providerStatus: UCMP_ROOT + '/service_instance/provider_attribute_count/status', //云厂商列表的状态
    providerConfig: PROVIDER_ROOT + '/provider/basic_config/:id',  //云厂商同步配置
    cloundbootConfig: BAREMETAL_ROOT + '/provider/basic_config/:id', // 物理机同步配置
    providerDefine: PROVIDER_ROOT + '/provider_define',    //云厂商定义
    providerRule: PROVIDER_ROOT + '/provider/:provider_id/rule/:id', //同步规则
    providerSyncTime: UCMP_ROOT + '/common/times', //同步时间
    //***********************资源池接口定义**************************//
    sourcePool: UCMP_ROOT + '/resource_pool/:id',          //资源池列表、创建、编辑、删除
    sourcePoolConf: UCMP_ROOT + '/resource_pool/:id/spec', //资源池配置
    sourcePoolDefine: UCMP_ROOT + '/resource_pool_define', //资源池定义
    sourcePoolName: UCMP_ROOT + '/resource_pool/verify/name', //资源池创建名称唯一性校验
    sourcePoolOpre: UCMP_ROOT + '/resource_pool/:id/available/:available', //资源池启用、禁用
    //***********************配置模板接口定义**************************//
    // 配置模板列表、创建、编辑、删除
    configTemplate: UCMP_ROOT + '/configure_template/:template_id',
    //获取服务的支持厂商列表
    cfgTemplateProviders: UCMP_ROOT + '/service_define/:service_code/providers',
    //获取服务某厂商的配置定义
    cfgTemplateDefines: UCMP_ROOT + '/service_define/:service_code/provider/:provider_code',
    //获取所有厂商配置的服务
    cfgProviderDefine: UCMP_ROOT + '/service_define/provider_conf_service',
    //验证模板名称是否可用
    verifyTemplateExist: UCMP_ROOT + '/configure_template/check',
    //获取可用的模板(组织机构)
    availableTemplates: UCMP_ROOT + '/configure_template/available_templates',
    // 配置模板列表、创建、编辑、删除
    applyQuotaTemplates: UCMP_ROOT + '/configure_template/apply_quota_templates',
    //***********************镜像接口定义**************************//
    systemOs: ESC_ROOT + 'os',                             //操作系统列表
    mirror: ESC_ROOT + 'image/:id',                        //镜像增删改查、列表
    mirrorProvider: ESC_ROOT + 'image/provider',     //查询带zone的云厂商列表
    imageProvider: ESC_ROOT + 'image/image_provider',      //查询云厂商镜像列表接口
    imageProviderSort: ESC_ROOT + 'image/:_id/image_provider', //查询云厂商镜像列表接口(含排序)
    //***********************网络管理接口定义************************//
    iaas_networks: NETWORK_ROOT + '/aggregates/',               // 网段
    iaas_prefixes: NETWORK_ROOT + '/prefixes/:_id/',            // IP组
    iaas_edit_prefixes: NETWORK_ROOT + '/prefixes/editprefix/:_id/',            // IP组编辑
    iaas_ips: NETWORK_ROOT + '/ip-addresses/:_id/',             // 单个IP创建、删除,
    iass_prefixes_org: UCMP_ROOT + '/netbox_ip/prefix_org',     //子网组织机构
    iaas_edit_ip: NETWORK_ROOT + '/ip-addresses/editip/:_id/',  // 编辑IP,
    iaas_multiIps: NETWORK_ROOT + '/ip-addresses/bulk/',        // 批量IP
    iass_ipList: NETWORK_ROOT + '/ip-addresses/list_ip_count_by_state/',    // IP列表
    //***********************规格接口定义**************************//
    specification: ESC_ROOT + 'flavor/:id',                // 规格
    specificationByName: ESC_ROOT + 'flavor/validate',        // 查询规格名称是否存在
    specificationAssign: PROVIDER_ROOT + '/base_item_owner/:type/:id', // 规则限制
    flavorProvider: ESC_ROOT + 'flavor/:id/flavor_provider', // 云厂商规格列表
    //
    operLog: UCMP_ROOT + '/log/external', // 添加一条操作日志

    //***********************物理机**************************//
    physic_doList: BAREMETAL_ROOT + '/resource/list/:status',  //查询列表（纳管未纳管）
    physic_savePhy: BAREMETAL_ROOT + '/resource',      //新增
    physic_editPhy: BAREMETAL_ROOT + '/resource/:bareId',        //修改和纳管
    physic_getDetailPhy: BAREMETAL_ROOT + '/resource/:bareId',        //查看详细信息
    physic_getSn: HACKSAW_ROOT + '/baremetal/product',    //获取sn
    physic_getSystem: BAREMETAL_ROOT + '/instance/tablehead/selection',    //下拉操作系统
    physic_downList: BAREMETAL_ROOT + '/resource/file/:status', //下载
    physic_provider: PROVIDER_ROOT + '/provider/all' //物理机云厂商
}

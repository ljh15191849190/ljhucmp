/**
 * @description 应用程序管理url
 * @author davidPan
 */
import {VDI_ROOT, HACKSAW_ROOT, PORTAL_ROOT_V2} from './root.url'

export default {
    //**************应用程序管理***************//
    //应用程序管理列表
    appMgmtList: '/vdi/xen_application/page',
    //标记常用
    appSignUsed: '/vdi/xen_application/mark/:id',
    //应用会话列表
    appSessions: '/hacksaw/citrix/application/sessions',
    // 交付组列表
    deliveryGroup: VDI_ROOT + '/xen_delivery_group/page',
    // 选中的交付组匹配的计算机列表
    computerList: '/hacksaw/citrix/catalog',
    // 添加计算机到交付组
    addComputerToDelivery: VDI_ROOT + '/xen_delivery_group/machine',
    // 应用程序文件夹列表
    folderList: '/hacksaw/citrix/adminFolders',
    // 新建应用程序文件夹
    addFolder: '/hacksaw/citrix/afminFolder',
    // 应用程序列表
    applicationList: '/hacksaw/citrix/desktopGroup/applications',
    // 添加应用程序
    addApplication: VDI_ROOT + '/xen_delivery_group/application',
    // 删除应用程序
    appDelete: '/vdi/xen_application',
    // 禁用应用程序
    appForbidden: '/vdi/xen_application/action',
    // 应用程序重命名
    appRename: '/vdi/xen_application/rename',

    // 属性-应用程序
    getApplication: '/hacksaw/citrix/application',
    // 属性设置-标识
    propsSign: '/hacksaw/citrix/application/identification',
    // 属性设置-位置
    propsPosition: '/hacksaw/citrix/application/location',

    // 属性设置-交付
    propsDelivery: '/hacksaw/citrix/application/delivery',

    // 属性设置-交付组-应用程序列表
    propsAppList: '/vdi/xen_application/application_groups',
    // 属性设置-交付组
    propsGroup: '/vdi/xen_application/groups',
    // 属性设置-交付组-交付组和应用程序列表
    propsAppGroups: '/vdi/xen_application/groups',

    // 属性设置-可见性
    propsVisUsers: PORTAL_ROOT_V2 + '/sys/ldap/all_users',
    propsVisGroup: PORTAL_ROOT_V2 + '/sys/ldap/all_groups',

    propsVisble: '/hacksaw/citrix/application/visible',

    // 查看当前交付组下面的用户
    deliveryUser: `${HACKSAW_ROOT}/citrix/desktopGroup/user/config`,
    // 修改当前交付组下面的用户
    // deliveryUserUpdate: `${HACKSAW_ROOT}/citrix/desktopGroup/authority`,
    deliveryUserUpdate: `${VDI_ROOT}/xen_delivery_group/authority`,

    // 查看当前交付组下面的计算机信息
    deliveryMachine: `${HACKSAW_ROOT}/citrix/desktopGroup/machines`,
    // 修改当前交付组下面的计算机信息
    // deliveryMachineUpdate: `${HACKSAW_ROOT}/citrix/desktopGroup/distribution`,
    deliveryMachineUpdate: `${VDI_ROOT}/xen_delivery_group/distribution`,

    // 查看/修改 动态 桌面分配信息
    deliveryRandomDesktop: `${HACKSAW_ROOT}/citrix/desktopGroup/entitlement/policy/rule`,
    deliveryRandomDesktopUpdate: `${VDI_ROOT}/xen_delivery_group/entitlement/policy/rule`,

    // 查看/修改 静态 桌面分配信息
    deliveryStaticDesktop: `${HACKSAW_ROOT}/citrix/desktopGroup/assignment/policy/rule`,
    deliveryStaticDesktopUpdate: `${VDI_ROOT}/xen_delivery_group/assignment/policy/rule`
}

/**
 * @description 桌面云url
 * @author davidPan
 */
// import {UCMP_ROOT} from './root.url'

export default {
    //**************计算机管理***************//
    //计算机管理列表
    citrixMachine: '/vdi/xen_machine/page',
    //交付组
    citrixMachineGroups: '/vdi/xen_machine/groups',
    //计算机目录
    citrixMachineCatalogs: '/vdi/xen_machine/catalogs',
    //维护模式切换
    citrixMachineSwitch: '/vdi/xen_machine/switch/:id',
    //重启、强制重启、关闭、强制关闭
    citrixMachinePerform: '/vdi/xen_machine/perform/:id',
    //计算机会话列表
    citrixMachineSessions: '/hacksaw/citrix/machine/sessions',
    //计算机会话注销(注销当前计算机上所有用户).
    citrixMachineLogout: '/hacksaw/citrix/machine/sessions/logout',
    //会话注销
    citrixMachineSessionsLogout: '/hacksaw/citrix/machine/user/sessions/logout',
    //会话断开连接
    citrixMachineSessionsDisconnect: '/hacksaw/citrix/machine/user/sessions/disconnect'
}

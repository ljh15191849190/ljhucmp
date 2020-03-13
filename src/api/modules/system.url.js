import {UCMP_ROOT, PORTAL_ROOT_V2} from './root.url'

export default {
    logType: UCMP_ROOT + '/log/type',
    logList: UCMP_ROOT + '/log',
    logDownloadStream: UCMP_ROOT + '/log/form/:suffix',
    //***********************全局参数*************************//
    globalParam: UCMP_ROOT + '/dict',
    updateGlobalParam: UCMP_ROOT + '/dict/:level/:dictCode',
    userRoles: PORTAL_ROOT_V2 + '/user/roles/assigned',
    getDictByCode: UCMP_ROOT + '/dict/code',
    getSystemDictCode: UCMP_ROOT + '/dict/system/:code' // 系统参数
}

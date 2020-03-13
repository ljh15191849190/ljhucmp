/**
 * @description 公共参数，主要是只读静态变量
 * @returns {{multipleCount: string}}
 */
import Api from '@api'
import * as types from '../mutations_types'
import Physical from '@mock/subnet/physical.mock'

const state = () => {
    return {
        multipleCount: '__UCMP_multipleCount__', // TableSelect表格所需多选数参数，调用者需要使用
        // 个人配置
        customConfig: {
            // 控制台用户自定义显示列
            consoleTableCols: {}
        },
        // 全局参数
        globalParam: {
            tenancy: {available: 1, maxTime: 1},
            recycleConfig: {storageTime: 24, timeUnit: 'hour'},
            nasAutoAttach: false,
            attachmentDisplay: false,
            businessDisplay: false,
            orderlevelDisplay: false,
            systemConfig: {}
        }
    }
}

const getters = {
    multipleCount: state => state.multipleCount,
    consoleTableCols: state => state.customConfig.consoleTableCols,
    tenancy: state => state.globalParam.tenancy,
    recycleConfig: state => state.globalParam.recycleConfig,
    nasAutoAttach: state => state.globalParam.nasAutoAttach,
    attachmentDisplay: state => state.globalParam.attachmentDisplay,
    businessDisplay: state => state.globalParam.businessDisplay,
    orderlevelDisplay: state => state.globalParam.orderlevelDisplay,
    systemConfig: state => state.globalParam.systemConfig
}

const actions = {
    getCustomTableColsById ({commit, state}, id) {
        if (state.customConfig.consoleTableCols[id]) return
        if (id === 'donatubeList') 
            commit(types.SET_CUSTOM_CONFIG_CONSOLE_TABLE_COLS, {id, obj: Physical.doColumnsdisplay})
        else if (id === 'notnatubeList') 
            commit(types.SET_CUSTOM_CONFIG_CONSOLE_TABLE_COLS, {id, obj: Physical.notdoColumnsdisplay})
        else {
            Api.get('customTableCols', {tableId: 'console,' + id}).then(res => {
                commit(types.SET_CUSTOM_CONFIG_CONSOLE_TABLE_COLS, {id, obj: res})
            }).catch(() => {
            })
        }
    },

    setCustomTableCols ({commit, state}, payload) {
        commit(types.SET_CUSTOM_CONFIG_CONSOLE_TABLE_COLS, payload)

        payload.obj.tableId = 'console,' + payload.id
        Api.put('customTableCols', payload.obj).then(res => {
        }).catch(() => {
        })
    },

    getTenancy ({commit, state}) {
        Api.get('getDictByCode', {code: 'tenancy'}).then(res => {
            let tenancyObj = {
                available: res.available,
                maxTime: res.longest_tenancy
            }
            commit(types.SET_GLOBAL_PARAM_TENANCY, tenancyObj)
        }).catch(() => {
        })
    },

    getRecycleConfig ({commit, state}) {
        Api.get('getDictByCode', {code: 'recycle_conf'}).then(res => {
            commit(types.SET_GLOBAL_PARAM_RECYCLE, res || {})
        }).catch(() => {
        })
    },

    getAttachmentDisplay ({commit, state}) {
        Api.get('getDictByCode', {code: 'create_service_conf'}).then(res => {
            res = res || {}
            commit(types.SET_GLOBAL_PARAM_ATTACHMENT, res.attachment_display)
            commit(types.SET_GLOBAL_PARAM_BUSINESS, res.business_display)
        }).catch(() => {
        })
    },

    // 优先级
    getOrderLevelDisplay ({commit, state}) {
        return Api.get('getDictByCode', {code: 'order_level_display'}).then(res => {
            res = res || {}
            commit(types.SET_ORDER_LEVEL_DISPLAY, res.display)
        }).catch(() => {
        })
    },

    getNasAutoAttach ({commit, state}) {
        Api.get('getSystemDictCode', {code: 'nas_auto_attach'}).then(res => {
            commit(types.SET_GLOBAL_PARAM_NAS_AUTO_ATTACH, res || {})
            // commit(types.SET_GLOBAL_PARAM_NAS_AUTO_ATTACH, {auto_attach: true})
        }).catch(() => {
        })
    },

    async getSystemConfig ({commit, state}) {
        let res = await Api.get('getDictByCode', {code: 'string_resources', level: 'system'})
        commit(types.SET_GLOBAL_PARAM_SYSTEM, res || {})
    }
}

const mutations = {
    [types.SET_CUSTOM_CONFIG_CONSOLE_TABLE_COLS] (state, payload) {
        let temp = JSON.parse(JSON.stringify(state.customConfig.consoleTableCols))
        temp[payload.id] = payload.obj
        // 全量替换 触发更新
        state.customConfig.consoleTableCols = temp
    },

    [types.SET_GLOBAL_PARAM_TENANCY] (state, payload) {
        state.globalParam.tenancy = payload
    },

    [types.SET_GLOBAL_PARAM_RECYCLE] (state, payload) {
        state.globalParam.recycleConfig = payload
    },

    [types.SET_GLOBAL_PARAM_ATTACHMENT] (state, payload) {
        // 睿智的0，1
        state.globalParam.attachmentDisplay = !!payload
    },

    [types.SET_GLOBAL_PARAM_BUSINESS] (state, payload) {
        // 睿智的0，1
        state.globalParam.businessDisplay = !!payload
    },

    [types.SET_GLOBAL_PARAM_NAS_AUTO_ATTACH] (state, payload) {
        state.globalParam.nasAutoAttach = payload.auto_attach
    },

    [types.SET_ORDER_LEVEL_DISPLAY] (state, payload) {
        state.globalParam.orderlevelDisplay = payload
    },
    [types.SET_GLOBAL_PARAM_SYSTEM] (state, payload) {
        state.globalParam.systemConfig = payload
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}

/**
 * @description 统计分析 store
 * @author jia.lu
 */
import * as types from '../mutations_types'
import Api from '@api'

const state = () => {
    return {
        // 台账中的云厂商
        reportProvider: [],
        // 台账中的云厂商接口是否返回了
        reportProviderReady: false,
        // 台账中的云厂商默认值
        reportProviderDefault: null
    }
}

const getters = {
    reportProvider: state => state.reportProvider,
    reportProviderReady: state => state.reportProviderReady,
    reportProviderDefault: state => state.reportProviderDefault
}

const actions = {
    getReportProvider ({commit, state}, clearCache = false) {
        if (state.reportProviderReady && !clearCache) return

        Api.get('reportProvider', {}, true).then(res => {
            commit(types.SET_REPORT_PROVIDER, res)

            // UCMP3-5705【总览】未添加桌面云云厂商时，在总览页面，勾选云桌面云应用相关，点击导出报“服务发生异常”
            // provider_id 在路径中使用，默认改为null，台账也是
            const id = res && res[0] ? res[0].id : null
            commit(types.SET_REPORT_PROVIDER_DEFAULT, id)
            commit(types.SET_REPORT_PROVIDER_READY, true)
        }).catch(() => {
        })
    },

    clearReportProvider ({commit, state}) {
        commit(types.SET_REPORT_PROVIDER, [])
        commit(types.SET_REPORT_PROVIDER_DEFAULT, null)
        commit(types.SET_REPORT_PROVIDER_READY, false)
    }
}

const mutations = {
    [types.SET_REPORT_PROVIDER] (state, res) {
        state.reportProvider = res || []
    },

    [types.SET_REPORT_PROVIDER_DEFAULT] (state, id) {
        state.reportProviderDefault = id
    },

    [types.SET_REPORT_PROVIDER_READY] (state, ready) {
        state.reportProviderReady = ready
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}

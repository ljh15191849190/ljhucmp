/**
 * @description 成本分析状态管理模块
 */

import * as types from '../mutations_types'

const state = () => {
    return {
        costAnysis: {
            detailFilter: {}
        }
    }
}

const getters = {
    costDetailFilter: state => state.costAnysis.detailFilter
}

const actions = {
    setCostDetailFilter ({commit, state}, detailFilter) {
        commit(types.SET_COST_DETAIL_FILTER, detailFilter)
    }
}

const mutations = {
    [types.SET_COST_DETAIL_FILTER] (state, detailFilter) {
        state.costAnysis.detailFilter = detailFilter
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}

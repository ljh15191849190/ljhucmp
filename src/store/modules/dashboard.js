/**
 * @description 总览状态管理模块
 */

import * as types from '../mutations_types'

const state = () => {
    return {
        cardFilters: {}
    }
}

const getters = {
    cardFilters: state => state.cardFilters
}

const actions = {
    setCardFilterItem ({commit, state}, filter) {
        commit(types.SET_DASHBOARD_FILTER, filter)
    }
}

const mutations = {
    [types.SET_DASHBOARD_FILTER] (state, filter) {
        let filterValue = Object.values(filter)

        if (filterValue.length && filterValue[0] === undefined) {
            // 组件摧毁了
            let key = Object.keys(filter)[0]
            delete state.cardFilters[key]
        } else {
            // 组件不需要参数的需要传入空对象（dashboard储存这部分数据）
            state.cardFilters = Object.assign({}, state.cardFilters, filter)
        }
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}

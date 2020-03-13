/**
 * @description 资源池 store
 * @author jia.lu
 */
import * as types from '../mutations_types'

const state = () => {
    return {
        selectedData: null
    }
}

const getters = {}

const actions = {
    setSelected ({commit, state}, selected) {
        commit(types.SET_SOURCE_POOL_CUR_SELECTED, selected)
    },

    clearSelected ({commit, state}) {
        commit(types.CLEAR_SOURCE_POOL_CUR_SELECTED)
    }
}

const mutations = {
    [types.SET_SOURCE_POOL_CUR_SELECTED] (state, selected) {
        state.selectedData = selected
    },
    [types.CLEAR_SOURCE_POOL_CUR_SELECTED] (state) {
        state.selectedData = null
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}

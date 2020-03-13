/**
 * @description 云厂商步骤状态管理模块
 */
import * as types from '../mutations_types'

const state = () => {
    return {
        form: {
            cur_step: 1,
            type: '',
            providers: []
        }
    }
}

const getters = {
    cloudProvider: state => state.form
}

const actions = {
    setCloudProvider ({commit, state}, form) {
        commit(types.SET_CLOUD_PROVIDER_STEP, form)
    }
}

const mutations = {
    [types.SET_CLOUD_PROVIDER_STEP] (state, form) {
        state.form.cur_step = form.cur_step
        state.form.type = form.type
        if (form.providers)
            state.form.providers = form.providers
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}

/**
 *
 * 个人中心 store
 *
 * @description
 * @author jia.lu
 */
import * as types from '../mutations_types'
import Api from '@api'

const state = () => {
    return {
        // 工单全局参数
        wsParams: {
            // 工单
            ready: false,
            types: [],
            urgency: [],
            // 角色
            roleReady: false,
            roleList: [],
            // 用户的ucmp角色
            userRoleReady: false,
            userRole: {}
        }
    }
}

const getters = {
    wsReady: state => state.wsParams.ready,
    wsTypes: state => state.wsParams.types,
    wsUrgency: state => state.wsParams.urgency,
    wsRoleReady: state => state.wsParams.roleReady,
    wsRoleList: state => state.wsParams.roleList,
    wsUserRoleReady: state => state.wsParams.userRoleReady,
    wsUserRole: state => state.wsParams.userRole
}

const actions = {
    getGlobalWorkSheet ({commit, state}, clearCache = false) {
        // 只在进入工单index页面时调取一次，修改工单全局参数时强制调取一次
        if (state.wsParams.ready && !clearCache) return

        Api.get('getDictByCode', {code: 'ticket_type'}).then(res => {
            commit(types.SET_GLOBAL_PARAM_WORKSHEET, res)
        }).catch(e => {
            console.warn('store:work sheet get global params error')
        })
    },

    getRoleList ({commit, state}, clearCache = false) {
        if (state.wsParams.roleReady && !clearCache) return

        let params = {limit: 999999, page: 1, project_id: localStorage.getItem('tenant')}
        Api.get('roleList', params, true).then(res => {
            commit(types.SET_WORKSHEET_ROLE_LIST, res.data)
        }).catch(e => {
            console.warn('store:work sheet get role list error')
        })
    },

    getUserRole ({commit, state}, clearCache = false) {
        if (state.wsParams.userRoleReady && !clearCache) return

        const roleParams = {
            user_id: localStorage.getItem('userId')
        }
        Api.get('userRoles', roleParams, true).then(res => {
            commit(types.SET_USER_ROLE, res.data)
        }).catch(e => {
            console.warn('store:work sheet get user role error')
        })
    }
}

const mutations = {
    [types.SET_GLOBAL_PARAM_WORKSHEET] (state, data) {
        state.wsParams.ready = true
        state.wsParams.types = data.accessPermissions || []
        state.wsParams.urgency = data.general || []
    },

    [types.SET_WORKSHEET_ROLE_LIST] (state, data) {
        state.wsParams.roleReady = true
        state.wsParams.roleList = data.roles
            .filter(item => item.platform_name === 'ucmp')
            .map(item => {
                return {label: item.name, value: item.id}
            })
    },

    [types.SET_USER_ROLE] (state, data) {
        state.wsParams.userRoleReady = true
        state.wsParams.userRole = data || {}
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}

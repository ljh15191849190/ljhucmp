import * as types from '../mutations_types'
/**
 * @description 控制台当前服务当前配置 metadata|front-end config
 * @author xinghua.wen
 *
 */
const state = () => {
    return {
        serviceInstance: {
            checkedMetadata: {}, // 控制台当前选中的服务对应的元数据
            instanceConfig: {}, // 控制台当前选中的服务对应前端设置
            groupActions: {},
            basicDetailGroup: [],
            checkedInstanceId: '',
            checkedProviderId: '',
            selectedInstanceInfo: null, // 当前选中的实例详情
            btnOperatorSuccess: false, // 操作按钮是否操作成功，成功后刷新服务实例详情
            selectedInstancephyInfo: null
        }
    }
}

const getters = {
    checkedMetadata: state => state.serviceInstance.checkedMetadata,
    instanceConfig: state => state.serviceInstance.instanceConfig,
    groupActions: state => state.serviceInstance.groupActions,
    basicDetailGroup: state => state.serviceInstance.basicDetailGroup,
    checkedInstanceId: state => state.serviceInstance.checkedInstanceId,
    checkedProviderId: state => state.serviceInstance.checkedProviderId,
    // bug UCMP-862【云主机】云主机详情页面，云主机状态在开机后没有实时刷新
    btnOperatorSuccess: state => state.serviceInstance.btnOperatorSuccess,
    selectedInstanceInfo: state => state.serviceInstance.selectedInstanceInfo,
    selectedInstancephyInfo: state => state.serviceInstance.selectedInstancephyInfo
}

const actions = {
    setCheckedMetadata ({commit, state}, metadata) {
        commit(types.SET_CHECKED_METADATA, metadata)
    },
    setInstanceConfig ({commit, state}, config) {
        commit(types.SET_INSTANCE_CONFIG, config)
    },
    setGroupActions ({commit, state}, actions) {
        commit(types.SET_GROUP_ACTIONS, actions)
    },
    setBasicDetailGroup ({commit, state}, group) {
        commit(types.SET_BASIC_DETAIL_GROUP, group)
    },
    setCheckedInstanceId ({commit, state}, id) {
        commit(types.SET_CHECKED_INSTANCE_ID, id)
    },
    setCheckedProviderId ({commit, state}, id) {
        commit(types.SET_CHECKED_PROVIDER_ID, id)
    },
    // bug UCMP-862【云主机】云主机详情页面，云主机状态在开机后没有实时刷新
    setOperatorSuccess ({ commit, state }, isOperator) {
      commit(types.SET_OPERATOR_SUCCESS, isOperator)
    },
    setSelectedInstanceInfo ({ commit }, instanceInfo) {
        commit(types.SET_INSTANCE_INFO, instanceInfo)
    },
    setSelectedInstancephyInfo ({ commit }, instanceInfo) {
        commit(types.SET_PHYSICAL_INSTANCE_INFO, instanceInfo)
    }
}

const mutations = {
    [types.SET_INSTANCE_CONFIG] (state, config) {
        state.serviceInstance.instanceConfig = config
    },
    [types.SET_CHECKED_METADATA] (state, metadata) {
        state.serviceInstance.checkedMetadata = metadata
    },
    [types.SET_GROUP_ACTIONS] (state, actions) {
        state.serviceInstance.groupActions = actions
    },
    [types.SET_BASIC_DETAIL_GROUP] (state, group) {
        state.serviceInstance.basicDetailGroup = group
    },
    [types.SET_CHECKED_INSTANCE_ID] (state, id) {
        state.serviceInstance.checkedInstanceId = id
    },
    // bug UCMP-862【云主机】云主机详情页面，云主机状态在开机后没有实时刷新
    [types.SET_OPERATOR_SUCCESS] (state, isOperator) {
        state.serviceInstance.btnOperatorSuccess = isOperator
    },
    [types.SET_CHECKED_PROVIDER_ID] (state, id) {
        state.serviceInstance.checkedProviderId = id
    },

    [types.SET_INSTANCE_INFO] (state, instanceInfo) {
        state.serviceInstance.selectedInstanceInfo = instanceInfo
    },
    [types.SET_PHYSICAL_INSTANCE_INFO] (state, instanceInfo) {
        state.serviceInstance.selectedInstancephyInfo = instanceInfo
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}

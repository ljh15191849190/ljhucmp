import * as types from '../mutations_types'

const state = () => {
    return {
        system: {
            name: '企业通用云管理平台',
            platform: {}, //此平台app信息
            carShow: false,
            ucmpNavList: [], // 导航栏列表
            showNavBar: true, // 左侧导航栏显示状态
            metadata: [], // 元数据
            activedNavIndex: '',
            bigScreenDefine: null, // 大屏自定义URL
            metadataApplyPrivileges: [], // 当前用户的所有服务可申请属性列表
            menuMetadataPromise: null, // 菜单获取metadata的promise
            businessOrproject: ''
        }
    }
}

const getters = {
    sysName: state => state.system.name,
    platform: state => state.system.platform,
    carShow: state => state.system.carShow,
    showNavBar: state => state.system.showNavBar,
    metadata: state => state.system.metadata,
    ucmpNavList: state => state.system.ucmpNavList,
    activedNavIndex: state => state.system.activedNavIndex,
    bigScreenDefine: state => state.system.bigScreenDefine,
    metadataApplyPrivileges: state => state.system.metadataApplyPrivileges,
    menuMetadataPromise: state => state.system.menuMetadataPromise,
    businessOrproject: state => state.system.businessOrproject
}

const actions = {
    setSysName ({commit, state}, name) {
        commit(types.SET_SYS_NAME, name)
    },
    setPlatform ({commit, state}, platform) {
        commit(types.SET_PLATFORM, platform)
    },
    setCarShow ({commit, state}, status) {
        commit(types.SET_CAR_SHOW, status)
    },
    setNavBarDisplay ({commit, state}, status) {
        commit(types.SET_NAVBAR_DISPLAY, status)
    },
    setMetaData ({commit, state}, metadata) {
        commit(types.SET_METADATA, metadata)
    },
    updateMetaData ({commit, state}, extendMetadata) {
        commit(types.UPDATE_METADATA, extendMetadata)
    },
    deleteMetadata ({commit, state}, delMetadata) {
        commit(types.DELETE_METADATA, delMetadata)
    },
    setUcmpNavList ({commit, state}, list) {
        commit(types.SET_UCMP_NAV_LIST, list)
    },
    setActivedNavIndex ({commit, state}, list) {
        commit(types.SET_ACTIVED_NAV_INDEX, list)
    },
    setBigScreenDefine ({commit, state}, url) {
        commit(types.SET_BIG_SCREEN_URL, url)
    },
    setMetadataApplyPrivileges ({commit, state}, list) {
        commit(types.SET_METADATA_APPLY_PRIVILEGES, list)
    },
    setMenuMetadataPromise ({commit, state}, promise) {
        commit(types.SET_MENU_METADATA_PROMISE, promise)
    },
    setBusinessOrproject ({commit, state}, status) {
        commit(types.SET_BUSINESSORPROJECT_TYPE, status)
    }
}

const mutations = {
    [types.SET_SYS_NAME] (state, name) {
        state.system.name = name
    },
    [types.SET_PLATFORM] (state, platform) {
        state.system.platform = platform
    },
    [types.SET_CAR_SHOW] (state, status) {
        state.system.carShow = status
    },
    [types.SET_NAVBAR_DISPLAY] (state, status) {
        state.system.showNavBar = status
    },
    [types.SET_METADATA] (state, metadata) {
        state.system.metadata = metadata
    },
    [types.UPDATE_METADATA] (state, metadata) {
        if (state.system.metadata) {
            let editMetadataIndex = state.system.metadata.findIndex(item => item.service_code === metadata.service_code)
            if (editMetadataIndex !== -1)
                state.system.metadata.splice(editMetadataIndex, 1, metadata)
            else
                state.system.metadata.push(metadata)
        }
    },
    [types.DELETE_METADATA] (state, delMetadata) {
        if (Array.isArray(state.system.metadata))
            state.system.metadata = state.system.metadata.filter(item => item.service_code !== delMetadata)
    },
    [types.SET_UCMP_NAV_LIST] (state, list) {
        state.system.ucmpNavList = list
    },
    [types.SET_ACTIVED_NAV_INDEX] (state, index) {
        state.system.activedNavIndex = index
    },
    [types.SET_BIG_SCREEN_URL] (state, url) {
        state.system.bigScreenDefine = url
    },
    [types.SET_METADATA_APPLY_PRIVILEGES] (state, list) {
        state.system.metadataApplyPrivileges = list.map(
            service => {
                return {
                    service_code: service.service_code,
                    attributes: !Array.isArray(service.attributes) ? [] : service.attributes,
                    config: service.config
                }
            }
        )
    },
    [types.SET_MENU_METADATA_PROMISE] (state, promise) {
        state.system.menuMetadataPromise = promise
    },
    [types.SET_BUSINESSORPROJECT_TYPE] (state, status) {
        state.system.businessOrproject = status
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}

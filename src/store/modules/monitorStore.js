// 监控告警状态管理模块
import * as types from '../mutations_types'

const state = () => {
    return {
        resourceTypeMap: null
    }
}

const getters = {
    resourceTypeMap: state => state.resourceTypeMap
}

const actions = {
    setResourceTypeMap ({commit, state}, resourceMap) {
        commit(types.SET_MONITOR_RESOURCE_MAP, resourceMap)
    },
    setResourceMetricTypeMap ({commit, state}, resourceMap) {
        commit(types.SET_MONITOR_RESOURCE_METRIC_MAP, resourceMap)
    },
    setResourceMetricTypeMapItem ({commit, state}, metricMap) {
        commit(types.SET_MONITOR_RESOURCE_METRIC_MAP_ITEM, metricMap)
    }
}

const mutations = {
    [types.SET_MONITOR_RESOURCE_MAP] (state, map) {
        // 告警监控对象类型中不要 【全部】 类型
        state.resourceTypeMap = map.filter(item => item.value)
    },
    // 设置监控对象类型下的指标参数
    [types.SET_MONITOR_RESOURCE_METRIC_MAP] (state, resourceMap) {
        // state.metricTypes = metric
        Object.keys(resourceMap).forEach(key => {
            let currentResource = state.resourceTypeMap.find(item => (item.value).toString() === (key).toString())
            if (currentResource) {
                currentResource.metricType = []
                Object.keys(resourceMap[key]).forEach(type_item_key => {
                    currentResource.metricType.push({
                        label: resourceMap[key][type_item_key], value: type_item_key
                    })
                })
            }
        })
    },
    [types.SET_MONITOR_RESOURCE_METRIC_MAP_ITEM] (state, metricMap) {
        let currentResource = state.resourceTypeMap.find(item => (item.value).toString() === (metricMap.resource_type).toString())
        if (currentResource.metricType) {
            let currentMetric = currentResource.metricType.find(metric_item => metric_item.value === metricMap.metric_type)
            currentMetric && (currentMetric.subList = metricMap.data)
        }
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}

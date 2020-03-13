
import * as types from '../mutations_types'

const state = () => {
    return {
        allResourceAttrs: {},
        formDataAndDisplay: {},
        resources: [],
        dependencies: [],
        blueprintForm: {}
    }
}

const getters = {
    allResourceAttrs: state => state.allResourceAttrs,
    formDataAndDisplay: state => state.formDataAndDisplay,
    bpResources: state => state.resources,
    bpDependencies: state => state.dependencies,
    bpForm: state => state.blueprintForm
}

const actions = {
    setAllResourceAttrs ({commit, state}, attrs) {
        commit(types.SET_ALL_RESOURCE_ATTRS, attrs)
    },
    setFormDataAndDisplay ({commit, state}, attrs) {
        commit(types.SET_FORM_DATA_AND_DISPLAY, attrs)
    },
    setBpResources ({commit, state}, attrs) {
        commit(types.SET_BP_RESOURCES, attrs)
    },
    setBpDependencies ({commit, state}, attrs) {
        commit(types.SET_BP_DEPENDENCIES, attrs)
    },
    setBpForm ({commit, state}, form) {
        commit(types.SET_BP_FORM, form)
    }
}

const mutations = {
    [types.SET_ALL_RESOURCE_ATTRS] (state, attrs) {
        state.allResourceAttrs = attrs
    },
    [types.SET_FORM_DATA_AND_DISPLAY] (state, attrs) {
        state.formDataAndDisplay = attrs
    },
    [types.SET_BP_RESOURCES] (state, resources) {
        state.resources = resources
    },
    [types.SET_BP_DEPENDENCIES] (state, dependencies) {
        state.dependencies = dependencies
    },
    [types.SET_BP_FORM] (state, form) {
        state.blueprintForm = form
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}

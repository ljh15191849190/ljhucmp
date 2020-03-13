import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions'
import * as getters from './getters'
import applyBlueprint from './modules/applyBlueprint'
import system from './modules/system'
import cloudProvider from './modules/cloudProvider'
import sourcePool from './modules/sourcePool'
import serviceInstance from './modules/serviceInstance'
import costAnalysis from './modules/costAnalysis'
import shopCar from './modules/shopCar'
import monitorStore from './modules/monitorStore'
import common from './modules/common'
import dashboard from './modules/dashboard'
import storeStatic from './modules/storeStatic'
import storeUserCenter from './modules/storeUserCenter'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
    actions,
    getters,
    modules: {
        applyBlueprint,
        system,
        cloudProvider,
        sourcePool,
        serviceInstance,
        costAnalysis,
        shopCar,
        monitorStore,
        common,
        dashboard,
        storeStatic,
        storeUserCenter
    },
    strict: debug
})

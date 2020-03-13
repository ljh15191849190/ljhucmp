import Vue from 'vue'
import Router from 'vue-router'
import Login from './login'
import Catalog from './catalog.module'
import ConsoleDesk from './console.module'
import statistics from './statistics.module'
import applCenter from './applCenter.module'
import operMgmt from './operMgmt.module'
import userCenter from './userCenter.module'
import system from './system.module'
import devCenter from './devCenter.module'
import Iaas from './iaas.module'
import monitorAlarm from './monitorAlarm.module'
import {externalRouter, initWebSocket} from '@leaptocloud/standard-ui'
import store from '@/store'
import * as types from '@/store/mutations_types'
import {MULTI_PATH_RULE, FILTER_PATH} from '@mock/router/multiplePath.reg'
import {Notification} from 'element-ui'

Vue.use(Router)

const router = new Router({
    routes: Login.concat(ConsoleDesk).concat(Catalog).concat(Iaas).concat(statistics).concat(applCenter).concat(userCenter).concat(system).concat(devCenter).concat(operMgmt).concat(monitorAlarm).concat([externalRouter])
})

// 扁平化所有路由
let routeFlat = getRoutes()
function getRoutes () {
    let arr = []
    router.options.routes.forEach(item => {
        arr.push(item)
        getChildRoutes(arr, item.children)
    })

    return arr
}

function getChildRoutes (arr, children) {
    if (!children) return

    children.forEach(item => {
        arr.push(item)
        getChildRoutes(arr, item.children)
    })
}

router.beforeEach(async (to, from, next) => {
    // 保证在进入页面之前，全局参数已经初始化完毕
    let token = localStorage.getItem('authenticationToken')
    if (token && to.path !== '/login') {
        let systemConfig = store.state.common.globalParam.systemConfig
        if (!systemConfig.configure_template)
            await store.dispatch('getSystemConfig')
    }
    let licenseAuth = localStorage.getItem('ucmp_license')
    if (licenseAuth && licenseAuth !== 'active') {
        let matchRouteInfo = routeFlat.find(item => item.name === to.name)

        if (matchRouteInfo && matchRouteInfo.authority && matchRouteInfo.authority.license) {
            // 页面不允许进入
            if (matchRouteInfo.authority.license.indexOf('forbid') > -1) {
                Notification.warning({
                    title: '温馨提示：',
                    message: '证书过期, 请联系管理员!'
                })

                next(from.fullPath)
            } else
                next()
        } else
            next()
    } else
        next()
})

router.afterEach((to, from) => {
    // 保存当前路由信息, 保留 root_path '/'不使用，规避刷新后默认进入根路径的问题
    let fullPath = to.fullPath
    if (to.fullPath !== '/') {
        if (fullPath.match(/\/external\?site\=/))
            fullPath = fullPath.replace(/\%2F/g, '/').replace(/\%3A/g, ':').replace(/\%23/g, '#').replace(/\%2B/g, '+').replace(/\%20/g, ' ').replace(/\%26/g, '&').replace(/\%3D/g, '=').replace(/\%3F/g, '?')
        sessionStorage.setItem('selectedMenu', fullPath)
    }
    // 针对当前路由配置左侧菜单高亮条目
    let matched = fullPath.match(MULTI_PATH_RULE)
    if (!matched)
        store.commit(types.SET_ACTIVED_NAV_INDEX, fullPath)
    else {
        // 鉴别特殊路由（菜单与多个实际的路由映射），匹配上的路由设置为统一的路由，以便菜单能够高亮
        let filteredPath = fullPath.match(FILTER_PATH)
        if (filteredPath && filteredPath.length)
            store.commit(types.SET_ACTIVED_NAV_INDEX, filteredPath[0])
        else
            store.commit(types.SET_ACTIVED_NAV_INDEX, fullPath)
    }

    if (fullPath !== '/login' && !window.websocketClient)
        window.websocketClient = initWebSocket({token: localStorage.getItem('authenticationToken'), disableDebug: process.env.NODE_ENV === 'development'})
    else if (fullPath === '/login' && window.websocketClient) {
        window.websocketClient.deactivate && window.websocketClient.deactivate()
        window.websocketClient = null
    }
})

export default router

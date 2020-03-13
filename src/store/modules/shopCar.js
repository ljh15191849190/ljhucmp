import * as types from '../mutations_types'

/**
 * @description 购物车
 */
const systemUserName = localStorage.getItem('systemUserName')
const shopCarCacheName = 'shop_car_list-' + systemUserName
const state = () => {
    return {
        shopCarList: localStorage.getItem(shopCarCacheName) ? JSON.parse(localStorage.getItem(shopCarCacheName)) : []
    }
}

const getters = {
    shopCarList: state => state.shopCarList,
    shopCarCount: state => state.shopCarList.length
}

const actions = {
    addShopCar ({commit, state}, item) {
        commit(types.ADD_SHOP_CAR, item)
    },

    deleteShopCar ({commit, state}, index) {
        commit(types.DELETE_SHOP_CAR, index)
    }
}

const mutations = {
    [types.ADD_SHOP_CAR] (state, item) {
        if (isArray(item)) state.shopCarList = [...state.shopCarList, ...item]
        else state.shopCarList.push(item)

        setLocalShopList(state.shopCarList)
    },

    [types.DELETE_SHOP_CAR] (state, delIndex) {
        if (isArray(delIndex)) {
            state.shopCarList = state.shopCarList.filter((item, index) => {
                return delIndex.indexOf(index) === -1
            })
        } else state.shopCarList.splice(delIndex, 1)

        setLocalShopList(state.shopCarList)
    }
}

/**
 * @description 本地存储 登录名对应的 购物车信息
 * @param list
 */
function setLocalShopList (list) {
    localStorage.setItem(shopCarCacheName, JSON.stringify(list))
}

function isArray (data) {
    const type = Object.prototype.toString.call(data)
    return type === '[object Array]'
}

export default {
    state,
    getters,
    actions,
    mutations
}

import {Validator} from 'vee-validate'
import Api from '@api'

const customArray = (value, args) => {
    if (!value.length)
        return false

    return true
}
const customRegex = (value, [pattern, msg, ...flags]) => {
    if (pattern instanceof RegExp)
        return pattern.test(value)

    return new RegExp(pattern, flags).test(String(value))
}

/**
 * oracle 关联 nas 的最小值验证计算
 * @param value
 * @param min
 * @param formData
 * @returns {boolean}
 */
const nasMin = (value, [min, formData, unit]) => {
    let size, size_unit
    for (let [key, value] of Object.entries(formData)) {
        if (key.split('@')[1] === 'size')
            size = value
        if (key.split('@')[1] === 'size_unit')
            size_unit = value
    }

    if (!size_unit || !size)
        return false

    // UCMP3-803 【蓝图编排】在蓝图处申请nas的时候，提示最小大小为10G，这个逻辑不对，如果单独申请nas的话，只要不小于20M就可以申请了
    let minMB = 20 // 都统一单位以mb来验证
    switch (unit) {
        case 'MB': {
            minMB = min
            break
        }
        case 'GB': {
            minMB = min * 1024
            break
        }
        case 'TB': {
            minMB = min * 1024 * 1024
            break
        }
        case 'PB': {
            minMB = min * 1024 * 1024 * 1024
            break
        }
    }

    // 根据单位计算nas最小值
    switch (size_unit) {
        case 'mb':
            return size >= minMB
        case 'gb':
            return size * 1024 >= minMB
        case 'tb':
            return size * 1024 * 1024 >= minMB
        case 'pb':
            return size * 1024 * 1024 * 1024 >= minMB
        default:
            return false
    }
}

const qingcloudParameterGroup = (value, versions, list, parameter_group_id_key, family_key) => {
    let groupIds = list.map(
        item => {
            return item[parameter_group_id_key]
        }
    )
    // eslint-disable-next-line
    if (!Array.isArray(value) || value.length !== versions.length)
        return false
    // 查找当前值的数据库类型
    let families = []
    value.forEach(
        item => {
            let index = groupIds.indexOf(item)
            if (index !== -1)
                families.push(list[index][family_key])
        }
    )
    let filteredFamilies = Array.from(new Set(families))

    return filteredFamilies.length === versions.length
}

// UCMP3-UCMP3-834 青云关系型数据库的配置组移至基础配置
const rdbParameterGroup = (value, [list, msg]) => {
    const rdbVersions = ['mysql5.5', 'mysql5.6', 'mysql5.7', 'psql9.3', 'psql9.4']
    return qingcloudParameterGroup(value, rdbVersions, list, 'parameter_group_id', 'family')
}

// 青云缓存的配置组移至基础配置
const cacheParameterGroup = (value, [list, msg]) => {
    const cacheVersions = ['redis2.8.17', 'redis3.0.5', 'memcached1.4.13']
    return qingcloudParameterGroup(value, cacheVersions, list, 'cache_parameter_group_id', 'cache_type')
}

/**
 * @description 比较ip大小
 * @returns 如果大于，返回1，等于返回0，小于返回-1
 */
function compareIp (first_ip, last_ip) {
    let first_ipArr = first_ip.split('.')
    let last_ipArr = last_ip.split('.')
    for (let i = 0; i < 4; i++) {
        if (Number(first_ipArr[i]) > Number(last_ipArr[i]))
            return 1
        else if (Number(first_ipArr[i]) < Number(last_ipArr[i]))
            return -1
    }

    return 0
}
/**
 * 配置模板、审批等 检验IP有效段
 * @param value
 * @param startIP
 * @param endIP
 * @returns {boolean}
 */
const validIPRange = (value, [startIP, endIP]) => {
    if (compareIp(value, startIP) >= 0 && compareIp(value, endIP) <= 0) return true
    return false
}

/**
 * 脚本中coombinedItem组件下多参数不能重名校验规则
 * @param {*} value 当前值
 * @param {*} relyParams 当前值依赖
 * @param {*} group 已有的值集合
 */
const customIncludes = (value, [group, relyParams]) => {
    if (relyParams)
        return !group.includes(value + relyParams)
    else
        return !group.includes(value)
}

/**
 * 通过后端Api接口校验给定值是否重复
 * @param {*} value 
 * @param {*} param1 
 */ 
const backendRepetition = (value, [url, matchRule, name]) => {
    let params = {}
    params[name] = value
    return Api.get(url, params, {}).then(
        res => {
            let value = res
            let rules = matchRule.split('.')
            for (let index = 0; index < rules.length; index++) {
                if (!value[rules[index]]) return {valid: true}
                else value = value[rules[index]]

                if (index === rules.length - 1) return {valid: false}
            }
        }
    )
}

const backendNormal = (value, [url, matchRule, name]) => {
    let params = {}
    params[name] = value
    return Api.get(url, params, {}).then(
        res => {
            return res
        }, () => {
            return {valid: false}
        }
    )
}

/**
 * @description UCMP3-2217 密码与确认密码一致校验
 * @param {*} value 
 * @param {*} param1 
 */
const keepSamePassword = (value, [confirmValue, confirmField]) => {
    return value === confirmValue
}
Validator.extend('array', customArray)
Validator.extend('customRegex', customRegex)
Validator.extend('nasMin', nasMin)
Validator.extend('rdbParameterGroup', rdbParameterGroup)
Validator.extend('cacheParameterGroup', cacheParameterGroup)
Validator.extend('validIPRange', validIPRange)
Validator.extend('customIncludes', customIncludes)
Validator.extend('backendRepetition', backendRepetition)
Validator.extend('keepSamePassword', keepSamePassword)
Validator.extend('backendNormal', backendNormal)

export default Validator

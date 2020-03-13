import * as CONF_PARAMS from './ConstParams'
import dateUtils from '@server/date-utils'

// 申请单状态
const FormatOrderStatus = status => {
    return CONF_PARAMS.StatusMap[status] ? CONF_PARAMS.StatusMap[status].label : status
}

// 申请单类型
const FormatOrderType = (type, typeList) => {
    if (!typeList)
        return CONF_PARAMS.OrderTypeMap[type] || type
    else if (Array.isArray(typeList)) {
        let paramsObj = {}
        typeList.forEach(type => {
            paramsObj[type.value] = type.label
        })
        return paramsObj[type] || type
    }
    return type
}

// 申请单等级
const FormatOrderLevel = level => {
    return CONF_PARAMS.UrgencyLevelsMap[level] || '--'
}

// 告警等级
const FormatAlarmLevel = (level) => {
    let conf = CONF_PARAMS.AlarmLevel.find(item => item.value === level)
    return conf ? conf.label : '其他'
}

// 时间
const FormatTime = time => {
    if (isNaN(Number(time)))
        return dateUtils.formate((new Date(time)).getTime())
    else
        return dateUtils.formate((new Date(Number(time))).getTime())
}

// 告警类型
const FormatAlertType = type => {
    let conf = CONF_PARAMS.AlarmType.find(conf => {
        return conf.value === type
    }) || {}
    return conf.label
}

// 组织机构、应用、个人
const TranslateOrgApp = type => {
    return (CONF_PARAMS.ResourceBelongs[type] || {})['label'] || type
}

export default {
    FormatOrderStatus,
    FormatOrderType,
    FormatOrderLevel,
    FormatAlarmLevel,
    FormatTime,
    FormatAlertType,
    TranslateOrgApp
}

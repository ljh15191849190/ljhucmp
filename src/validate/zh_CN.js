const messages = {
    required: (field) => `${field}不能为空.`,
    array: (field) => ` ${field}不能为空`,
    customRegex: (field, [pattern, msg]) => ` ${(msg ? msg : '请输入正确的' + field)}.`,
    nasMin: (field, [min, formData, unit]) => ` ${field}不能小于:${min} ${unit}`,
    rdbParameterGroup: (field, [pattern, msg]) => ` ${(msg ? msg : '每个关系型数据库版本必须且最多选择一个' + field)}.`,
    cacheParameterGroup: (field, [pattern, msg]) => ` ${(msg ? msg : '每个缓存版本必须且最多选择一个' + field)}.`,
    validIPRange: (field, [startIP, endIP]) => ` 请输入有效的${field}: (${startIP} ~ ${endIP})`,
    customIncludes: (field, [pattern, relyParams, msg]) => `${(msg ? msg : field + '不能重复。')}`,
    is: (field, [pattern, msg]) => `${(msg ? msg : '请确认' + field + '是否正确？')}`,
    backendRepetition: (field, [startIP, endIP]) => ` 已存在相同的${field}，请修改`,
    keepSamePassword: (field, [confirmValue, confirmField]) => ` ${field}与${confirmField}不一致，请修改`,
    backendNormal: (field, [startIP, endIP]) => ` ${field}无效`
}

const locale = {
    name: 'zh_CN',
    messages,
    attributes: {}
}

export default locale

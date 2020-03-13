import Vue from 'vue'

// 首字母转大写
Vue.filter('uppercase', value => {
    if (!value) return ''
    value = value.toString()
    return value.charAt(0).toUpperCase() + value.slice(1)
})

// 单词转小写
Vue.filter('toLowerCase', value => {
    if (!value) return ''
    return value.toLowerCase()
})

// 过滤时间戳为 指定格式
Vue.filter('filterDate', (value, args) => {
    if (!value) return ''
    // console.log(args)
    var time = new Date(value)
    switch (args) {
        case 'y-m-d':
            return `${time.getFullYear()}-${time.getMonth() +
                1}-${time.getDate()}`
        default:
            return `${time.getFullYear()}-${time.getMonth() +
                1}-${time.getDate()} ${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`
    }
})

// 取小数点后 space 位
Vue.filter('floatingSpace', (value, space) => {
    return Number(value).toFixed(space)
})

// 将UTC时间转为固定时间格式
Vue.filter('timeFormat', (value, fmt) => {
    let date = new Date(value)
    let o = {
        'M+': date.getMonth() + 1, //月份
        'd+': date.getDate(), //日
        'h+': date.getHours(), //小时
        'm+': date.getMinutes(), //分
        's+': date.getSeconds(), //秒
        'q+': Math.floor((date.getMonth() + 3) / 3), //季度
        S: date.getMilliseconds() //毫秒
    }
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
    for (var k in o) {
        if (new RegExp('(' + k + ')').test(fmt))
            fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length))
    }
    return fmt
})

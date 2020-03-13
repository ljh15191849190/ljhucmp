class DateUtils {
    /**
     * UTC转换时间格式
     * @param {*} date 
     * @param {*} formateStr 
     */
    formate (date, formateStr = 'yyyy-MM-dd  hh:mm:ss', isNeed) {
        let timestrap = typeof date === 'number' ? date : date - '0'
        if (isNeed)
            timestrap = timestrap * 1000
        timestrap = new Date(timestrap)
        const o = {
            'M+': timestrap.getMonth() + 1,                    //月份
            'd+': timestrap.getDate(),                         //日
            'h+': timestrap.getHours(),                        //小时
            'm+': timestrap.getMinutes(),                      //分
            's+': timestrap.getSeconds(),                      //秒
            'q+': Math.floor((timestrap.getMonth() + 3) / 3),  //季度
            'S': timestrap.getMilliseconds()                   //毫秒
        }
        if (/(y+)/.test(formateStr))
            formateStr = formateStr.replace(RegExp.$1, (timestrap.getFullYear() + '').substr(4 - RegExp.$1.length))
        for (let k in o) {
            if (new RegExp('(' + k + ')').test(formateStr))
                formateStr = formateStr.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
        }
        return formateStr
    }

    /**
     * 通过年份和月份计算该月有多少天
     */
    getMonthOfDays (year, month) {
        let days = 0
        //当月份为二月时，根据闰年还是非闰年判断天数
        if (month === 2) {
            days =
                (year % 4 === 0 && year % 100 === 0 && year % 400 === 0) ||
                    (year % 4 === 0 && year % 100 !== 0)
                    ? 28
                    : 29
        } else if (
            month === 1 ||
            month === 3 ||
            month === 5 ||
            month === 7 ||
            month === 8 ||
            month === 10 ||
            month === 12
        ) {
            //月份为：1,3,5,7,8,10,12 时，为大月.则天数为31；
            days = 31
        } else {
            //其他月份，天数为：30.
            days = 30
        }

        return days
    }

    /**
    * @description 通过传入的时间和未来的月数计算天数
    * @param[time]当前时间; [years]据传入的时间后年数; [months]据传入的时间后的月数
    */
    getDaysByNestMonths (time, years, months) {
        if (!time || !months) return 0

        // 1. 获取据当前年份后n年的年份
        let nextYear = null
        let startDate = new Date(time)
        // 当前开始月份
        let startMonth = startDate.getMonth() + 1
        if (years < 1)
            nextYear = startDate.getFullYear()
        else
            nextYear = startDate.getFullYear() + years

        let days = 0, month = startMonth
        // 2. 计算当前日期后n月一共拥有的天数
        for (let index = 1; index <= months; index++) {
            if (month === 12)
                month = 1
            else
                month = month + 1
            days += this.getMonthOfDays(nextYear, month)
        }

        return days
    }
}

export default new DateUtils()

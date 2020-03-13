import Utils from '@server/date-utils'

/**
 * 云桌面，云应用相关统计 mixin
 */
export default {
    data () {
        return {
            pickerOptions: {
                disabledDate (time) {
                    return time.getTime() > Date.now()
                }
            }
        }
    },
    methods: {
        getDateRange (before = 7) {
            const format = 'yyyy-MM-dd'
            const beforeTime = before * 24 * 60 * 60 * 1000 // 7天前
            const today = Utils.formate(new Date(), format)
            const monthBeforeToday = Utils.formate(new Date().getTime() - beforeTime, format)
            return [monthBeforeToday, today]
        },

        getCurMonthRange () {
            const format = 'yyyy-MM-dd'
            const today = Utils.formate(new Date(), format)
            const curMonthFirstDay = Utils.formate(new Date().setDate(1), format)

            return [curMonthFirstDay, today]
        }
    }
}

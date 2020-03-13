import Utils from '@server/date-utils'

/**
 * 台账mixin
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
        getCurMonthRange () {
            const format = 'yyyy-MM-dd'
            const today = Utils.formate(new Date(), format)
            const curMonthFirstDay = Utils.formate(new Date().setDate(1), format)

            return [curMonthFirstDay, today]
        }
    },
    filters: {
        dateSubstring (val) {
            return val.substring(0, val.indexOf('.'))
        },

        dateFormat (val) {
            return Utils.formate(val, 'yyyy-MM-dd')
        }
    }
}

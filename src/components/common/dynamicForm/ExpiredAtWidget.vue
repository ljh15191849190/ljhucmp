<template lang="pug">
div
    el-radio-group.d-flex(
        v-model="radioValue"
        :class="{'is-danger': errors.has('expired_at')}"
        v-validate="radioRule"
        name="expired_at"
        data-vv-as="租期"
        size="mini"
        )
        el-radio-button(v-for="radio in calcalatedList" :key="radio.id" :label="radio.id") {{ radio.name }}
        el-date-picker.custom-expired(
            v-model="expired_at"
            type="date"
            placeholder="自定义"
            value-format="timestamp"
            :editable="1 === 2"
            :picker-options="pickerOptions"
            :default-value="innerStart"
            @change="customValue"
            v-validate="datePickerRule"
            name="expired_at"
            data-vv-as="租期"
            :class="{'active': !radioValue }"
            size="mini"
        )
    span.validator-error.is-danger(v-if="errors.has('expired_at')") {{ errors.first('expired_at') }}
</template>
<script>
/**
 * @description 租期选择组件 自带veevalidator 校验内容
 */
import { mapGetters } from 'vuex'
import DateUtils from '@server/date-utils'

export default {
    inject: ['$validator'],
    props: {
        value: Number,
        start: {
            type: [Number, String],
            default: new Date().getTime()
        }
    },

    data () {
        return {
            radioValue: 'one_month',
            expired_at: null,
            radioList: [
                { id: 'one_month', name: '1个月' },
                { id: 'two_month', name: '2个月' },
                { id: 'three_month', name: '3个月' },
                { id: 'half_year', name: '半年' },
                { id: 'one_year', name: '1年' },
                { id: 'two_year', name: '2年' },
                { id: 'three_year', name: '3年' }
            ]
        }
    },

    methods: {
        /**
         * @description 快捷方式计算得到准确时间戳
         */
        timestamp (val) {
            let rst = null, day = 3600 * 1000 * 24
            switch (val) {
                case 'one_month':
                    rst = this.correctiveStart + day * 30
                    break
                case 'two_month':
                    rst = this.correctiveStart + day * 30 * 2
                    break
                case 'three_month':
                    rst = this.correctiveStart + day * 30 * 3
                    break
                case 'half_year':
                    rst = this.correctiveStart + day * 30 * 6
                    break
                case 'one_year':
                    rst = this.correctiveStart + day * 365
                    break
                case 'two_year':
                    rst = this.correctiveStart + day * 365 * 2
                    break
                case 'three_year':
                    rst = this.correctiveStart + day * 365 * 3
                    break
            }
            return rst
        },
        customValue (val) {
            this.radioValue = val ? null : 'one_month'
            this.$emit('update:value', val)
        }
    },

    computed: {
        /**
         * 默认指定值
         */
        defaultValues () {
            return this.radioList.filter(item => item.id !== 'custom').map(item => item.id)
        },

        radioRule () {
            if (!this.value)
                return {required: true}
            return {}
        },

        datePickerRule () {
            if (!this.radioValue)
                return {required: true}
            return {}
        },

        /**
         * @description  根据租期最大值，适配不同的快捷方式列表
         */
        calcalatedList () {
            let radioList = JSON.parse(JSON.stringify(this.radioList))
            if (this.expiredAtMax < 12 && this.expiredAtMax >= 6)
                return radioList.splice(0, 4)
            else if (this.expiredAtMax > 3 && this.expiredAtMax < 6)
                return radioList.splice(0, 3)
            else if (this.expiredAtMax < 3)
                return radioList.splice(0, this.expiredAtMax)
            else if (this.expiredAtMax >= 12 && this.expiredAtMax < 24)
                return radioList.splice(0, 5)
            else if (this.expiredAtMax >= 24 && this.expiredAtMax < 36)
                return radioList.splice(0, 6)
            else if (this.expiredAtMax >= 36)
                return radioList
        },

        innerStart () {
            return this.start || new Date().getTime()
        },

        /**
         * @description 自定义租期设置项：禁用时间区域：昨天以前、超过租期最大值
         */
        pickerOptions () {
          let disabledDate = (time) => {
            let day = 3600 * 1000 * 24
            let hasYear = parseInt(this.expiredAtMax / 12)
            let hasMonth = this.expiredAtMax % 12
            return time.getTime() <= this.innerStart || time.getTime() > this.innerStart + day * 365 * hasYear + day * DateUtils.getDaysByNestMonths(this.innerStart, hasYear, hasMonth)
          }
          return { disabledDate }
        },
        expiredAtMax () {
            return this.tenancy && this.tenancy.maxTime ? this.tenancy.maxTime : 1
        },
        correctiveStart () {
            return this.innerStart + 1000 - 3600 * 1000 * 24
        },
        ...mapGetters([
            'tenancy'
        ])
    },

    watch: {
        radioValue (val) {
            if (this.defaultValues.indexOf(val) !== -1)
                this.$emit('update:value', this.timestamp(val))
        }
    },

    created () {
        this.$emit('update:value', this.timestamp(this.radioValue))
    }
}
</script>
<style lang="scss" scoped>
.custom-expired {
    width: 140px !important;
}
</style>
<style lang="scss">
.custom-expired {
    &.active input {
        border-color: $themeColor;
    }
}
</style>

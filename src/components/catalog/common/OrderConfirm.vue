<template lang="pug">
    div.order-confirm
        el-form-item.is-required(label="申请单优先级" v-if="order_level_display")
            el-radio-group(v-model="formData.urgency_level" size="small")
                el-radio-button(
                    v-for="level in levels"
                    :key="level.prop"
                    :label="level.prop"
                ) {{level.label}}
        el-form-item(label="期望完成时间" v-if="expected_time_display")
            el-date-picker(
                v-model="formData.expected_time"
                type="datetime"
                placeholder="选择日期时间"
                :picker-options="expireTimeOption")
        el-form-item(label="申请理由" :class="{'is-required': formData.urgency_level === 'high'}")
            //- bug UCMP-836 申请单管理，备注信息前端无校验，输入超过200字符，后台报错（数据库字符最大200）
            el-input.input-width(
              type="textarea"
              v-model="formData.memo"
              rows="8"
              :maxlength="memoConfig.maxLength"
              :placeholder="memoConfig.placeholder"
              v-validate="formData.urgency_level === 'high' ? 'required' : ''"
              name="memo"
              data-vv-as="申请理由"
              :class="{'is-danger': errors.has('memo')}"
            )
            span.validator-error.is-danger(v-if="errors.has('memo')") {{ errors.first('memo') }}
</template>

<script>
import Api from '@api'

export default {
    inject: ['$validator'],
    props: ['orderForm'],

    data () {
        return {
            levels: [
                { prop: 'low', label: '低' },
                { prop: 'medium', label: '中' },
                { prop: 'high', label: '高' }
            ],
            //- bug UCMP-836 申请单管理，备注信息前端无校验，输入超过200字符，后台报错（数据库字符最大200）
            memoConfig: {
              maxLength: 200,
              placeholder: '申请理由最多不能超过200个字符'
            },
            expireTimeOption: {
                disabledDate (date) {
                    let nowDate = new Date(Date.now())
                    let _year = nowDate.getFullYear()
                    let _month = nowDate.getMonth()
                    let _date = nowDate.getDate()
                    return date.getTime() < (new Date(_year, _month, _date)).getTime()
                }
            },
            expected_time_display: false,
            order_level_display: false
        }
    },

    computed: {
        formData: {
            get () {
                return this.orderForm
            },
            set (val) {
                this.$emit('update:orderForm', val)
            }
        }
    },

    created () {
        Api.get('getDictByCode', { code: 'expected_time_display' }).then(
            res => {
                this.expected_time_display = res.display
            }
        )
        Api.get('getDictByCode', { code: 'order_level_display' }).then(
            res => {
                if (!res.display) 
                    this.formData.urgency_level = ''
                this.order_level_display = res.display
            }
        )
    }
}
</script>

<style lang="scss" scoped>

</style>

<template lang="pug">
    el-dialog.conf-dialog(title="编辑条件" :visible.sync="configs.ShowdialogTable" width="680px")
        div.conf-content
            el-row
                el-col(:span="24")
                    span.margin-right
                        span.text-danger.margin-right *
                        | 周期:
                    el-input.input-width.margin-right(
                        type="text" name="intervalDays"
                        size="small"
                        v-model.number="sendParams.intervalDays" controls-position="right"
                        placeholder="请输入1-30范围内的正整数"
                        v-validate="rules.intervalDays"
                        :data-vv-as="'周期'"
                        :class="{'is-danger': errors.has('intervalDays')}")
                    | 天
                    span.validator-error.is-danger(v-if="errors.has('intervalDays')") {{ errors.first('intervalDays') }}
            el-table.margin-top(border :data="configObjs")
                el-table-column(
                    v-for="column in configColumns"
                    :key="column.prop"
                    :prop="column.prop"
                    :label="column.label"
                    :width="column.width"
                    header-align="center"
                    align="center")
                    template(slot-scope="scope")
                        span.text-center(v-if="column.prop === 'symbol'") {{configs.symbol || 0}}
                        span(v-else-if="column.prop === 'threshold'")
                            el-input-number(
                                size="small"
                                v-validate="rules[scope.row.rule]"
                                :name="scope.row.prop"
                                :data-vv-as="scope.row.title"
                                v-model="sendParams[scope.row.prop]"
                                :class="{'is-danger': errors.has(scope.row.prop)}"
                                :precision="scope.row.precision"
                                :min="scope.row.min"
                                :max="scope.row.max")
                            span.validator-error.is-danger(v-if="errors.has(scope.row.prop)") {{ errors.first(scope.row.prop) }}
                        span(v-else) {{scope.row[column.prop]}}
        div.dialog-footer(slot="footer")
            el-button(@click="cancel" size="small") 取 消
            el-button(@click="submit" type="primary" size="small" :loading="configs.isSaving") 保 存
</template>
<script>
export default {
    inject: ['$validator'],
    props: {
        configs: {
            type: Object,
            default () {
                return {}
            }
        }
    },
    data () {
        return {
            sendParams: {
                intervalDays: 7,
                cpuUsedRate: null,
                memUsedRate: null,
                loginCount: null,
                netWorkReceiveCount: null,
                netWorkTransmitCount: null,
                type: ''
            },
            configColumns: [
                { prop: 'title', label: '指标' },
                { prop: 'symbol', label: '比较运算符', width: '120px' },
                { prop: 'threshold', label: '阈值' }
            ],
            rules: {
                intervalDays: {
                    required: true,
                    between: [1, 30]
                },
                usedRate: {
                    required: true,
                    customRegex: [/^100$|^(\d|[1-9]\d)(\.\d{1,2})*$/, '使用率阈值参数请设置在0-100以内。']
                },
                loginCount: {
                    required: true,
                    customRegex: [/^\d+$/, '设置为大于等于0的整数。']
                },
                netWorkAboutCount: {
                    required: true,
                    customRegex: [/^[1-9]\d*(\.\d*[1-9])?$/, '阈值参数请设置为大于0的数字。']
                }
            }
        }
    },
    created () {
        if (this.configs) {
            Object.keys(this.sendParams).forEach(key => {
                if (this.configs.hasOwnProperty(key) && this.configs[key])
                    this.sendParams[key] = this.configs[key]
            })
        }
    },
    computed: {
        configObjs () {
            let basicRow = [
                { prop: 'cpuUsedRate', title: 'CPU使用率(%)', rule: 'usedRate', precision: 0, min: 0, max: 100 },
                { prop: 'memUsedRate', title: '内存使用率(%)', rule: 'usedRate', precision: 0, min: 0, max: 100 }
            ]
            let otherRow = [
                { prop: 'loginCount', title: '登录次数', rule: 'loginCount', precision: 0, min: 0 },
                { prop: 'netWorkReceiveCount', title: '网络流入(BPS)', rule: 'netWorkAboutCount', precision: 0, min: 0 },
                { prop: 'netWorkTransmitCount', title: '网络流出(BPS)', rule: 'netWorkAboutCount', precision: 0, min: 0 }
            ]
            if (this.configs.type === 'idle')
                return [...basicRow, ...otherRow]
            return basicRow
        }
    },
    methods: {
        cancel () {
            this.configs.ShowdialogTable = false
            this.$emit('update:configs', this.configs)
        },
        submit () {
            this.$validator.validate().then(valid => {
                if (!valid) return
                this.configs.isSaving = true
                this.$emit('closeDialog', this.sendParams)
                this.$emit('update:configs', this.configs)
            })
        }
    }
}
</script>
<style lang="scss" scoped>
.conf-content {
    width: 90%;
    margin: 0 auto;
}
</style>

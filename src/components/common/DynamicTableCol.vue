<template lang="pug">
    el-dropdown(:hide-on-click="false")
        el-button.oper-icon-btn(size="mini" icon="ucmp-icon-cost-set" :title="colBtnLabel")
        el-dropdown-menu(slot="dropdown")
            span.tip-text
                i.ucmp-icon-alert
                span 至少展示一列
            el-checkbox-group(:min="1" v-model="checkedCols")
                el-dropdown-item(v-for="column in innerColumns" :key="column.prop")
                    el-checkbox.full-width(:label="column.prop" :checked="column.isShow" :disabled="column.href" @change="handleColChange(column)") {{column.label}}
</template>
<script>
    /**
     * @description 当表格的列过多时，动态配置表格的列展示
     */
    import {mapGetters, mapActions} from 'vuex'

    export default {
        /**
         * @description 父组件传递的配置参数
         * @prop {string} colBtnLabel 可选 配置操作的文字
         * @prop {Array} columns 必选 表格所有的列数据,需要双向绑定
         * @example DynamicTableCol(:columns.sync="displayedColumns")
         *         el-table-column(v-for="column in displayedColumns" v-if="column.isShow")
         */
        props: {
            colBtnLabel: {
                type: String,
                default: '设置'
            },
            columns: {
                type: Array,
                default: [],
                required: true
            },
            serviceCode: String
        },
        data () {
            return {
                checkedCols: []
            }
        },
        computed: {
            innerColumns () {
                this.columns.forEach(item => {
                    item.isShow = this.consoleTableCols[this.serviceCode] && this.consoleTableCols[this.serviceCode][item.prop]
                        ? this.consoleTableCols[this.serviceCode][item.prop].display
                        : false
                })
                return this.columns
            },
            ...mapGetters([
                'consoleTableCols'
            ])
        },
        methods: {
            handleCustomCol () {
                // 不检查是否和库中条目有不同， 不同则默认不显示，用户自己勾选，每次用户有勾选取消操作时同步现有所有列到库
                // 确认显示
                let checkedCols = []
                this.columns.forEach(item => {
                    // 默认不存在则不显示
                    item.isShow = this.consoleTableCols[this.serviceCode] && this.consoleTableCols[this.serviceCode][item.prop]
                        ? this.consoleTableCols[this.serviceCode][item.prop].display
                        : false
                    // group v-model所需
                    item.isShow && checkedCols.push(item.prop)
                })

                this.checkedCols = checkedCols
                this.$emit('update:columns', this.columns)
            },
            // 处理列选中或取消
            handleColChange (column) {
                let columns = JSON.parse(JSON.stringify(this.columns))

                // 找到需要修改的列处理
                columns.find((item, idx, columns) => item.prop === column.prop && (columns[idx].isShow = !column.isShow))
                this.$emit('update:columns', columns)

                let columnDisplay = {}
                columns.forEach(item => {
                    columnDisplay[item.prop] = {display: item.isShow}
                })

                this.setCustomTableCols({
                    id: this.serviceCode,
                    obj: columnDisplay
                })
            },

            ...mapActions([
                'getCustomTableColsById',
                'setCustomTableCols'
            ])
        },
        created () {
            this.getCustomTableColsById(this.serviceCode)
        },
        watch: {
            consoleTableCols: {
                handler: function (newVal, oldVal) {
                    this.handleCustomCol()
                }
            }
        }
    }
</script>
<style lang="scss" scoped>
    .tip-text {
        padding: 0 20px
    }

    .ucmp-icon-alert {
        margin-right: 6px;
    }
</style>

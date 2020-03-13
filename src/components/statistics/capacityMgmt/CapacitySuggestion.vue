<template lang="pug">
    div.full-container(slot="content")
        div.top-container.d-flex.justify-content-between
            div.label-box.position-relative(v-for="(item, key) in cardDatas" :key="key" :class="{'theme_color_border': activeCardType == key}" @click="changeType(key)")
                div
                    p.label-title.theme-color {{item.title}}
                        strong.margin-left.orange.font-orange {{item.count || 0}}
                    p.label-cot(v-if="key === 'add'") 最近{{item.displayParams.intervalDays}}天CPU使用率 {{item.displayParams.symbol}} {{item.displayParams.cpuUsedRate || 0}}%，内存使用率 {{item.displayParams.symbol}} {{item.displayParams.memUsedRate || 0}}%
                    p.label-cot(v-else-if="key === 'reduce'") 最近{{item.displayParams.intervalDays || 0}}天CPU使用率 {{item.displayParams.symbol}} {{item.displayParams.cpuUsedRate || 0}}%，内存使用率 {{item.displayParams.symbol}} {{item.displayParams.memUsedRate || 0}}%
                    p.label-cot(v-else) 最近{{item.displayParams.intervalDays || 0}}天网络流入 {{item.displayParams.symbol}} {{item.displayParams.netWorkReceiveCount || 0}}Bps，网络流出 {{item.displayParams.symbol}} {{item.displayParams.netWorkTransmitCount || 0}}Bps，登录次数 {{item.displayParams.symbol}} {{item.displayParams.loginCount || 0}}
                span.ucmp-icon-edit.absolute-rt.active_capacity(@click.stop="editConfig(item.displayParams)")
        div.full-table-height
            UcmpTableContainer(
                ref="tableCotHeight"
                :filterItems="filterItems"
                :pagination.sync="pagination"
                @sizeChange="handleSizeChange"
                @currentChange="handleCurrentChange"
                v-loading="isLoading"
                :containerHeight.sync="tableContainerHeight"
                element-loading-spinner="ucmp-icon-loading")
                div.full-height(slot="tableContainer")
                    OperatorPanel(
                        :basicBtns="actions"
                        :advancedBtns="advancedBtns"
                        :instances="selectedInstances"
                        @operationClick="operationClick"
                    )
                        div.margin-left(slot="otherPanels")
                            el-tooltip(content="邮件")
                                el-button.circle-btn.ucmp-service-action(circle plain size="mini" icon="ucmp-icon-email" @click="sendEmail()" :disabled="!selectedInstances.length")
                    el-table.panel-table.margin-top(:data="tableData" @selection-change="handleSelectionChange" :max-height="tableMaxHeight" border)
                        el-table-column(type="selection" width="45")
                        el-table-column(
                            :prop="column.prop"
                            v-for="column in columns"
                            :key="column.prop"
                            :label="column.label"
                            :width="column.width"
                            show-overflow-tooltip)
                            template(slot-scope="scope")
                                span(v-if="column.prop === 'ip'") {{scope.row.ip.join(', ')}}
                                span(v-else-if="column.prop === 'network'") {{scope.row.network.join(', ')}}
                                span(v-else) {{scope.row[column.prop]}}
        Conf-dialog(:configs="blockConfig" @closeDialog="closeDialog" v-if="blockConfig.ShowdialogTable")
</template>

<script>
/**
 * @description 容量优化建议
 */
import Api from '@api'
import ConfDialog from './ConfDialog'
import { mapGetters } from 'vuex'
import MetadataUtils from '@server/metadata.utils'
import Config from '@mock/metadata/metadata.config'
import OperatorPanel from '@/components/common/panels/OperatorPanel'

export default {
    components: { ConfDialog, OperatorPanel },
    name: 'CapacitySuggestion',
    data () {
        return {
            breadcrumbItems: [{ prop: 'capacity-suggestion', label: '容量优化建议' }],
            ShowdialogTable: false,
            blockConfig: {},
            pagination: {
                index: 1,
                count: 1,
                size: 20,
                total: 0
            },
            filterItems: [],
            tableData: [],
            columns: [
                { prop: 'instanceName', label: '实例名称' },
                { prop: 'network', label: '网络' },
                { prop: 'ip', label: 'IP地址' },
                { prop: 'cloudFactory', label: '云厂商' },
                { prop: 'cpuRate', label: 'CPU使用率(%)' },
                { prop: 'memRate', label: '内存使用率(%)' },
                { prop: 'netReceive', label: '网络流入速率(Bps)', width: 140 },
                { prop: 'netSend', label: '网络流出速率(Bps)', width: 140 },
                { prop: 'loginCount', label: '登录次数' }
            ],
            cardDatas: {
                'add': { title: '建议增加配置', count: 0, displayParams: {symbol: '>'}, isLoading: false },
                'reduce': { title: '建议减少配置', count: 0, displayParams: {symbol: '<'}, isLoading: false },
                'idle': { title: '空闲实例', count: 0, displayParams: {symbol: '<'}, isLoading: false }
            },
            activeCardType: 'add',
            advancedBtns: [],
            selectedInstances: [],
            tableContainerHeight: 200,
            isSendingEmail: false,
            timeUnitText: {
                day: '日',
                hour: '小时',
                minute: '分'
            }
        }
    },
    created () {
        this.init()
        Object.keys(this.cardDatas).forEach(key => {
            this.initConfData(key)
        })
    },
    methods: {
        init () {
            MetadataUtils.initMetaInfoByServiceCode('ecs', this.metadata, Config)
        },
        handleSizeChange (val) {
            this.pagination.size = val
            this.pagination.index = 1
            this.initConfData(this.activeCardType)
        },
        handleCurrentChange (val) {
            this.pagination.index = val
            this.initConfData(this.activeCardType)
        },
        editConfig (obj) {
            // 打开编辑弹窗
            let blockConfigOri = {
                ShowdialogTable: false,
                isSaving: false,
                title: '',
                id: null,
                symbol: ''
            }
            this.blockConfig = { ...blockConfigOri, ...obj }
            this.blockConfig.ShowdialogTable = true
        },
        // 切换建议类型
        changeType (type) {
            if (this.isLoading)
                return
            this.activeCardType = type
            this.pagination.index = 1
            this.initConfData(type)
        },
        closeDialog (data) {
            Api.post('suggestion_edit_conf', data).then(res => {
                this.activeCardType = data.type
                this.blockConfig.isSaving = false
                this.blockConfig.ShowdialogTable = false
                // 将编辑后的参数值赋值给
                Object.keys(data).forEach(key => {
                    if (this.cardDatas[data.type].displayParams.hasOwnProperty(key))
                        this.cardDatas[data.type].displayParams[key] = data[key]
                })

                this.initConfData(data.type)
            }, () => {
                this.blockConfig.isSaving = false
            })
        },
        // 获取各种配置下的参数及相关列表
        initConfData (type) {
            let params = {
                type: type,
                pageNum: this.pagination.index,
                pageSize: this.pagination.size
            }
            this.cardDatas[type].isLoading = true
            Api.get('api_capacity_conf_data', params).then(
                res => {
                    this.cardDatas[type].isLoading = false
                    if (res) {
                        // UCMP3-3053 displayParams 的内容与data无直接关系，否则编辑时ConfDialog得不到type类型，导致保存失败
                        this.cardDatas[type].displayParams = {...this.cardDatas[type].displayParams, ...JSON.parse(JSON.stringify(res))}
                        if (!res.data) return
                        this.cardDatas[type].count = res.data.total
                        delete this.cardDatas[type].displayParams.data

                        // UCMP3-3340【容量优化建议】点击容量优化建议，默认显示建议增加配置数据，141环境上“建议增加配置”接口返回是空，但页面仍显示有数据
                        if (type === this.activeCardType) {
                            this.tableData = res.data.list
                            this.pagination.total = res.data.total
                        }
                    }
                }, () => {
                    this.cardDatas[type].isLoading = false
                }
            )
        },
        handleSelectionChange (val) {
            this.selectedInstances = val
        },
        operationClick (btn, self) {
            let instanceNames = []
            let instanceIds = []
            this.selectedInstances.forEach(instance => {
                instanceNames.push(instance.instanceName)
                instanceIds.push(instance.instanceId)
            })
            let msg_tip = ''
            if (btn.endpoint.method === 'delete') {
                let recycleTime = `${this.recycleConfig.storageTime}${this.timeUnitText[this.recycleConfig.timeUnit]}`
                msg_tip = `确定${btn.label}${instanceNames.join(',')}吗？删除后将放入回收站, 您可以在回收站进行恢复。(注意：执行删除时系统会自动将资源进行关机操作, 放入回收站后, 将在${recycleTime}后自动删除并释放资源!)`
            } else
                msg_tip = `确定${btn.label}${instanceNames.join(',')}吗？`
            this.$confirm(msg_tip, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(
                () => {
                    let params = {
                        service_code: 'ecs',
                        instance_ids: btn.endpoint.method === 'delete' ? instanceIds.join(',') : instanceIds
                    }
                    // UCMP-1274 --【容量优化建议】容量优化建议页面列表数据有变化时，配置统计数没有变化，需刷新整个页面才显示一致
                    Api[btn.endpoint.method.toLowerCase()](btn.endpoint.url, params, true).then(res => {
                        this.initConfData(this.activeCardType)
                    }).catch(() => {})
                }
            ).catch(() => {})
        },

        // 发送邮件通知
        sendEmail () {
            let sendParams = {
                type: this.activeCardType,
                msg_type: 0,
                ecs_list: []
            }
            sendParams.ecs_list = this.selectedInstances.map(ecs => ecs.instanceId)
            this.isSendingEmail = true
            Api.post('capacitySuggestEmailApi', sendParams).then(res => {
                this.isSendingEmail = false
                if (res && res.result === 'ok')
                    this.$notify.success({ title: '成功', message: '邮件发送成功...' })
            }, () => {
                this.isSendingEmail = false
                this.$notify.error({ title: '失败', message: '邮件发送失败...' })
            })
        }
    },
    watch: {
        // 监听元数据变化(解决当前页面刷新时,元数据请求响应晚于获取单个服务数据的请求响应)
        metadata (newVal, oldVal) {
            if (newVal === oldVal) return
            this.init()
        }
    },
    computed: {
        ...mapGetters([
            'groupActions',
            'metadata',
            'recycleConfig'
        ]),
        actions () {
            let actions = [...this.groupActions.iconGroup, ...this.groupActions.moreGroup]
            return actions.filter(item => {
                return item && item.name && (item.name === 'stop' || item.name === 'delete')
            })
        },
        tableMaxHeight () {
            return this.tableContainerHeight - 51
        },

        isLoading () {
            return this.cardDatas.add.isLoading || this.cardDatas.reduce.isLoading || this.cardDatas.idle.isLoading
        }
    }
}
</script>
<style lang="scss" scoped>
.label-box {
    cursor: pointer;
    height: 100px;
    border: 1px solid #ddd;
    padding: 16px 2% 28px 2%;
    width: calc(33.3% - 8px);
    border-radius: 5px;
    .label-title {
        font-size: 16px;
    }
    .label-cot {
        color: #a6a6a6;
        margin-top: 10px;
        font-size: 14px;
    }
    .float-left {
        width: calc(100% - 50px);
    }
}
@media screen and (max-width: 1366px) {
    .label-box {
        padding: 16px 1% 28px 1%;
    }
}
.orange {
    font-size: 20px;
}
.full-table-height {
    height: calc(100% - 100px);
}

.ucmp-icon-edit {
    font-size: 26px;
    top: 10px;
    right: 10px;
}

.conf-dialog {
    .el-row {
        .el-col {
            height: 40px;
            line-height: 32px;
            padding: 4px 5px;
        }
    }
}
</style>


<template lang="pug">
    div.full-container(v-loading="isLoading")
        div.top-basic-cot.d-flex.justify-content-between
            div.basic-form
                el-form.form.d-flex.flex-wrap(:model="strategyInfo" :rules="rules" size="small" label-width="120px" label-position="right")
                    el-form-item.form-item.rw-input(
                        v-for="formItem in strategyDetailFormItems"
                        v-if="!(formItem.key === 'resource_type' && (strategyInfo.origin === 2 || (isBelongToEcsDetail && operationType === 'add')))"
                        :key="formItem.key"
                        :label="formItem.label"
                        :prop="formItem.key"
                        :class="{'full-width': formItem.isFullWidth, 'is-required': formItem.validations && formItem.validations.required}")
                        el-select(
                            v-if="formItem.type === 'select'"
                            v-model="strategyInfo[formItem.key]"
                            :name="formItem.key"
                            v-validate="formItem.validations || {}"
                            :data-vv-as="formItem.label"
                            :class="{'is-danger': errors.has(formItem.key)}"
                            :placeholder="formItem.placeholder || ''"
                            :disabled="isViewDetail || (formItem.key === 'resource_type' && (operationType === 'edit' || isBelongToEcsDetail))"
                            @change="changeParams(formItem.key)"
                            :clearable="formItem.clearable"
                        )
                            el-option(v-for="(option, index) in getFormItemOptions(formItem)" :label="formItem.optionKey ? option[formItem.optionKey.label] : option.label" :value="formItem.optionKey ? option[formItem.optionKey.value] : option.value" :key="index")
                        el-input(
                            v-else-if="formItem.type === 'input' || formItem.type === 'textarea'"
                            :type="formItem.type"
                            :name="formItem.key"
                            v-model.trim="strategyInfo[formItem.key]"
                            v-validate="formItem.validations || {}"
                            :data-vv-as="formItem.label"
                            :class="{'is-danger': errors.has(formItem.key) || (formItem.key === 'rule_name' && !nameEnabled)}"
                            :placeholder="formItem.placeholder || ''"
                            v-loading="formItem.key === 'rule_name' && isCheckingName"
                            :disabled="isViewDetail"
                            @blur="formItem.key === 'rule_name' && checkName(strategyInfo[formItem.key])"
                            @change="formItem.key === 'rule_name' && (nameEnabled = true)"
                        )
                        el-switch(
                            v-else-if="formItem.type === 'switch'"
                            v-model="strategyInfo[formItem.key]"
                            :disabled="isViewDetail"
                            :name="formItem.key"
                        )
                        span.val-cot(v-else)
                            span(v-if="formItem.key === 'resource_list'")
                                span(v-if="!((strategyInfo.origin === 2 || (isBelongToEcsDetail && operationType === 'add')) || isConsleCreateRule)")
                                    el-tooltip(effect="dark" :disabled="!!strategyInfo.resource_type" content="请先选择监控对象类型" placement="right")
                                        span
                                            el-button.oper-icon-btn.form-btn(icon="el-icon-plus" @click="openDialog()" :disabled="!strategyInfo.resource_type || isViewDetail") 添加监控对象
                                        el-button.align-bottom(v-if="strategyInfo[formItem.key].length > 10 && !showMoreResource" type="text" @click="showMoreResource = true") ...显示全部
                                        el-button.align-bottom(v-if="strategyInfo[formItem.key].length > 10 && showMoreResource" type="text" @click="showMoreResource = false") ...收起
                                span(v-else)
                                    span {{instanceName}}
                                span.is-danger.validator-error.block(v-if="resourceInfoError") 请选择监控对象
                        span.validator-error.is-danger.block(v-if="errors.has(formItem.key)") {{ errors.first(formItem.key) }}
                        span.validator-error.is-danger.block(v-if="formItem.key === 'rule_name' && !nameEnabled") 该名称已存在，请重新命名
            div.msg-detail.form-detail-container
                div.service-title 消息策略详情
                div.detail-cots
                    div.d-flex(v-for="item in selectedMsgRules" :key="item.label")
                        div.attribute-name {{item.label}}
                        div.attribute-value {{item.value}}
        div.bot-rule-table
            div.title 告警触发规则
            div.d-flex.justify-content-end.table-top-btn-pane
                el-button.oper-icon-btn(icon="el-icon-plus" size="small" @click="addRule()" :disabled="metricsTableData.length === 3 || isViewDetail") 添加规则
            el-table(border :data="metricsTableData")
                el-table-column(
                    v-for="column in columns"
                    :key="column.prop"
                    :prop="column.prop"
                    :label="column.label"
                    :width="column.width")
                    template(slot-scope="scope")
                        span(v-if="column.prop === 'operation'")
                            el-button(type="text" @click="deleteRule(scope.row, scope.$index)" :disabled="metricsTableData.length === 1 || isViewDetail") 删除
                        span(v-else-if="column.prop === 'value'")
                            el-input-number(
                                v-model="scope.row[column.prop]"
                                size="small"
                                :min="column.min"
                                :max="scope.row.unit === '%' ? 100 : Infinity"
                                v-validate="{required: true}"
                                :name="column.prop + scope.$index"
                                :data-vv-as="column.label"
                                :disabled="isViewDetail")
                            span.unit {{scope.row.unit}}
                        span(v-else)
                            el-select(
                                v-if="column.type === 'select' && !(column.prop === 'logic_operator' && !scope.row.logic_operator)"
                                v-model="scope.row[column.prop]"
                                :placeholder="column.placeholder",
                                size="small"
                                :name="column.prop + scope.$index"
                                v-validate="{required: true}"
                                :data-vv-as="column.label"
                                :class="{'is-danger': errors.has(column.prop + scope.$index)}"
                                @change="changeMetricType(column, scope.row, scope.$index)"
                                :disabled="isViewDetail")
                                el-option(v-for="option in getOptions(column, scope.row)" :key="option.value" :label="option.label" :value="option.value")
                        span.validator-error.is-danger.block(v-if="errors.has(column.prop + scope.$index)") {{ errors.first(column.prop + scope.$index) }}
            div.margin-top.tip-text 说明：最多支持添加三个触发规则
        div.bot-btns.border-top
            el-button(size="small" @click="backToList()") 返回列表
            el-button(type="warning" size="small" @click="saveStrategy()" v-show="!isViewDetail") 保存
        ChooseInstanceDialog(
            ref="chooseInstanceDialog"
            v-if="strategyInfo.resource_type && dialogVisible"
            :dialogVisible.sync="dialogVisible"
            :resourceType="strategyInfo.resource_type"
            :resourceList.sync="strategyInfo.resource_list"
            :resourceInfoError.sync="resourceInfoError")
</template>
<script>
import Api from '@api'
import { mapGetters, mapActions } from 'vuex'

import { LogicalOperatorOptions, CompareOperator, AlarmType, AlarmLevel } from '@/server/ConstParams'
import ChooseInstanceDialog from './ChooseInstanceDialog'

const StrategyDetailFormItems = [
    {
        label: '告警策略名称',
        placeholder: '请输入告警策略名称',
        key: 'rule_name',
        type: 'input',
        validations: {
            required: true,
            max: 64
        }
    },
    {
        label: '告警类型',
        placeholder: '请选择告警类型',
        key: 'alert_type',
        type: 'select',
        defaultOptions: AlarmType,
        validations: {
            required: true
        }
    },
    {
        label: '监控对象类型',
        placeholder: '请选择监控对象类型',
        key: 'resource_type',
        type: 'select',
        showText: '',
        validations: {
            required: true
        }
    },
    {
        label: '告警级别',
        placeholder: '请选择告警级别',
        key: 'severity',
        type: 'select',
        defaultOptions: AlarmLevel,
        validations: {
            required: true
        }
    },
    {
        label: '监控对象',
        key: 'resource_list',
        isFullWidth: true,
        validations: {
            required: true
        }
    },
    {
        label: '消息策略',
        placeholder: '请关联消息策略',
        key: 'message_policy_id',
        type: 'select',
        clearable: true,
        optionKey: {
            label: 'name',
            value: 'id'
        }
    },
    {
        label: '是否启用',
        placeholder: '',
        key: 'enable',
        type: 'switch',
        defaultValue: false
    },
    {
        label: '告警策略说明',
        placeholder: '字数限制在256字以内',
        key: 'description',
        type: 'textarea',
        isFullWidth: true,
        validations: {
            max: 256
        }
    }
]
export default {
    inject: ['$validator'],
    components: { ChooseInstanceDialog },
    props: [ 'operationType' ],
    data () {
        return {
            columns: [
                { prop: 'logic_operator', label: '逻辑运算符', type: 'select', options: LogicalOperatorOptions },
                { prop: 'sub_type', placeholder: '请选择指标分类', label: '指标分类', type: 'select' },
                { prop: 'id', label: '指标', placeholder: '请选择指标', type: 'select', options: [] },
                { prop: 'cmp_operator', placeholder: '请选择比较运算符', label: '比较运算符', type: 'select', options: CompareOperator },
                { prop: 'value', type: 'number', label: '阈值', min: 0, width: 200 },
                { prop: 'operation', label: '操作' }
            ],
            ruleModelParam: {
                logic_operator: '',
                sub_type: '',
                cmp_operator: '',
                id: '',
                value: undefined,
                unit: ''
            },
            metricsTableData: [],
            strategyInfo: {
                rule_name: '',  // 策略名称
                alert_type: '',  // 告警类型
                resource_type: '',
                resource_list: [],
                severity: '',
                message_policy_id: '',
                enable: false,
                description: '',
                metrics_list: []
            },
            strategyDetailFormItems: StrategyDetailFormItems,
            rules: {},
            instanceInfo: {},
            metricMap: {},
            dialogVisible: false,
            isEdit: true,
            selectedMsgRules: [
                {label: '消息策略名称', prop: 'name', value: ''},
                {label: '发送周期', prop: 'period', value: ''},
                {label: '发送方式', prop: 'type', value: ''},
                {label: '接受对象', prop: 'role_list', value: ''},
                {label: '接收人', prop: 'user_list', value: ''}
            ],
            resourceInfoError: false,
            isCheckingName: false,
            nameEnabled: true, // 策略名称是否可用
            currentName: '',
            originName: '', // 编辑时需要用
            showMoreResource: false,
            isConsleCreateRule: false,
            status: '',
            isLoading: false
        }
    },
    created () {
        // 获取消息策略列表
        Api.get('api_msssage_rules_list', {}).then(
            res => {
                let msgFormItem = this.strategyDetailFormItems.find(item => item.key === 'message_policy_id')
                this.$set(msgFormItem, 'defaultOptions', res)
            }
        )

        // 获取监控对象类型列表
        if (!this.resourceTypeMap) {
            Api.get('service_select_options_api', {}).then(
                res => {
                    this.setResourceTypeMap(res)
                    this.init()
                }
            )
        } else
            this.init()
    },

    methods: {
        ...mapActions([
            'setResourceTypeMap',
            'setResourceMetricTypeMap',
            'setResourceMetricTypeMapItem'
        ]),

        init () {
            // 初始化指标类型
            if (this.operationType === 'edit' || this.operationType === 'view') {
                // 获取策略详情
                this.initStrategyDetail(this.$route.query.strategyId)
            }

            this.metricsTableData.push(JSON.parse(JSON.stringify(this.ruleModelParam)))

            if (this.isBelongToEcsDetail) {
                this.instanceInfo = typeof this.$route.query.instanceInfo === 'object' ? this.$route.query.instanceInfo : {}
                if (this.instanceInfo.toString() !== '{}') {
                    let params = {
                        service: this.$route.params.code,
                        instanceId: this.$route.params.id
                    }
                    if (this.$store.state.serviceInstance.serviceInstance && this.$store.state.serviceInstance.serviceInstance.selectedInstanceInfo)
                        this.instanceInfo = this.$store.state.serviceInstance.serviceInstance.selectedInstanceInfo
                    else {
                        Api.get('serviceInstanceDetail', params, true).then(
                            res => {
                                this.instanceInfo = res
                            }
                        )
                    }
                }
                if (this.operationType === 'add') {
                    this.$nextTick(() => {
                        let conf = null
                        if (this.$route.params.code) {
                            conf = this.resourceTypeMap && this.resourceTypeMap.find(item_type => {
                                return this.$route.params.code === item_type.key
                            })
                        } else {
                            conf = this.resourceTypeMap && this.resourceTypeMap.find(item_type => {
                                return item_type.key === 'ipmi'
                            })
                        }
 
                        this.strategyInfo.resource_type = conf ? conf.value : undefined
                        if (this.strategyInfo.resource_type !== undefined)
                            this.changeParams('resource_type')

                        this.strategyInfo.resource_list.push({
                            owner_id: this.instanceInfo.owner,
                            owner_type: this.instanceInfo.owner_type,
                            owner_name: this.instanceInfo.owner_name,
                            resource_cnt: 1,
                            resource_list: [this.instanceInfo.instance_id || this.instanceInfo[`${this.service_code}_id`] || this.instanceInfo.bare_id]
                        })
                    })
                }
            }
        },

        // 编辑状态下初始化获取策略详情
        initStrategyDetail (strategyId) {
            this.isLoading = true
            Api.get('api_alarm_rule_detail', {id: strategyId}).then(
                res => {
                    this.isLoading = false
                    if (res) {
                        this.$nextTick(() => {
                            this.strategyInfo = JSON.parse(JSON.stringify(res))
                            !Array.isArray(this.strategyInfo.resource_list) && (this.strategyInfo.resource_list = [])

                            this.originName = this.strategyInfo.rule_name

                            this.strategyInfo.message_policy_id = JSON.parse(JSON.stringify(res)).message_policy.id
                            this.metricsTableData = JSON.parse(JSON.stringify(res)).metrics_list || []

                            // 获取消息策略详情
                            this.changeSelectedMsgRule(JSON.parse(JSON.stringify(res)).message_policy)
                            delete this.strategyInfo.message_policy

                            // 获取当前策略的指标类型
                            this.initMetricMap(this.strategyInfo.resource_type)

                            this.metricsTableData.forEach((item, index) => {
                                // 获取指标下拉列表
                                this.changeMetricType({prop: 'sub_type'}, item, index, true)
                            })

                            // 在告警策略列表中控制台下创建的策略--获取主机详情
                            if (this.strategyInfo.origin === 2 && !this.isBelongToEcsDetail) {
                                let resourceTypeFormItem = this.strategyDetailFormItems.find(item => item.key === 'resource_type')
                                let resourceType = resourceTypeFormItem.defaultOptions && resourceTypeFormItem.defaultOptions.find(type => type.value === this.strategyInfo.resource_type)

                                this.isConsleCreateRule = true
                                if (resourceType && this.strategyInfo.resource_list[0] && this.strategyInfo.resource_list[0].resource_list[0]) {
                                    let params = {
                                        resource_type: resourceType.value,
                                        resource_id: this.strategyInfo.resource_list[0].resource_list[0]
                                    }
                                    Api.get('api_alarm_rule_resouce', params, true).then(
                                        res => {
                                            this.instanceInfo = res
                                        }
                                    )
                                }
                            }
                        })
                    }
                },
                () => {
                    this.isLoading = false
                }
            )
        },

        // 添加一条指标
        addRule () {
            this.$nextTick(() => {
                let newRule = JSON.parse(JSON.stringify(this.ruleModelParam))
                newRule.logic_operator = 'and'
                this.metricsTableData.push(newRule)
            })
        },
        // 删除某一条指标
        deleteRule (row, index) {
            this.metricsTableData.splice(index, 1)
            if (this.metricsTableData.length === 1)
                this.metricsTableData[0].logic_operator = ''
        },

        // 获取表单中的表单下拉项
        getFormItemOptions (formItem) {
            if (formItem.key === 'resource_type') {
                this.$set(formItem, 'defaultOptions', this.currentResourceMap)
                return formItem.defaultOptions || []
            }
            if (formItem.defaultOptions)  // 直接使用默认数据
                return formItem.defaultOptions
            else
                return []
        },

        // 保存告警策略 创建/编辑
        saveStrategy () {
            this.$validator.validate().then(
                res => {
                    if (!(this.strategyInfo.resource_list && this.strategyInfo.resource_list.length) && !this.instanceName) {
                        this.resourceInfoError = true
                        return
                    }
                    if (res && this.nameEnabled) {
                        this.resourceInfoError = false
                        let sendParams = JSON.parse(JSON.stringify(this.strategyInfo))
                        sendParams.metrics_list = JSON.parse(JSON.stringify(this.metricsTableData)).map(item => {
                            return {
                                id: item.id,
                                cmp_operator: item.cmp_operator,
                                logic_operator: item.logic_operator,
                                value: item.value
                            }
                        })

                        // origin表明该策略是否是控制台下的主机详情中针对某一主机添加的告警策略 1-> 不是， 2-> 是
                        if (this.operationType === 'add')
                            sendParams.origin = this.isBelongToEcsDetail ? 2 : 1

                        // 保存策略
                        Api.post('api_alarm_rule_edit', sendParams).then(
                            res => {
                                if (res && res.rst === 'ok')
                                    this.backToList()
                            }
                        )
                    }
                }
            )
        },

        backToList () {
            if (!this.isBelongToEcsDetail)
                this.$router.push({path: '/strategy-mgr'})
            else
                this.$router.go(-1)
        },

        checkName (val) {
            if (val && (val !== this.currentName) && (this.originName !== val)) {
                this.isCheckingName = true
                Api.get('api_alarm_rule_checkname', {name: val}).then(
                    res => {
                        this.isCheckingName = false
                        this.nameEnabled = res.enable
                        this.nameEnabled && (this.currentName = JSON.parse(JSON.stringify(this.strategyInfo.rule_name)))
                    }
                )
            }
        },

        // 获取指标的下拉列表
        getOptions (column, row) {
            if (column.prop === 'sub_type')
                return this.metricMap[this.strategyInfo.resource_type] || []
            else if (column.prop === 'id') { // 根据指标类型获取指标列表
                if (Array.isArray(row.subList)) {
                    return row.subList.map(item => {
                        return {label: item.name, value: item.id}
                    })
                } else
                    return []
            } else if (column.prop === 'cmp_operator') { // 根据指标类型获取比较运算符
                if (Array.isArray(row.cmpList)) {
                    return row.cmpList.map(item => {
                        return {label: item, value: item}
                    })
                } else
                    return []
            } else
                return column.options
        },

        // 指标列表中获取下拉项
        changeMetricType (column, row, index, isEdit) {
            if (column.prop === 'sub_type') {
                let currentResource = this.resourceTypeMap.find(resource => resource.value === this.strategyInfo.resource_type)

                let currentMetrics = currentResource.metricType ? currentResource.metricType.find(metric_item => metric_item.value === row[column.prop]) : {}
                // console.log(this.resourceTypeMap, row, column, currentResource, currentMetrics)
                if (!currentMetrics.subList) {
                    Api.get('api_metrics_detail', {type: row[column.prop], resource_type: this.strategyInfo.resource_type}).then(
                        res => {
                            this.setResourceMetricTypeMapItem({
                                resource_type: this.strategyInfo.resource_type,
                                metric_type: row[column.prop],
                                data: res
                            })
                            // column.prop + index => 该行对应的name属性，用于移除错误校验
                            this.initRowMetric(row, res, index, isEdit)
                        }
                    )
                } else
                    this.initRowMetric(row, currentMetrics.subList, index, isEdit)
            } else if (column.prop === 'id') {
                if (row.subList) {
                    let tar_tag = row.subList.find(tag => tag.id === row[column.prop])
                    if (tar_tag) {
                        this.$set(row, 'cmpList', tar_tag.cmp_op)
                        this.$set(row, 'unit', tar_tag.unit)
                    }
                }
            }
        },

        initRowMetric (row, dataArr, row_index, isEdit) {
            this.$nextTick(() => {
                this.$set(row, 'subList', dataArr)
                // 编辑时根据指标ID直接获取比较符下拉列表
                if (isEdit) {
                    let tar_tag = dataArr.find(tag => tag.id === row.id)
                    if (tar_tag) {
                        this.$set(row, 'cmpList', tar_tag.cmp_op)
                        this.$set(row, 'unit', tar_tag.unit)
                    }
                } else {
                    // 更新时清空已选值
                    this.$set(row, 'cmpList', row.subList[0].cmp_op)
                    this.$set(row, 'unit', row.subList[0].unit)

                    this.$set(row, 'id', row.subList[0].id)
                    this.$set(row, 'cmp_operator', row.cmpList[0])
                    // 移除校验信息
                    if (row.id && this.errors.has('id' + row_index))
                        this.errors.remove('id' + row_index)
                    if (row.cmp_operator && this.errors.has('cmp_operator' + row_index))
                        this.errors.remove('cmp_operator' + row_index)

                    this.$set(row, 'value', undefined)
                }
            })
        },

        changeParams (formItemKey) {
            if (formItemKey === 'message_policy_id') {
                let msgRuleItems = this.strategyDetailFormItems.find(formItem => formItem.key === formItemKey).defaultOptions
                if (msgRuleItems) {
                    let selectedMsgRule = msgRuleItems.find(msg_rule => msg_rule.id === this.strategyInfo[formItemKey]) || {}
                    this.changeSelectedMsgRule(selectedMsgRule)
                }
            } else if (formItemKey === 'resource_type') {
                let currentResource = this.resourceTypeMap.find(type => type.value === this.strategyInfo[formItemKey])

                this.metricsTableData = []
                this.metricsTableData.push(JSON.parse(JSON.stringify(this.ruleModelParam)))

                if (!currentResource.metricType)
                    this.initMetricMap(this.strategyInfo[formItemKey])
                else
                    this.$set(this.metricMap, this.strategyInfo[formItemKey], currentResource.metricType)
            }
        },

        // 根据监控对象类型获取指标类型
        initMetricMap (resource_type, metricType = '') {
            Api.get('api_metrics_list', {resource_type: resource_type}).then(
                res => {
                    if (res) {
                        this.setResourceMetricTypeMap({[resource_type]: res})
                        let currentResource = this.resourceTypeMap.find(type => type.value === resource_type)
                        this.$set(this.metricMap, resource_type, currentResource.metricType)
                    }
                }
            )
        },

        changeSelectedMsgRule (msgRuleDetails) {
            this.selectedMsgRules.forEach(item => {
                item.value = Array.isArray(msgRuleDetails[item.prop]) ? msgRuleDetails[item.prop].join(',') : msgRuleDetails[item.prop]
            })
        },

        // 打开弹窗
        openDialog (owner) {
            this.dialogVisible = true
            if (owner) {
                this.$nextTick(() => {
                    this.$refs.chooseInstanceDialog.showSelectedOwner(owner)
                })
            }
        }
    },
    computed: {
        isBelongToEcsDetail () {
            return (this.$route.query.isBelongToEcsDetail && ((this.$route.query.isBelongToEcsDetail).toString() === 'true'))
        },
        isViewDetail () {
            return this.operationType === 'view'
        },
        ...mapGetters([
            'resourceTypeMap'
        ]),
        service_code () {
            let service = this.resourceTypeMap.find(item => item.value === this.strategyInfo.resource_type)
            return service ? service.key : ''
        },
        // f5\nas\oracle\weblogic的使命名称为 [服务类型]_name (f5_name, nas_name...)
        instanceId () {
            return this.instanceInfo.instance_id || this.instanceInfo[`${this.service_code}_id`] || this.instanceInfo.ID
        },
        instanceName () {
            return this.instanceInfo.instance_name || this.instanceInfo[this.service_code + '_name'] || this.instanceInfo.name || this.instanceInfo.Name
        },

        currentResourceMap () {
            return JSON.parse(JSON.stringify(this.resourceTypeMap))
        }
    }
}
</script>
<style lang="scss" scoped>
.full-container{
    height: calc(100% - 66px);
    overflow-y: auto;
}
.top-basic-cot {
    .basic-form {
        width: calc(100% - 300px);
        .form {
            width: 80%;
            min-width: 670px;
            padding: 15px;
            .form-item{
                width: 50%;
                position: relative;
                &.full-width {
                    width: 100%;
                }
            }
            .form-btn{
                margin: 0;
            }
        }
    }
    .msg-detail {
        padding: 15px;
        width: 300px;
        border: 1px solid #ddd;
        max-height: 300px;
        .service-title {
            font-size: 14px;
            margin-bottom: 10px;
        }
        .detail-cots {
            height: calc(100% - 25px);
            overflow-y: auto;
        }
    }
}
.bot-rule-table{
    position: relative;
    width: calc(100% - 36px);
    margin:  0 auto;
    .title {
        font-size: 14px;
        line-height: 40px;
    }
    .unit {
        margin-left: 10px;
        font-size: 16px;
    }
}
.bot-btns{
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 10px;
    text-align: center;
}
.border-radius{
    border-radius: 5px;
    padding: 8px 5px;
}
</style>


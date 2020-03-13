<template lang="pug">
    div.full-container
        el-row
            //- 子服务顶部显示的操作按钮
            el-tooltip(
                v-for="btn in btns"
                v-if="!btn.columns && btn.enabled"
                :key="btn.key"
                :content="btn.label"
                placement="bottom"
                :disabled="!btn.icon || btn.icon && btn.icon.show_text")
                el-button.circle-btn.ucmp-service-action(
                    :type="btn.icon && btn.icon.type ? btn.icon.type : 'default'"
                    :plain="btn.icon && btn.icon.plain ? btn.icon.plain : false"
                    :icon="btn.icon && btn.icon.class ? btn.icon.class : ''"
                    :size="btn.icon && btn.icon.size ? btn.icon.size : 'small'"
                    @click="handlerClick(btn, 'child')"
                ) {{ btn.icon && !btn.icon.show_text ? '' : btn.label || btn.key }}
        el-row.child-service-row(v-for="(row, row_index) in tableData" :key="row[valueField]")
            el-row.header
                el-col(:span="16")
                    span.service_name {{ checkedMetadata.name }}:
                    span.service_instance_name {{ row[textField] + '(' + row[valueField] + ')' }}
                el-col.btns(:span="8")
                    //- 子服务表格行显示的操作按钮
                    el-tooltip(
                        v-for="btn in btns"
                        v-if="btn.columns && btn.enabled && !checkChildBtnDisabled(btn, row)"
                        :key="btn.key"
                        :content="btn.label"
                        placement="bottom"
                        :disabled="!btn.icon || btn.icon && btn.icon.show_text")
                        el-button(
                            :plain="btn.icon && btn.icon.plain ? btn.icon.plain : false"
                            :type="btn.icon && btn.icon.type ? btn.icon.type : 'default'"
                            :icon="btn.icon && btn.icon.class ? btn.icon.class : ''"
                            :size="btn.icon && btn.icon.size ? btn.icon.size : 'small'"
                            @click="handlerClick(btn, 'child', row)"
                        ) {{ btn.icon && !btn.icon.show_text ? '' : btn.label || btn.key }}
            el-row.first-row(v-if="columns && columns.length")
                div.item.d-flex.child-service-detail
                    div.inline-block.read-only.text-normal.text-nowrap {{ columns[0].label }}:
                    div.inline-block.read-only.value.text-overflow-ellipsis(v-title-tip="") {{ row[columns[0].prop] }}
                el-button.control-btn(type="text" size="small" @click="changeChildDetailColumnsDisplay(row_index)") {{ detailSwitches[row_index] && detailSwitches[row_index]._switch ? '隐藏' : '全部属性'}}
            el-row.more-row(v-if="detailSwitches[row_index] && detailSwitches[row_index]._switch")
                div.item.d-flex.child-service-detail(v-for="(column, index) in columns" v-if="index && (row[column.prop] || row[column.prop] === 0)" :key="column.prop")
                    div.inline-block.read-only.text-normal.text-nowrap {{ column.label }}:
                    div.inline-block.read-only.value.text-overflow-ellipsis(v-title-tip="") {{ formatterChildRow(row, column.prop) }}
            el-row(v-for="service in checkedMetadata.related_service" :key="service.service_code")
                div.btn
                    el-tooltip(
                        v-for="btn in relatedServiceBtns[service.service_code]"
                        :key="btn.key"
                        v-if="!btn.columns && btn.enabled"
                        :content="toolTipContent(btn, row[valueField], service.service_code, row)"
                        placement="bottom"
                    )
                        //- 关联服务顶部显示的操作按钮
                        span.operator-btn-container
                            el-button(
                                :type="btn.icon && btn.icon.type ? btn.icon.type : 'default'"
                                :icon="btn.icon && btn.icon.class ? btn.icon.class : ''"
                                :plain="btn.icon && btn.icon.plain ? btn.icon.plain : false"
                                :size="btn.icon && btn.icon.size ? btn.icon.size : 'small'"
                                :disabled="checkRelatedTopBtnDisabled(btn, row[valueField], service.service_code, row)"
                                @click="handlerClick(btn, service.service_code, row, checkedChildRelatedInstances[row[valueField] + '_' + service.service_code])"
                            ) {{ btn.icon && !btn.icon.show_text ? '' : btn.label || btn.key }}
                div.table-container
                    el-table(
                        border
                        :data="row[service.query_children_key ? service.query_children_key : service.service_code]"
                        @selection-change="handleSelectionChange(row[valueField], service.service_code, $event)"
                    )
                        el-table-column(type="selection" width="45")
                        el-table-column(
                            resizable
                            :prop="column.key"
                            v-for="column in relatedServiceColumns[service.service_code]"
                            :key="column.key"
                            :label="column.label"
                            :width="column.width"
                        )
                            template(slot-scope="scope")
                                //- span(v-if="column.key === service.text_field")
                                //-     span.theme-color.column-name(@click="routeTo(service, scope.row)") {{scope.row[column.key]}}
                                div(v-if="column.enum && column.enum.length")
                                    el-tag(
                                    v-if="column.enum[0].style"
                                    :type="formatterAttr(column, scope.row, 'style', 'default')"
                                    size="mini"
                                    ) {{formatterAttr(column, scope.row, 'name')}}
                                    span(v-else) {{formatterAttr(column, scope.row, 'name')}}
                                div(v-else-if="column.multiple")
                                    p(v-for="(option, idx) in scope.row[column.key]" :key="idx") {{option}}
                                span(v-else) {{scope.row[column.key]}}
                        el-table-column(
                            label="操作"
                            width="300"
                        )
                            template(slot-scope="scope")
                                el-tooltip(
                                    v-for="btn in relatedServiceBtns[service.service_code]"
                                    :key="btn.key"
                                    v-if="btn.columns && btn.enabled && !checkChildBtnDisabled(btn, scope.row)"
                                    :content="btn.label"
                                    placement="bottom"
                                    :disabled="!btn.icon || btn.icon && btn.icon.show_text"
                                )
                                    //- 关联服务表格行显示的操作按钮
                                    el-button(
                                        :plain="btn.icon && btn.icon.plain ? btn.icon.plain : false"
                                        :type="btn.icon && btn.icon.type ? btn.icon.type : 'default'"
                                        :icon="btn.icon && btn.icon.class ? btn.icon.class : ''"
                                        :size="btn.icon && btn.icon.size ? btn.icon.size : 'small'"
                                        :key="btn.key"
                                        @click="handlerClick(btn, service.service_code, row, [scope.row])"
                                    ) {{ btn.icon && !btn.icon.show_text ? '' : btn.label || btn.key }}
        OperatorFormPanel(
            ref="operator"
            v-if="editDialogSiwtch"
            :dialogSwitch="editDialogSiwtch"
            :formItems="formItems"
            :formdata.sync="formdata"
            :externalFormData="externalFormData"
            :btn="checkedBtn"
            @operatorHandler="operatorHandler"
            @shutDownDialog="shutDownDialog"
        )
</template>
<script>
/**
 * @description 子服务带有关联服务的明细组件（qingcloud_lb_listener）
 */
import OperatorFormPanel from './OperatorFormPanel'
import Api from '@api'

export default {
    props: ['checkedMetadata', 'metadata', 'checkedInstanceId', 'checkedProviderId', 'tableData', 'columns'],
    data () {
        return {
            detailSwitches: [],
            checkedBtn: {}, // 点击选中的按钮
            formItems: [],
            formdata: {},
            checkedChildRow: {},
            externalFormData: { 'checkedInstanceId': this.checkedInstanceId, 'provider_id': this.checkedProviderId },
            checkedChildInstanceId: null,
            checkedChildRelatedInstances: {},
            checkedServiceType: 'child',
            editDialogSiwtch: false
        }
    },

    methods: {
        routeTo (service, row) {
            let instance_id = row[service.value_field]
            if (this.checkedMetadata.service_code === 'qingcloud_lb_listener')
                instance_id = row.resource_id
            this.$router.push('/' + service.service_code + '/instanceDetail/' + instance_id + '/')
        },

        formatterChildRow (row, key) {
            let index = this.columnKeys.indexOf(key)
            if (index !== -1) {
                let column = JSON.parse(JSON.stringify(this.columns[index]))
                column.key = column.prop

                if (this.checkedMetadata.service_code === 'qingcloud_lb_listener') {
                    let qingLstener = this.getQingcloudListenerInfo(row, key, column)
                    if (qingLstener !== false)
                        return qingLstener
                }
                if (column.enum && Array.isArray(column.enum)) {
                    let rst = this.formatterAttr(column, row, 'name')
                    return rst
                }
            }
            return row[key]
        },

        /**
         * @description 青云监听器添加特殊解析
         */
        getQingcloudListenerInfo (row, key, column) {
            // 处理会话保持的显示
            if (key === 'session_sticky' && row.session_sticky) {
                let values = row.session_sticky.split('|')
                let session_sticky_cookie_column = this.findChildFormItem('session_sticky_cookie')
                if (session_sticky_cookie_column) {
                    let session_sticky_cookie = this.formatterAttr(session_sticky_cookie_column, {'session_sticky_cookie': values[0]}, 'name')
                    return session_sticky_cookie + ':' + (values[1] ? values[1] : '')
                }
            }
            // 处理健康检查
            if (key === 'healthy_check_method') {
                let values = row.healthy_check_method.split('|')
                let healthy_check_method = this.formatterAttr(column, {healthy_check_method: values[0]}, 'name')
                if (row.healthy_check_method === 'tcp')
                    return healthy_check_method
                else if (row.healthy_check_method !== 'tcp' && values.length > 2)
                    return healthy_check_method + '; URL: ' + values[1] + '; HOST: ' + values[2]
            }
            // 处理健康选项
            if (key === 'healthy_check_option') {
                let values = row.healthy_check_option.split('|')
                if (!values.length || values.length !== 4)
                    return row.healthy_check_option
                return '时间间隔: ' + values[0] + '秒; 超时: ' + values[1] + '秒; 不健康阈值: ' + values[2] + '次; 健康阈值: ' + values[3] + '次'
            }
            return false
        },

        findChildFormItem (key) {
            return this.checkedMetadata.attribute.filter(
                item => {
                    if (item.key === key)
                        return item
                }
            )[0]
        },

         /**
         * @description 获取元数据属性中enum类型的映射值
         */
        getTransformObj (column) {
            let rst = {}
            if (column && column.enum) {
                column.enum.forEach(
                    status => {
                        rst[status.id] = status
                    }
                )
            }
            return rst
        },

        /**
         * @description 需要解析显示的表格列
         */
        formatterAttr (column, row, _property = 'name', _default = '--') {
            let allStateKeys = this.getTransformObj(column)
            // UCMP3-850 具有enum列表且取值多选的属性，解析其显示内容
            if (column.multiple && Array.isArray(row[column.key]) && row[column.key].length) {
                let rst = []
                row[column.key].forEach(
                    item => {
                        if (allStateKeys && allStateKeys[item] && allStateKeys[item][_property])
                            rst.push(allStateKeys[item][_property])
                        else
                            rst.push(row[column.key])
                    }
                )
                return rst
            }
            if (allStateKeys && allStateKeys[row[column.key]] && allStateKeys[row[column.key]][_property])
                return allStateKeys[row[column.key]][_property]
            else
                return row[column.key] ? row[column.key] : _default
        },

        handlerClick (btn, type, row, relatedRows = []) {
            this.checkedBtn = btn
            this.checkedServiceType = type
            this.checkedChildRow = row
            let formItems = []
            if (row)
                this.$set(this.externalFormData, this.valueField, row[this.valueField])

            // 设置关联服务选中的行id信息
            if (type !== 'child' && (btn.instance_min_count || btn.columns || btn.instance_max_count) && relatedRows.length) {
                // 如果有预设参数信息
                if (btn.endpoint._params && Array.isArray(btn.endpoint._params) && btn.endpoint._params.length) {
                    let backend = relatedRows.map(
                        _row => {
                            let item = {}
                            btn.endpoint._params.forEach(
                                _param => {
                                    item[_param] = _row[_param]
                                }
                            )
                            return item
                        }
                    )
                    this.$set(this.externalFormData, type, backend)
                } else {
                    let value_field = this.relatedServiceObjects[type].value_field ? this.relatedServiceObjects[type].value_field : 'instance_id'
                    let instance_ids = relatedRows.map(
                        row => {
                            return row[value_field]
                        }
                    )

                    this.$set(this.externalFormData, value_field, instance_ids.join(','))
                }
            }

            if (type === 'child' && btn.key === 'create') {
                formItems = this.checkedMetadata.attribute.filter(
                    item => {
                        return item.created
                    }
                )
                // 新创建服务实例不考虑 disabled 的场景
                formItems.filter(
                    item => {
                        delete item.disabled
                    }
                )
            }

            if (type === 'child' && btn.key === 'modify') {
                formItems = this.checkedMetadata.attribute.filter(
                    item => {
                        return item.modified
                    }
                )
            }

            if (type !== 'child' && btn.key === 'create') {
                formItems = this.relatedServiceObjects[type].attribute.filter(
                    item => {
                        return item.created
                    }
                )

                formItems = JSON.parse(JSON.stringify(formItems))
                formItems = formItems.filter(
                    formItem => {
                        // UCMP3-931 监听器协议ssl、tcp添加后端不能使用转发策略
                        if (formItem.key !== 'loadbalancer_policy_id')
                            return formItem
                        if (row.listener_protocol !== 'tcp' && row.listener_protocol !== 'ssl')
                            return formItem
                    }
                )
                // 选中的子服务实例id
                this.$set(this.externalFormData, this.valueField, row[this.valueField])
            }

            if (type !== 'child' && btn.key === 'modify') {
                formItems = this.relatedServiceObjects[type].attribute.filter(
                    item => {
                        return item.modified
                    }
                )

                // 选中的子服务实例id
                this.$set(this.externalFormData, this.valueField, row[this.valueField])
            }

            if (btn.attribute)
                formItems = JSON.parse(JSON.stringify(btn.attribute))
            this.formItems = JSON.parse(JSON.stringify(formItems))

            // 修复点击创建、修改监听器后默认保存监听器的错误操作
            if (this.formItems.length) {
                this.editDialogSiwtch = true
                return
            }

            if (btn.warn) {
                this.$confirm(btn.warn.text, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.operatorHandler()
                }).catch(() => {
                })
                return
            }

            // 默认操作
            this.operatorHandler()
        },

        handleSelectionChange (id, service_code, val) {
            this.checkedChildRelatedInstances[id + '_' + service_code] = val
        },

        checkRelatedTopBtnDisabled (btn, id, service_code, row) {
            // 选中的实例数量大于按钮要求的数量，禁用该按钮
            if (btn.instance_max_count && this.checkedChildRelatedInstances[id + '_' + service_code] && this.checkedChildRelatedInstances[id + '_' + service_code].length > btn.instance_max_count)
                return true
            if (btn.instance_min_count && this.checkedChildRelatedInstances[id + '_' + service_code] && this.checkedChildRelatedInstances[id + '_' + service_code].length < btn.instance_min_count)
                return true
            // 按钮没有禁用条件，可直接使用该按钮
            if (!btn.disabled_rules || !btn.disabled_rules.length)
                return false
            let rst = false

            // 检查当前按钮屏蔽条件是否与子服务的实例数据有关系 [child_service_code].[attribute_key]
            let copiedBtn = {disabled_rules: []}
            rst = btn.disabled_rules.forEach(
                disable_rule => {
                    let keys = disable_rule.key.split('.')
                    if (keys.length === 2 && keys[0] === this.checkedMetadata.service_code) {
                        let disabled_rule = JSON.parse('{}')
                        disabled_rule.key = keys[1]
                        disabled_rule.value = JSON.parse(JSON.stringify(disable_rule.value))
                        copiedBtn.disabled_rules.push(disabled_rule)
                    }
                }
            )
            // 如果当前按钮屏蔽条件与子服务的实例数据有关系,校验是否可以使用
            if (copiedBtn.disabled_rules.length) {
                rst = this.checkChildBtnDisabled(copiedBtn, row)
                if (rst)
                    return rst
            }
            // 根据按钮定义的规则和选中行的数据校验当前按钮是否应该被禁用
            for (let i = 0; i < this.checkedChildRelatedInstances[id + '_' + service_code].length; i++) {
                rst = this.checkChildBtnDisabled(btn, this.checkedChildRelatedInstances[id + '_' + service_code][i], row)
                if (rst)
                    return true
            }
            return rst
        },

        /**
         * @description 子服务以及关联服务(表格)明细按钮显示/隐藏校验条件
         */
        checkChildBtnDisabled (btn, row) {
            // 禁用的条件不存在或者长度为0，默认允许使用
            if (!btn.disabled_rules || !btn.disabled_rules.length || !row)
                return false

            // 比对当前选中行内容是否对该按钮禁用条件生效
            for (let rule_index = 0; rule_index < btn.disabled_rules.length; rule_index++) {
                for (let value_index = 0; value_index < btn.disabled_rules[rule_index].value.length; value_index++) {
                    // 如果条件值为 Boolean 类型
                    if (typeof btn.disabled_rules[rule_index].value[value_index] === 'boolean') {
                        let transform = row[btn.disabled_rules[rule_index].key] ? true : false
                        return transform === btn.disabled_rules[rule_index].value[value_index]
                    }

                    // 取值类型为数组
                    if (Array.isArray(row[btn.disabled_rules[rule_index].key])) {
                        if (row[btn.disabled_rules[rule_index].key].indexOf(btn.disabled_rules[rule_index].value[value_index]) !== -1)
                            return true
                    } else if (btn.disabled_rules[rule_index].value[value_index] === row[btn.disabled_rules[rule_index].key])
                        return true
                }
            }
            return false
        },

        toolTipContent (btn, keyValue, service_code, row) {
            let disabled = this.checkRelatedTopBtnDisabled(btn, keyValue, service_code, row)
            if (!disabled || !btn.disabled_description)
                return btn.label
            else return btn.disabled_description
        },

        /**
         * @description 实际操作事件
         */
        operatorHandler () {
            let method = this.checkedBtn.endpoint && this.checkedBtn.endpoint.method ? this.checkedBtn.endpoint.method : 'get'
            // 请求方法全部转为小写字母，适配axios要求
            method = method.toLowerCase()
            let formdata = { ...this.formdata, ...this.externalFormData }

            // 保存子服务或者关联服务表单时不附带 provider_id 信息，以免接口400报错
            if (method === 'post' || method === 'put')
                delete formdata.provider_id
            this.xhr(this.checkedBtn, formdata)
        },

        xhr (btn, params) {
            let method = btn.endpoint && btn.endpoint.method ? btn.endpoint.method : 'get'
            // 请求方法全部转为小写字母，适配axios要求
            method = method.toLowerCase()
            let url = btn.endpoint && btn.endpoint.url ? btn.endpoint.url : '/'
            let title = btn.label || btn.key

            Api[method](url, params, true).then(
                res => {
                    this.$notify.success(title + '成功')
                    this.editDialogSiwtch = false

                    if (method === 'get')
                        return
                    this.xhrSuccessEvent()
                }
            )
        },

        xhrSuccessEvent () {
            let querySingleChildInstance = this.checkedMetadata.actions.filter(
                action => {
                    if (action.key === 'query_instance')
                        return action
                }
            )[0]

            // 更新子服务的数据
            // 如果是子服务的操作，且当前按钮针对多个实例 或者 针对单个实例但是没有查询单个子服务实例的按钮
            // 如果是针对关联服务的操作， 且没有查询单个子服务实例的按钮
            // eslint-disable-next-line
            if (this.checkedServiceType === 'child' && (!this.checkedBtn.columns || this.checkedBtn.columns && !querySingleChildInstance) || !this.checkedServiceType != 'child' && !querySingleChildInstance)
                this.$emit('updateChildServiceInstances')
            // eslint-disable-next-line
            else if ((this.checkedServiceType === 'child' && this.checkedBtn.columns || this.checkedServiceType !== 'child') && querySingleChildInstance)
                this.updateSingleInstances(querySingleChildInstance)
            this.initParams()
        },

        shutDownDialog () {
            this.editDialogSiwtch = false
            this.initParams()
        },

        /**
         * @description 更新关联服务的实例列表
         */
        updateSingleInstances (btn) {
            this.xhr(btn, this.externalFormData)
        },

        /**
         * @description 初始化参数
         */
        initParams () {
            this.checkedBtn = {}
            this.formItems.splice(0, this.formItems.length)
            this.formdata = {}
            this.checkedServiceType = 'child'
            this.checkedChildRow = JSON.parse(JSON.stringify('{}'))
            this.externalFormData = JSON.parse(JSON.stringify({ 'checkedInstanceId': this.checkedInstanceId, 'provider_id': this.checkedProviderId }))
        },

        changeChildDetailColumnsDisplay (row_index) {
            if (!this.detailSwitches[row_index])
                this.initMoreDetailSwitch()
            this.detailSwitches[row_index]._switch = !this.detailSwitches[row_index]._switch
        },

        /**
         * @description 初始化明细显示开关状态
         */
        initMoreDetailSwitch () {
            // 更新子服务明细显示开关
            let _switch = { _switch: false }
            for (let i = 0; i < this.tableData.length; i++)
                !this.detailSwitches[i] && this.detailSwitches.push(JSON.parse(JSON.stringify(_switch)))
        }
    },

    computed: {
        /**
         * @description 当前子服务所有操作列表
         */
        btns () {
            let btns = []
            if (this.checkedMetadata && this.checkedMetadata.normal_actions) {
                Object.keys(this.checkedMetadata.normal_actions).forEach(
                    btn_key => {
                        let btn = JSON.parse(JSON.stringify(this.checkedMetadata.normal_actions[btn_key]))
                        btn.key = btn_key
                        if (btn_key !== 'created')
                            btns.push(btn)
                    }
                )
            }
            if (this.checkedMetadata && this.checkedMetadata.actions)
                btns = btns.concat(this.checkedMetadata.actions)

            return btns
        },

        /**
         * @description 当前子服务的id属性key
         */
        valueField () {
            if (this.checkedMetadata.normal_actions.query && this.checkedMetadata.normal_actions.query.endpoint && this.checkedMetadata.normal_actions.query.endpoint.value_field)
                return this.checkedMetadata.normal_actions.query.endpoint.value_field
            if (this.checkedMetadata.value_field)
                return this.checkedMetadata.value_field
            return 'id'
        },

        /**
         * @description 当前子服务的name属性key
         */
        textField () {
            if (this.checkedMetadata.normal_actions.query && this.checkedMetadata.normal_actions.query.endpoint && this.checkedMetadata.normal_actions.query.endpoint.text_field)
                return this.checkedMetadata.normal_actions.query.endpoint.text_field
            if (this.checkedMetadata.text_field)
                return this.checkedMetadata.text_field
            return 'name'
        },

        columnKeys () {
            return this.columns.map(
                column => {
                    return column.prop
                }
            )
        },

        /**
         * @description 当前子服务的所有关联服务的按钮列表
         */
        relatedServiceBtns () {
            let rst = {}
            this.checkedMetadata.related_service.forEach(
                service => {
                    let btns = []
                    if (service && service.normal_actions) {
                        Object.keys(service.normal_actions).forEach(
                            btn_key => {
                                let btn = JSON.parse(JSON.stringify(service.normal_actions[btn_key]))
                                btn.key = btn_key
                                btns.push(btn)
                            }
                        )
                    }
                    if (service && service.actions)
                        btns = btns.concat(service.actions)
                    rst[service.service_code] = btns
                }
            )
            return rst
        },

        /**
         * @description 当前子服务的所有关联服务的表格列集合
         */
        relatedServiceColumns () {
            let rst = {}
            this.checkedMetadata.related_service.forEach(
                service => {
                    let columns = service.attribute.filter(
                        item => {
                            if (item.table_column)
                                return item
                        }
                    )
                    rst[service.service_code] = columns
                }
            )
            return rst
        },

        relatedServiceObjects () {
            let rst = {}
            this.checkedMetadata.related_service.forEach(
                service => {
                    rst[service.service_code] = service
                }
            )

            return rst
        }
    },

    watch: {
        'tableData.length' (newVal, oldVal) {
            if (newVal === oldVal || newVal <= this.detailSwitches.length)
                return
            // 初始化明细显示开关状态
            this.initMoreDetailSwitch()
            // 更新表格选中值
            this.tableData.forEach(
                row => {
                    this.checkedMetadata.related_service.forEach(
                        service => {
                            if (!this.checkedChildRelatedInstances[row[this.valueField] + '_' + service.service_code])
                                this.$set(this.checkedChildRelatedInstances, row[this.valueField] + '_' + service.service_code, [])
                        }
                    )
                }
            )
        }
    },

    components: {
        OperatorFormPanel
    }
}
</script>
<style lang="scss" scoped>
.child-service-row {
    margin-top: 16px;
}
.first-row {
    & > .child-service-detail {
        width: calc(100% - 100px);
    }
    & > .control-btn {
        position: absolute;
        right:0;
        top: 0;
    }
}
.operator-btn-container {
    margin-left: 10px;
    &:first-child {
        margin-left: 0;
    }
}
</style>

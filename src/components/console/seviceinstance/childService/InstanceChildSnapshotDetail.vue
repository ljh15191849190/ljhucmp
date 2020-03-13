<template lang="pug">
  div.full-height
    UcmpTableContainer(:advance="advanceSwitch")
      div.full-height(slot="tableContainer")
        el-table(:data="tableData" row-key="snapshot_id" default-expand-all :tree-props="{children: 'children', hasChildren: 'hasChildren'}" border v-loading="isLoading" style="width: 100%")
            //- el-table-column(type="selection" width="45")
            el-table-column(
                v-if="columns && columns.length"
                v-for="column in columns"
                :key="column.prop"
                :prop="column.prop" 
                :label="column.label" 
                :width="column.width"
            )
                template(slot-scope="scope")
                    span(v-if="column.prop === 'type'") {{ column | _filterType2str(scope.row) }}
                    //- span(v-if="column.prop === 'status'") {{ column | _filterStatus2str(scope.row) }}
                    div(v-else-if="column.prop === 'status'")
                        el-tag(
                            :type="statusTypeObj[scope.row.status] ? statusTypeObj[scope.row.status].style : 'default'"
                            :style="statusTypeObj[scope.row.status] && statusTypeObj[scope.row.status].custom_style ? statusTypeObj[scope.row.status].custom_style : {}"
                            size="mini"
                        ) {{formatterAttr(column, scope.row)}}
                    span(v-else-if="column.prop === 'created_at'") 
                        span(v-if="scope.row[column.prop]") {{ scope.row[column.prop] | FormatTime }}
                        span(v-else) --
                    span(v-else-if="column.prop === 'snapshot_name'")
                        el-tooltip(
                            v-if="scope.row.current"
                            content="表示该机器当前所在位置为该快照下方" placement="right"
                        )
                            span {{scope.row[column.prop]}}  
                                i.el-icon-star-on
                        span(v-else) {{scope.row[column.prop]}}
                    span(v-else) {{scope.row[column.prop]}}  
                //- template(slot-scope="scope" v-if="column.prop !== 'type'") 111
            el-table-column(label="操作" width="200")
                template(slot-scope="scope")
                    IconButton(
                        v-btn-privilege="btnServiceCode + '_' + btn.name"
                        v-for="(btn, index) in btns"
                        :key="index"
                        :type="btn.icon && btn.icon.class"
                        :text="btn.label"
                        :disabled="checkChildBtnDisabled(btn, scope.row)"
                        @iconClick="handlerClick(btn, 'child', scope.row)"
                    )
    el-dialog(v-if="dymaicModalSwitch" :title="checkedBtn.label" :visible.sync="dymaicModalSwitch" width="700px")
        el-form(label-width="120px" size="small" label-position="left")
            DynamicForm(
                :formItems="formItems || attribute"
                :formData.sync="items_data"
            )
                div.wram-tips(slot="MoreConfForm") <i class="el-icon-info"></i> 内存快照只适用于VMware;&nbsp;青云的快照即为青云备份服务。
            el-form-item.rw-input
                el-button(
                    v-for="btn in submitBtns"
                    :key="btn.prop"
                    :type="btn.type"
                    @click="submitHandler(btn)"
                    :loading="isSaving && (btn.prop !== 'quit')") {{btn.label}}
</template>
<script>
import DynamicForm from '@/components/common/dynamicForm/DynamicForm'
import { mapGetters, mapActions } from 'vuex'
import MetadataUtils from '@server/metadata.utils'
import Api from '@api'

export default {
    inject: ['$validator'],
    props: ['columns', 'originData', 'checkedMetadata'],
    data () {
        return {
            // 数据列表
            tableData: [],
            // 与元数据相关的选中数据 ( 调用接口的时候需要用到 )
            checkedBtn: {},
            checkedChildRow: {},
            // 拼装接口参数
            externalFormData: {},
            dialogSwitch: false,
            isLoading: false,
            advanceSwitch: false,
            pagination: {
                index: 1,
                count: 1,
                size: 20,
                total: 0
            },
            submitBtns: [
                {prop: 'quit', label: '取消', type: 'default'},
                {prop: 'submit', label: '确定', type: 'primary'}
            ],
            formItems: null,
            items_data: {},
            dymaicModalSwitch: false,
            isSaving: false,
            timeUnitText: {
                week: '周',
                day: '日',
                hour: '小时',
                minute: '分'
            }
        }
    },
    methods: {
        /**
         * 初始化页面信息
         */
        init () {
            // 获取列表数据
            this.refreshList()
        },
        /**
         * 刷新 tableData 列表数据
         * @pagination 分页相关信息
         */
        refreshList () { 
            this.tableData = this._getTableData()
        },
        /**
         * dialog对话框中的按钮操作
         */
        submitHandler (btn) {
            if (btn.prop === 'quit') {
                this.dymaicModalSwitch = false
                this.formItems = null
            } else if (btn.prop === 'submit') { 
                this.$validator.validateAll().then(validate => {
                    if (validate) {
                        // 因为这里的弹出框只是修改，因此暂时先写死，以后有需要再写成动态的
                        this.modify()
                    }
                })
            }
        },
        /**
         * 元数据中按钮事件统一处理
         */
        handlerClick (btn, type, row) {
            // 绑定事件执行需要的参数
            this.checkedBtn = btn
            this.checkedChildRow = row
            let eventName = btn.name
            if (eventName) {
                // 事件触发的起点
                this[eventName]()
            } else 
                console.error(`事件统一处理handlerClick中的关键参数eventName不存在!`)
        },
        /**
         * 修改快照需要弹出dialog框, 这里是点确定后真正提交请求的地方
         */
        modify () {
            let method = this.checkedBtn.endpoint && this.checkedBtn.endpoint.method ? this.checkedBtn.endpoint.method : 'get'
            // 请求方法全部转为小写字母，适配axios要求
            method = method.toLowerCase()
            let params = this.getEndpointParams(this.checkedBtn.endpoint.url, this.checkedChildRow)
            // let formdata = { ...params, ...this.externalFormData }
            let formdata = { ...params, ...this.items_data }
            // 保存子服务或者关联服务表单时不附带 provider_id 信息，以免接口400报错
            if (method === 'post' || method === 'put')
                delete formdata.provider_id
            this.xhr(this.checkedBtn, formdata)
        },
        /**
         * 修改快照
         */
        modify_snapshot () {
            let btn = this.checkedBtn
            if (btn.attribute) {
                this.formItems = MetadataUtils.gerenateFormItems(btn.attribute, this.checkedChildRow)
                // 对表单数据进行初始化
                let values = {}
                this.formItems.forEach(item => {
                    if (this.checkedChildRow.hasOwnProperty(item.key))
                        values[item.key] = this.checkedChildRow[item.key]
                })
                this.items_data = JSON.parse(JSON.stringify(values))
            }
            this.dymaicModalSwitch = true
        },
        /**
         * 恢复快照
         */
        revert_snapshot () {
            let name = this.checkedChildRow[this.name_field]
            let ecsInstanceName = this.checkedChildRow.ecs_instance_name
            this.$confirm(`通过快照“${name}”恢复云主机“${ecsInstanceName}”，是否继续？`, '恢复快照', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'info'
            }).then(() => {
                let method = this.checkedBtn.endpoint && this.checkedBtn.endpoint.method ? this.checkedBtn.endpoint.method : 'get'
                // 请求方法全部转为小写字母，适配axios要求
                method = method.toLowerCase()
                // 拼接 instance_ids 参数
                let ary = []
                ary.push(this.checkedChildRow[this.valueField])
                // 接口的规范，需要统一传数组格式的数据
                this.externalFormData = {
                    instance_ids: ary
                }
                let params = this.getEndpointParams(this.checkedBtn.endpoint.url, this)
                let formdata = { ...params, ...this.externalFormData }
                // 保存子服务或者关联服务表单时不附带 provider_id 信息，以免接口400报错
                if (method === 'post' || method === 'put')
                    delete formdata.provider_id
                this.xhr(this.checkedBtn, formdata)
            }).catch(() => {

            })
        },
        /**
         * 删除快照
         */
        delete_snapshot () {
            let name = this.checkedChildRow[this.name_field]
            let recycleTime = `${this.recycleConfig.storageTime}${this.timeUnitText[this.recycleConfig.timeUnit]}`
            let msg_tip = `确定删除快照“${name}”吗？删除后将放入回收站, 您可以在回收站进行恢复。(注意：放入回收站后, 将在${recycleTime}后自动删除并释放资源!)`
            this.$confirm(msg_tip, '删除快照', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                customClass: 'warningConfirmBox',
                type: 'warning'
            }).then(() => {
                let method = this.checkedBtn.endpoint && this.checkedBtn.endpoint.method ? this.checkedBtn.endpoint.method : 'get'
                // 请求方法全部转为小写字母，适配axios要求
                method = method.toLowerCase()
                // 拼接 instance_ids 参数
                let ary = []
                ary.push(this.checkedChildRow[this.valueField])
                // 接口的规范，需要统一传数组格式的数据
                this.externalFormData = {
                    instance_ids: ary.join(',')
                }
                let params = this.getEndpointParams(this.checkedBtn.endpoint.url, this)
                let formdata = { ...params, ...this.externalFormData }
                // 保存子服务或者关联服务表单时不附带 provider_id 信息，以免接口400报错
                if (method === 'post' || method === 'put')
                    delete formdata.provider_id
                this.xhr(this.checkedBtn, formdata)
            }).catch(() => {

            })
        },

        /**
         * 真实触发ajax请求的地方
         */
        xhr (btn, params) {
            let method = btn.endpoint && btn.endpoint.method ? btn.endpoint.method : 'get'
            // 请求方法全部转为小写字母，适配axios要求
            method = method.toLowerCase()
            let url = btn.endpoint && btn.endpoint.url ? btn.endpoint.url : '/'
            let title = btn.label || btn.key
            // 触发 loading 的加载效果
            this.isLoading = true
            Api[method](url, params, true).then(
                res => {
                    // 关闭 loading 的加载效果
                    this.isLoading = false
                    if (btn.name === 'modify_snapshot') {
                        this.dymaicModalSwitch = false
                        this.$notify.success(title + '成功')
                    } else if (btn.name === 'delete_snapshot') 
                        this.$notify.success('操作成功, 删除的资源已放入回收站中！')
                    else
                        this.$notify.success(`正在${title}中，请稍后查询`)

                    if (method === 'get')
                        return
                    this.xhrSuccessEvent()
                }
            ).catch(() => {
                this.$notify.error(title + '失败')
                // 关闭 loading 的加载效果
                this.isLoading = false
            })
        },

        /**
         * 接口的增、删、改可以触发数据改变的操作，需要通知父组件来更新当前列表的数据
         */
        xhrSuccessEvent () {
            // 如果执行了恢复操作, 会触发主机状态的变更，需要调接口去更新状态
            this.serviceInstanceDetail()
        },

        quit () {
            this.dialogSwitch = false
        },

        /**
         * @description 子服务以及关联服务(表格)明细按钮显示/隐藏校验条件
         */
        checkChildBtnDisabled (btn, row) {
            // 当前主机状态为恢复中的话，所有的恢复按钮都要禁用
            let instanceStatus = this.selectedInstanceInfo ? this.selectedInstanceInfo.status : ''    
            if (instanceStatus === 'reverting' && btn.name === 'revert_snapshot') 
                return true
            
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
        /**
         * 获取元数据中action中的endpoint中正则匹配后的参数
         */
        getEndpointParams (url, _params) {
            let regex = /\/\:[\w\-]+\//g
            let matched = url.match(regex)
            if (matched && Array.isArray(matched) && matched.length) {
                let params = {}
                matched.forEach(
                    item => {
                        let _key = item.replace(/[\:\/]/g, '')
                        params[_key] = _params[_key]
                    }
                )
                return params
            } else return {}
        },
        /**
         * 获取主机实例详情
         */
        serviceInstanceDetail () {
            let params = {}
            params.service = 'ecs'
            params.instanceId = this.checkedInstanceId
            Api.get('serviceInstanceDetail', params, true).then(
                res => {
                    if (res) 
                        this.setSelectedInstanceInfo(res)
                    this.$emit('updateChildServiceInstances')
                }
            )
        },

        /**
         * @description 需要解析显示的表格列
         */
        formatterAttr (column, row) {
            // UCMP3-888 控制台管理页面显示网络类型特殊配置
            if (this.serviceCode === 'qingcloud_lb' && column.prop === 'vxnet_type' && !row[column.prop])
                row[column.prop] = '0'
            let allStateKeys = this.getTransformObj(column)
            if (allStateKeys && allStateKeys[row[column.prop]] && allStateKeys[row[column.prop]].name)
                return allStateKeys[row[column.prop]].name || '--'
            else
                return row[column.prop] ? row[column.prop] : '--'
        },

        /**
         * @description 获取元数据属性中enum类型的映射值
         */
        getTransformObj (column) {
            let rst = {}
            if (column.prop && this.instanceAttributesObj[column.prop] && this.instanceAttributesObj[column.prop].enum) {
                this.instanceAttributesObj[column.prop].enum.forEach(
                    status => {
                        rst[status.id] = status
                    }
                )
            }
            return rst
        },
        /**
         * 根据源数据来列表数据
         */
        _getTableData () {
            let result = []
            if (this.originData && Array.isArray(this.originData.list) && this.originData.list.length) {
                let originList = JSON.parse(JSON.stringify(this.originData.list))
                let list = generateOptions(originList)
                let flatList = getFlat(list)
                // 存在于原始列表中, 但是存在于树形结构中的数据，统一整理后，加入到第一层级
                let filterList = originList.filter(item => {
                    // 当前快照不存在与最终的树形列表中，则返回true
                    return flatList.indexOf(item.snapshot_id) === -1
                })
                result = list.concat(filterList)
            }

            function getFlat (list) {
                let arr = []
                list.forEach(item => {
                    arr.push(item.snapshot_id)
                    getChildFlat(arr, item.children)
                })

                return arr
            }

            function getChildFlat (arr, children) {
                if (children && Array.isArray(children) && children.length) {
                    children.forEach(item => {
                        arr.push(item.snapshot_id)
                        getChildFlat(arr, item.children)
                    })
                }
            }

            function generateOptions (params) { //生成Cascader级联数据
                var result = []
                for (let param of params) {
                    if (!param.parent_snapshot_id) { //判断是否为顶层节点
                        let parent = Object.assign({}, param)
                        parent.children = getchilds(param.snapshot_id, params) //获取子节点
                        result.push(parent)
                    }
                }
                return result
            }

            function getchilds (id, array) {
                let childs = []
                for (let arr of array) { //循环获取子节点
                    if (arr.parent_snapshot_id === id) {
                        let obj = Object.assign({}, arr)
                        childs.push(obj)
                    }
                }
                for (let child of childs) { //获取子节点的子节点
                    let childscopy = getchilds(child.snapshot_id, array)//递归获取子节点
                    if (childscopy.length > 0) 
                        child.children = childscopy
                }
                return childs
            }

            return result
        },

        ...mapActions([
            'setSelectedInstanceInfo'
        ])
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
                        // 黑名单
                        let disabledList = ['created', 'query']
                        let btn = JSON.parse(JSON.stringify(this.checkedMetadata.normal_actions[btn_key]))
                        btn.key = btn_key
                        if (disabledList.indexOf(btn_key) === -1)
                            btns.push(btn)
                    }
                )
            }
            if (this.checkedMetadata && this.checkedMetadata.actions)
                btns = btns.concat(this.checkedMetadata.actions)
            return btns
        },
        /**
         * 删除操作时, 必须的参数
         */
        service_code () {
            return this.checkedMetadata.service_code ? this.checkedMetadata.service_code : 'ecs_snapshot'
        },
        /**
         * 元数据中的名称
         */
        name_field () {
            return this.checkedMetadata.name_field ? this.checkedMetadata.name_field : 'snapshot_name'
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
         * @description 状态类型对象集合，前端配置文件必须有state配置才可生效
         */
        statusTypeObj () {
            let rst = {}
            if (this.instanceAttributesObj.status && this.instanceAttributesObj.status.enum) {
                this.instanceAttributesObj.status.enum.forEach(
                    status => {
                        rst[status.id] = status
                    }
                )
            }
            return rst
        },
        instanceAttributesObj () {
            let rst = {}
            if (this.checkedMetadata && this.checkedMetadata.attribute) {
                // 此处checkedMetadata需要深拷贝之后再使用，因为在代码中会对instanceAttributesObj这个checkedMetadata的衍生对象进行修改，导致vuex报错
                JSON.parse(JSON.stringify(this.checkedMetadata.attribute)).forEach(
                    attr => {
                        rst[attr.key] = attr
                    }
                )
            }
            return rst
        },
        btnServiceCode () {
            return this.$route.params.code
        },
        ...mapGetters([
            'selectedInstanceInfo',
            'checkedInstanceId',
            'recycleConfig'
        ])
    },
    watch: {
       'originData': {
            deep: true,
            handler (newVal) {
                // 源数据改变后, 触发列表自动更新
                this.init()
            }
       } 
    },
    filters: {
        _filterType2str (cloumn, row) {
            let rst = ''
            let enumList = cloumn.enum
            let rstItem = enumList.find(item => {
                return item.id === row.type
            })
            rst = rstItem && rstItem.name ? rstItem.name : row.type
            return rst
        },
        _filterStatus2str (cloumn, row) {
            let rst = ''
            let enumList = cloumn.enum
            let rstItem = enumList.find(item => {
                return item.id === row.status
            })
            rst = rstItem && rstItem.name ? rstItem.name : row.type
            return rst
        }
    },
    components: {
        DynamicForm
    },
    
    created () {
        this.init()
    }
}
</script>
<style lang="scss" scoped>
    .wram-tips {
        padding-left: 10px;
        margin-bottom: 15px;
    }
    .el-icon-star-on {
        font-size: 18px;
        color: #409EFF;
        &.large {
            font-size: 20px;
        }
    }
</style>


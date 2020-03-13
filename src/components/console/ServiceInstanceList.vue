<template lang="pug">
  UcmpContainer.service-instance-list(:breadcrumbItems="breadcrumbItems")
    div.full-container(slot="content" v-if="serviceCode !== 'blueprint'")
        div.th-filter(
        v-clickoutside="handleOutsideClick"
        v-if="showFilter")
            template(v-if="currentFilterItem.type === 'select' || currentFilterItem.type === 'selectObj'")
                ul.th-filter-enum(v-if="currentFilterItem.query_condition.enum")
                    li.el-dropdown-menu__item.dropdown-top(@click="headFilter(currentFilterItem, headFilterAll, true)") 全部
                    li.el-dropdown-menu__item(v-for="item in currentFilterItem.query_condition.enum" @click="headFilter(currentFilterItem, item.id, true)" :class="{'th-filter-item-checked': searchParam[currentFilterItem.query_condition.query_attribute] === item.id}") {{item.name}}
                ul.th-filter-enum(v-else-if="currentFilterItem.query_condition.data_link")
                    li.el-dropdown-menu__item(v-show="!currentFilterItem.options") 加载数据中...
                    li.el-dropdown-menu__item.dropdown-top(@click="headFilter(currentFilterItem, headFilterAll, true)") 全部
                    li.el-dropdown-menu__item(v-for="item in currentFilterItem.options"
                    :class="{'th-filter-item-checked': searchParam[currentFilterItem.query_condition.query_attribute] === item[currentFilterItem.query_condition.data_link.value_field]}"
                    @click="headFilter(currentFilterItem, item[currentFilterItem.query_condition.data_link.value_field], true)" ) {{item[currentFilterItem.query_condition.data_link.text_field]}}
            el-input(v-else-if="currentFilterItem.type === 'input' || currentFilterItem.type === 'string'" v-model="headFilterInput" size="mini" :placeholder="'请输入' + currentFilterItem.description")
                el-button(slot="append" icon="el-icon-search" @click="headFilter(currentFilterItem, headFilterInput)")
        div.top-button-container
            el-button.default-button.creat-button(v-btn-privilege="serviceCode+'_'+btn.name" v-for="(btn, index) in allActions.topGroup" :key="index" size="small" :icon="btn.icon" type="primary" @click="createHandler(btn.name)") {{btn.label}}

        EditTag(v-if="tagDialogVisible" :metaData="checkedMetadata" :isEdit="false" :visible="tagDialogVisible" @closeDialog="handlerTagDialogClose" @updateTag="updateTag")
        ExportEcs(v-if="exportEcsDialogVisible" :metaData="checkedMetadata" :isEdit="false" :visible="exportEcsDialogVisible" :searchParam="searchParam" :serviceCode="serviceCode" @closeExportEcsDialog="handlerExportEcsClose")
        //-bug #UCMP-637 【云硬盘】先点击云硬盘页面，再切到云主机页面查看状态下拉框显示的是云硬盘的状态。相反也是一样
        UcmpTableContainer(
            ref="instanceTableContainerRef"
            :advance="advanceSwitch"
            :serviceCode="serviceCode"
            :pagination.sync="pagination"
            :filterItems="panelFilterItems"
            :formData="filterFormData"
            :submit="submit"
            @sizeChange="handleSizeChange"
            @currentChange="handleCurrentChange"
            @updateFilterForm="updateFilterForm"
            :containerHeight.sync="tableContainerHeight"
            :key="$route.fullPath"
        )
            div.full-height(slot="tableContainer")
                div.d-flex.justify-content-between
                    // 授权
                    div.d-flex
                      CommonPanel(v-btn-privilege="btnServiceCode+'_auth'" :checkedMetadata="checkedMetadata" :selectedInstances="selectedInstances" :serviceCode="serviceCode")
                      OperatorPanel.margin-left(
                          ref="operatorRef"
                          :basicBtns="allActions.iconGroup"
                          :advancedBtns="allActions.moreGroup"
                          :instances="operatingInstances"
                          :serviceCode="serviceCode"
                          :btnServiceCode="btnServiceCode"
                          :checkedMetadata="checkedMetadata"
                          @afterOperator="afterOperator"
                          @operatorSuccess="operatorSuccess"
                      )
                    div.d-flex.align-items-center.margin-left(slot="otherPanels" v-if="instanceAttributesObj.status")
                        LabelGroup(:stateTypes="(instanceAttributesObj.status.query_condition && instanceAttributesObj.status.query_condition.enum) ? instanceAttributesObj.status.query_condition.enum : instanceAttributesObj.status.enum" :setState="setState")
                    div.d-flex.align-items-center
                      DynamicTableCol(v-btn-privilege="btnServiceCode+'_config'" :columns.sync="displayedColumns" :key="$route.fullPath" :serviceCode="serviceCode")
                      // UCMP3-820【标签】标签不应该有导出功能
                      el-button.oper-icon-btn(v-btn-privilege="btnServiceCode+'_export'" v-if="serviceCode!=='tag'" @click="exportContent" size="mini" icon="ucmp-icon-download" title="导出")
                el-table.margin-top(
                    :data="tableData"
                    :max-height="tableMaxHeight"
                    v-loading="isLoading"
                    element-loading-spinner="ucmp-icon-loading"
                    @selection-change="handleSelectionChange"
                    border
                    @header-click="headerClick"
                    ref="table"
                )
                    el-table-column(type="selection" width="45")
                    el-table-column(:prop="column.prop" v-for="(column, index) in displayedColumns" show-overflow-tooltip :min-width="column.min_width" :key="column.prop" :label="column.label" :width="column.width" v-if="column.isShow")
                        template(slot="header" slot-scope="scope")
                            span(:class="{'th-filter-checked': headFilterKeys[scope.column.property] && (searchParam[headFilterKeys[scope.column.property]] !== undefined)}") {{scope.column.label}}
                                i.ucmp-icon-filter-down.el-icon--right(v-if="headFilterKeys[scope.column.property]")
                        template(slot-scope="scope")
                            ServiceInstanceTableColumn(:column="column" :row="scope.row" :instanceAttributesObj="instanceAttributesObj" :metadata="metadata" :checkedMetadata="checkedMetadata" :serviceCode="serviceCode" :colIndex="index")
                    el-table-column(v-if="actionColumn" :prop="actionColumn.prop" :label="actionColumn.label" :width="actionColumn.width" :fixed="actionColumn.fixed")
                        template(slot-scope="scope")
                            IconButton(
                                v-btn-privilege="btnServiceCode+'_'+btn.name"
                                v-for="(btn, index) in allActions.columnGroup"
                                :key="index"
                                :type="btn.icon"
                                :text="tableCellToolTip(btn, scope.row)"
                                :disabled="checkOneInstance(btn, scope.row)"
                                @iconClick="columnHandler(btn, scope.row)"
                                )
    div.full-container(slot="content" v-else)
        BlueprintMgt(@updateBreadCrumbs="updateBreadCrumbs")

</template>
<script>
/**
 * @description 服务动态管理页面，由【元数据】 和 【前端个性化配置文件】分析，得到筛选框、表格列信息以及按钮组等信息进行渲染
 * @author xinghua.wen
 */

import OperatorPanel from '@/components/console/OperatorPanel'
import DynamicTableCol from '@/components/common/DynamicTableCol'
import EditTag from '@/components/iaas/tagMght/EditTag'
import LabelGroup from './LabelGroup'
import Config from '@mock/metadata/metadata.config'
import DefaultColumns from '@mock/console/defaultColums.mock'
import DefaultFilterItems from '@mock/console/defaultFilterItems.mock'
import MetadataUtils from '@server/metadata.utils'
import ServiceInstanceMixin from '@mixins/serviceInstance.mixin'
import ExportEcs from './ExportEcs'
import { mapGetters } from 'vuex'
import Api from '@api'
import Sortable from 'sortablejs'
import FileSaver from 'file-saver'
import CommonPanel from './CommonPanel'
// UCMP3-1120 需要element-ui的工具需要从lib获取，而不是src，否则低版本浏览器将无法使用
import Clickoutside from 'element-ui/lib/utils/clickoutside'
import ServiceInstanceTableColumn from './ServiceInstanceTableColumn'
// 引入应用服务管理页面
import BlueprintMgt from './blueprintDetail/BlueprintManager'
import {initWebSocket} from '@leaptocloud/standard-ui'

const SUBSCRIBE_SERVICES = ['ecs', 'volume', 'f5', 'nas', 'qingcloud_rdb', 'qingcloud_cache', 'qingcloud_lb'] // 订阅状态的服务列表

export default {
    beforeRouteUpdate (to, from, next) {
        // 取消对上一个服务的状态订阅
        this.unsubscribe(from.path.split('/')[2])
        next()
        // 添加对当前服务的状态订阅
        this.subscribe()
    },
    mixins: [ServiceInstanceMixin],
    directives: {
        Clickoutside
    },
    data () {
        return {
            btnServiceCode: '',
            BUSINESS_TYPE: 'business',
            advanceSwitch: false,
            userDefined: {},
            tableContainerHeight: 300,
            allColumns: [],
            checkedColumns: [],
            text_field: '',
            value_field: '',
            defaultFilterItems: [],
            filterItems: [],
            tableData: [],
            // 表格数据请求前loading
            isLoading: true,

            // 选中需要操作的服务实例
            selectedInstances: [],
            originPagination: {
                offset: 1,
                limit: 20,
                count: 0,
                total: 0
            },
            showInstanceCfgForm: false,
            operatingInstances: null,
            // Search parameter
            searchParam: {},
            filterFormData: {},
            tagDialogVisible: false,
            exportEcsDialogVisible: false,
            showFilter: false,
            currentFilter: '',
            currentFilterItem: [],
            headFilterInput: '',
            headFilterAll: Symbol('all'),
            resourceAnalysisParams: null,
            subscribeInstance: null // webSocket订阅对象实例，用来取消订阅
        }
    },
    methods: {
        createHandler (btnName) {
            if (btnName === 'create' && this.serviceCode === 'tag') {
                //
                this.tagDialogVisible = true
            }
        },
        handlerTagDialogClose () {
            this.tagDialogVisible = false
        },
        updateTag () {
            this.handlerTagDialogClose()
            this.originPagination.offset = 1
            this.getServiceInstanceList()
        },
        handlerExportEcsClose () {
            this.exportEcsDialogVisible = false
        },
        // UCMP-560 消除 筛选表单 的所有值
        clearFilterData () {
            this.$refs.instanceTableContainerRef && this.$refs.instanceTableContainerRef.clearFilterData()
        },
        /**
         * @description 检测筛选panel 值变化，组织机构/应用二选一
         */
        updateFilterForm (data) {
            if (this.checkedMetadata.type === this.BUSINESS_TYPE) {
                // 服务 只有后台源数据添加的过滤项
                this.filterItems = JSON.parse(JSON.stringify(this.defaultFilterItems))
            } else {
                //filterItems后端元数据加上前端配置元数据
                // owner_type
                let frontFilterItem = JSON.parse(JSON.stringify(DefaultFilterItems[0]))
                if (this.displayedColumnKeys.indexOf(frontFilterItem.childKey) === -1) {
                    //
                    delete frontFilterItem.children
                }

                this.filterItems = JSON.parse(JSON.stringify([...this.defaultFilterItems, ...[frontFilterItem]]))
            }
        },

        // 初始化
        init () {
            // Change service set defaultValue
            this.setDefaultValue()
            // 获取当前服务元数据
            // this.getCurServiceMetadata()
            MetadataUtils.initMetaInfoByServiceCode(this.serviceCode, this.metadata, Config, this.$route.query.type, () => {
                // 当前服务有状态时，更新状态数据
                // UCMP3-3109【租期续期】对应用编排创建的资源续期，按照弹框提示跳转到对应实例列表，接口报参数格式不正确
                if (this.instanceAttributesObj.status && Array.isArray(this.instanceAttributesObj.status.query_condition.enum))
                    this.getServiceInstanceAttributeCount()
            })
            // Fix table columu display bug #UCMP-408
            this.getColumnsAndFiltersByMeta()

            // 续期的跳转，需要传递给蓝图一个参数，需要有删除的方式
            if (this.$route.params.blueprint_id) {
                //
                this.$set(this.searchParam, 'service_instance_id', this.$route.params.blueprint_id)
            }

            // 资源概览跳转初始化带参
            if (this.$route.query && this.$route.query.type === 'resourceAnalysis')
                this.resourceAnalysisParams = this.$route.query.params
            // 获取服务实例列表
            this.getServiceInstanceList()
        },

        // 获取服务实例列表
        getServiceInstanceList () {
            if (this.serviceCode && this.serviceCode === 'blueprint')
                return
            this.isLoading = true
            let defaultParam = {
              service: this.serviceCode,
              offset: this.originPagination.offset, // 修改云主机分页 qiu.ke
              limit: this.originPagination.limit
            }

            // 添加业务条件(资源归属、组织机构/应用值)
            let originFilter = this.searchParam ? JSON.parse(JSON.stringify(this.searchParam)) : {}
            if (originFilter && originFilter.owner_type === 'org') {
                // originFilter.owner_type = 'org'
                originFilter.owner = originFilter.org.length ? originFilter.org[originFilter.org.length - 1] : ''
            } else if (originFilter && originFilter.owner_type === 'app') {
                // originFilter.owner_type = 'app'
                originFilter.owner = originFilter.app
            } else if (originFilter && !originFilter.owner_type) {
                //
                originFilter.owner = ''
            }
            delete originFilter.org
            delete originFilter.app

            // 替换默认参数
            let preParams = Object.assign({}, defaultParam, originFilter)
            let _params = {}

            for (let [key, val] of Object.entries(preParams)) {
                // 【控制台】在控制台-云主机、云硬盘列表，设置存量资源“否”，返回结果不正确 val为false的时候应赋值
                if (![undefined, null, ''].includes(val)) {
                    //
                    _params[key] = val
                }
            }

            // 资源概览跳转带参
            if (this.resourceAnalysisParams)
                _params = {..._params, ...this.resourceAnalysisParams}

            Api.get('serviceInstance', _params, true).then(
                res => {
                    // UCMP-724 控制台菜单切换较快，修复显示上一次选中服务实例的bug
                    if (_params.service !== this.serviceCode)
                        return
                    if (res && Array.isArray(res.list)) {
                        // bug UCMP-697【云主机&云硬盘】在云主机和云硬盘列表，空信息显示方式不统一
                        // 处理服务实例数据
                        res.list.forEach(item => {
                            this.displayedColumns.forEach(col => {
                                // if (col.multiple) Array.isArray(item[col.prop]) && !item[col.prop].length && (item[col.prop] = '--')
                                // 链接字段没有值或为空数组
                                let itemProp = item[col.prop]
                                if (col.href && (itemProp === undefined || (Array.isArray(itemProp) && !itemProp.length))) {
                                    item['noLink'] === undefined && (item['noLink'] = {})
                                    item.noLink[col.prop] = true
                                }
                                // UCMP-1250 问题一：F5列表，保持会话算法显示不正确，见截图；问题二：按保持会话算法查询，结果不正确；问题三：导出F5列表，cookie字段信息丢失
                                if (_params.service === 'f5' && col.prop === 'persistence_profiles' && typeof item[col.prop] === 'object') {
                                    // let allStateKeys = this.getTransformObj(col)
                                    // item.persistence_profiles = item[col.prop].defaults_from ? (allStateKeys[item[col.prop].defaults_from] && allStateKeys[item[col.prop].defaults_from].name ? allStateKeys[item[col.prop].defaults_from].name : item[col.prop].defaults_from) : '--'
                                    item.persistence_profiles = item[col.prop].defaults_from ? item[col.prop].defaults_from.replace(/^\/Common\//, '') : '--'
                                }
                            })
                        })
                        this.tableData = res.list
                        this.originPagination.total = res.total || 0
                        this.originPagination.count = res.size || 1
                        // this.sortRows()
                    }
                    this.isLoading = false
                },
                () => {
                    this.isLoading = false
                }
            )
        },

        getServiceInstanceAttributeCount () {
            Api.get('serviceInstanceAttributesCount', { service: this.serviceCode, _attribute: 'status' }).then(
                res => {
                    this.instanceAttributesObj.status.query_condition.enum.forEach(item => {
                        item.count = res[item.id] || 0
                    })
                    // 数组结构需要解构赋值enum，更新DOM展示
                    let copyEnums = JSON.parse(JSON.stringify(this.instanceAttributesObj.status.query_condition.enum))
                    this.instanceAttributesObj.status.query_condition.enum = [...copyEnums]
                }
            )
        },

        /**
         * @description 默认每页查询条数发生变化
         */
        handleSizeChange (val) {
            this.originPagination.limit = val
            this.getServiceInstanceList()
        },

        handleCurrentChange (val) {
            this.originPagination.offset = val
            this.getServiceInstanceList()
        },

        /**
         * @description 表格操作列的按钮点击事件
         */
        columnHandler (btn, row) {
            this.operatingInstances = [row]
            this.$nextTick(
              () => {
                this.$refs.operatorRef.operationClick(btn)
              }
            )
        },

        afterOperator () {
            this.operatingInstances = this.selectedInstances
        },

        operatorSuccess () {
            this.getServiceInstanceList()
        },

        // 设置状态
        setState (state) {
            // 根据状态过滤表格数据
            if (state) {
                this.searchParam ? this.searchParam.status = state : this.searchParam = { status: state }
                this.originPagination.offset = 1
                this.$refs.instanceTableContainerRef.assignValue('status', state)
                this.getServiceInstanceList()
            }
        },

        // 通过元数据获取列表的列和过滤条件
        getColumnsAndFiltersByMeta () {
            if (!this.metaItem.service_code)
                return
            let allColumns = MetadataUtils.getColumns(this.metaItem, this.fontendConfig, this.metadata)

            // 编排类型的数据去掉template一列信息
            if (this.metaItem.group !== 'blueprint')
                this.allColumns = allColumns
            else {
                this.allColumns = allColumns.filter(
                    column => {
                        if (column.prop !== 'template')
                            return column
                    }
                )
            }

            // UCMP3-4830 根据服务配置以及全局参数为条件判断是否应该显示“租期”
            let defaultColumns = DefaultColumns.filter(column => {
                if (column.prop !== 'resource_expired_at') return column
                // eslint-disable-next-line
                if (column.prop === 'resource_expired_at' && this.checkedMetadata && (this.checkedMetadata.group !== 'blueprint' && this.checkedMetadata.tenany || this.checkedMetadata.group === 'blueprint') && this.tenancy.available) return column
            })
            // Handle default columns according to front-end config
            let copyDefaultCols = JSON.parse(JSON.stringify(defaultColumns))
            Array.isArray(copyDefaultCols) && (copyDefaultCols = copyDefaultCols.map(
              col => {
                // Merge with columns of the front-end configuration
                if (this.fontendConfig.columns && this.fontendConfig.columns[col.prop])
                    col = Object.assign({}, col, this.fontendConfig.columns[col.prop])
                return col
              }
            ))

            if (this.checkedMetadata.type === this.BUSINESS_TYPE) {
                // 服务不需要DefaultCols
                this.displayedColumns = this.allColumns
            } else {
                // 资源需要DefaultCols
                this.displayedColumns = this.allColumns.concat(copyDefaultCols)
            }

            // UCMP3-968 环境 ，需要对前端屏蔽掉。
            // 4.蓝图资源实例-环境显示蓝图实例名称，蓝图实例列表不显示环境列
            if (this.metaItem.group === 'blueprint') {
                this.displayedColumns = this.displayedColumns.filter(column => {
                    return column.prop !== 'env'
                })
            }

            // UCMP3-2740 【控制台--预留ip】部分字段没有返回值
            // 屏蔽环境、租期、资源所属类型
            // UCMP3-3078【F5】F5列表中，缺少租期字段（设置项也无此选项）
            if (this.metaItem.service_code === 'netbox_ip') {
                let notContains = ['env', 'owner_type', 'resource_expired_at']
                this.displayedColumns = this.displayedColumns.filter(column => {
                    return !notContains.includes(column.prop)
                })
            }

            this.displayedColumns.forEach(
                column => {
                    column['min_width'] = column['min_width'] || '110px'
                }
            )
            let filterItems = JSON.parse(JSON.stringify(MetadataUtils.filterItems(this.metadata, {...this.fontendConfig, ...{service_code: this.serviceCode}})))
            filterItems.forEach(
                item => {
                    delete item.required
                    delete item.multiple
                    delete item.validation
                }
            )
            MetadataUtils.updateFilterAttributeType(filterItems)
            // 修改标签的valid
            filterItems.forEach(
                item => {
                    if (item.key === 'tag') {
                        item.validation = {}
                        item.validation.max = 1
                        item.validation.min = 1
                        Array.isArray(item.attribute) && item.attribute.forEach(
                          attr => {
                            attr.required = false
                            attr.showFormItem = false
                        })
                    }
                }
            )
            this.defaultFilterItems = filterItems

            this.filterItems = this.serviceCode === this.TAG ? this.defaultFilterItems : this.defaultFilterItems.concat(DefaultFilterItems)
            this.text_field = this.metaItem.text_field
            this.value_field = this.metaItem.value_field
        },

        // 过滤查询提交
        submit (param) {
            // 查询的时候就将资源概览带参置空
            this.resourceAnalysisParams = null

            // 删除续期跳转过来传递的过滤参数
            if (this.$route.query.type === 'blueprint' && this.$route.params.blueprint_id) {
                delete this.searchParam.service_instance_id
                delete this.$route.params.blueprint_id
            }

            this.searchParam = this.handleParam(this.searchParam, param)
            this.originPagination.offset = 1
            this.getServiceInstanceList()
        },

        // 处理复杂参数(所属云主机、标签)
        handleParam (searchParam, val) {
            // oldParam保存表格头过滤的值， param是上方组件带来的值
            let oldParam = JSON.parse(JSON.stringify(searchParam))
            let param = JSON.parse(JSON.stringify(val))

            // UCMP3-1143【控制台】云主机列表，状态查询反选之后仍然生效
            if (!oldParam.status) {
                // 在表格头过滤和上方过滤时都有状态的值，以表格头过滤为主
                delete param.status
            }

            // 处理所属云主机
            if (param.ecs) {
                Object.keys(param.ecs).forEach(
                    item => {
                        // 用来删除不存在于当前searchParam中的 搜索栏中的复合值， Qs.stringify会去掉undefined的值
                        if (item && param.ecs[item]) param['ecs.' + item] = param.ecs[item]
                        else param['ecs.' + item] = undefined
                    }
                )
                delete param.ecs
            }
            // 处理标签
            if (Array.isArray(param.tag) && param.tag.length) {
                let tagParam = param.tag[0]
                Object.keys(tagParam).forEach(
                    item => {
                        if (item && tagParam[item]) param['tag.' + item] = tagParam[item]
                        else param['tag.' + item] = undefined
                    })
                delete param.tag
            }

            // 处理资源所属
            if (this.displayedColumnKeys.indexOf('owner_type') === -1) {
                param.owner_type = null
                param.app = null
                param.org = []
            }
            if (this.displayedColumnKeys.indexOf('owner_name') === -1) {
                param.app = null
                param.org = []
            }

            for (let key of Object.keys(oldParam)) {
                if (this.panelFilterItemKeys.indexOf(key) > -1) {
                    // 用来删除不存在于当前searchParam中的 搜索栏中的值
                    delete oldParam[key]
                }
            }

            // TODO 在搜索栏中的参数修改的时候必须点一次查询才会生效，组件隐藏了参数
            let tempParam = Object.assign({}, oldParam, param)
            return tempParam
        },
        // 表格选择列勾选变化处理(操作按钮的禁用是否有关)
        handleSelectionChange (val) {
            this.selectedInstances = val
            this.operatingInstances = this.selectedInstances
        },
        // 导出
        exportContent () {
            // bug UCMP-678【云主机】云主机,云硬盘和编排列表，导出功能不可用
            let originFilter = this.searchParam ? JSON.parse(JSON.stringify(this.searchParam)) : {}
            if (originFilter && originFilter.owner_type === 'org') 
                originFilter.owner = originFilter.org.length ? originFilter.org[originFilter.org.length - 1] : ''
            else if (originFilter && originFilter.owner_type === 'app') 
                originFilter.owner = originFilter.app
            else if (originFilter && !originFilter.owner_type) 
                originFilter.owner = ''
            
            delete originFilter.org
            delete originFilter.app

            let param = Object.assign({}, originFilter, {service_code: this.serviceCode, suffix: 'xlsx'})
            Api.get('serviceInstanceDownload', param, true, 'blob').then(
                res => {
                    let blob = new Blob([res], {type: 'application/vnd.ms-excel'})
                    FileSaver.saveAs(blob, this.serviceCode + '.xlsx')
                    this.$notify({
                        type: 'success',
                        title: '成功',
                        message: '导出成功'
                    })
                }
            )
        },
        // Service change set default value and clear cache
        setDefaultValue () {
          this.advanceSwitch = false
          this.userDefined = {}
          this.allColumns = []
          this.checkedColumns = []
          this.text_field = ''
          this.value_field = ''
          this.filterItems = []
          this.tableData = []
          this.selectedInstances = []
          this.originPagination = {
              offset: 1,
              limit: 20,
              count: 0,
              total: 0
          }
          // bug #UCMP-692 【云硬盘】云硬盘页面设置搜索条件查询后，云主机页面数据为空，再切换到云硬盘页面仍为上次查询结果
          this.showInstanceCfgForm = false
          this.operatingInstances = null
          this.searchParam = {}
          this.filterFormData = {}
        },

        sortRows () {
            // 添加表格行拖拽排序的方法
            const table = this.$el.querySelector('.el-table__body-wrapper tbody')
            let self = this
            Sortable.create(table, {
                onEnd ({ newIndex, oldIndex }) {
                    const targetRow = self.tableData.splice(oldIndex, 1)[0]
                    self.tableData.splice(newIndex, 0, targetRow)
                }
            })
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

        headerClick (col, event) {
            this.currentFilter = col.property

            this.currentFilterItem = this.headFilterItems.find(item => item.key === this.currentFilter)

            this.showFilter = !!this.currentFilterItem

            if (this.showFilter) {
                // eslint-disable-next-line
                (this.currentFilterItem.type === 'select' || this.currentFilterItem.type === 'selectObj' || this.currentFilterItem.query_condition.fe_type && this.currentFilterItem.query_condition.fe_type.type === 'select') && this.getFilterDataOptions(this.currentFilterItem)

                this.$nextTick(() => {
                    // 固定显示在head的下方而不是根据点击位置来显示
                    let th = this.getRootNode(event.target, 'is-leaf')
                    let thPosition = th
                        ? th.getBoundingClientRect()
                        : {bottom: event.clientY, left: event.clientX} // 防止节点未找到

                    let thFilter = document.querySelector('.th-filter')
                    thFilter.style.top = thPosition.bottom + 'px'

                    // 过滤器（position:absolute）的父元素为右侧的container-right-part的div，所以需要减去margin-left才能对齐位置
                    let fatherLeft = window.getComputedStyle(document.querySelector('.container-right-part')).marginLeft.replace('px', '')
                    thFilter.style.left = thPosition.left - parseFloat(fatherLeft) + 'px'
                })
            }
        },

        getRootNode (node, rootClassName) {
            if (!node) {
                // 节点不存在或追溯到了根节点
                return null
            } else if (node.className && node.className.split(/\s+/).indexOf(rootClassName) > -1) {
                // 找到此节点
                return node
            } else {
                // 向上追溯
                return this.getRootNode(node.parentNode, rootClassName)
            }
        },

        handleOutsideClick () {
            this.showFilter = false
            this.headFilterInput = ''
        },

        getFilterDataOptions (filterItem) {
            if (filterItem.query_condition.data_link && filterItem.query_condition.data_link.endpoint) {
                let params = {}
                if (filterItem.query_condition.data_link && filterItem.query_condition.data_link.params)
                    params = { ...params, ...filterItem.query_condition.data_link.params }

                Api.get(filterItem.query_condition.data_link.endpoint, params, true).then(
                    res => {
                        this.$set(filterItem, 'options', (filterItem.query_condition.data_link.result ? res[filterItem.query_condition.data_link.result] : res))
                    }
                ).catch(() => {
                })
            } else if (filterItem.query_condition.defaultOptions) {
                //
                filterItem.options = filterItem.query_condition.defaultOptions
            } else if (filterItem.query_condition.default_options) {
                //
                filterItem.options = filterItem.query_condition.default_options
            } else {
                //
                filterItem.options = []
            }
        },

        headFilter (filterItem, value, isSelect) {
            // isSelect 留做input用，暂无用
            let query_attribute = filterItem.query_condition.query_attribute || filterItem.key
            if (value === this.headFilterAll) {
                delete this.searchParam[query_attribute]
                this.originPagination.offset = 1
                this.getServiceInstanceList()
            } else if (this.searchParam[query_attribute] === value) {
                // delete this.searchParam[query_attribute]
                // do nothing
            } else {
                //
                this.searchParam[query_attribute] = value
                this.originPagination.offset = 1
                this.getServiceInstanceList()
            }

            this.handleOutsideClick()
        },
        updateBreadCrumbs (blueprintName) {
            this.breadcrumbItems.push({prop: '', label: blueprintName})
        },

        /**
         * @description UCMP3-1370 表格内操作按钮是否禁用，校验条件
         */
        checkOneInstance (btn, instance) {
            return this.$refs.operatorRef.$refs.commonOperatorPanel.checkOneInstance(btn, instance)
        },
        /**
         * @description UCMP3-1370 表格内操作按钮 tooltip显示内容 1. 非禁用，显示按钮名称；2. 禁用显示禁用条件提示
         */
        tableCellToolTip (btn, instance) {
            let disabled = this.checkOneInstance(btn, instance)
            if (!disabled || !btn.disabled_description)
                return btn.label
            else return btn.label + ':' + btn.disabled_description
        },

        closeBlueprintFilter () {
            // this.searchParam.service_instance_id = undefined
            this.init()
        },

        // UCMP3-5804 websocket订阅当前服务的状态
        subscribe () {
            if (this.disableSubscribeService) {
                console.log('当前服务[' + this.serviceCode + ']不使用状态订阅功能')
                return
            }

            if (!window.websocketClient)
                window.websocketClient = initWebSocket({token: localStorage.getItem('authenticationToken'), disableDebug: process.env.NODE_ENV === 'development'})
            
            // websocket 观察对象函数
            const subscribeEvent = () => {
                return window.websocketClient.subscribe('/user/queue/ucmp.console.' + this.serviceCode, d => {
                    if (d && d.body && d.body.match(/\{.*\}/g))
                        this.updateStatus(JSON.parse(d.body))
                })
            }
            window.websocketClient.onConnect = () => {
                // UCMP3-5805 特殊场景需要重新连接时，能主动观察当前服务的状态
                this.subscribeInstance = subscribeEvent()
            }
            // UCMP3-5805 如果当前是连接状态，直接观察
            if (window.websocketClient.connected)
                this.subscribeInstance = subscribeEvent()
        },

        // UCMP3-5804 websocket取消订阅事件
        unsubscribe (serviceCode) {
            if (this.subscribeInstance && this.subscribeInstance.unsubscribe && SUBSCRIBE_SERVICES.indexOf(serviceCode) !== -1)
                this.subscribeInstance.unsubscribe()
        },

        // UCMP3-5804 后端websocket broker推送过来的数据更新
        updateStatus (_instance) {
            for (let index = 0; index < this.tableData.length; index++) {
                if (this.tableData[index][this.value_field] === _instance[this.value_field]) {
                    Object.keys(_instance).forEach(key => {
                        // UCMP3-5805 遍历新数据的属性，依次更新
                        if (_instance.hasOwnProperty(key) && key !== this.value_field)
                            this.$set(this.tableData[index], key, _instance[key])
                    })
                    break
                }
            }
        }
    },
    computed: {
        /**
         * @description 表格的最大高度
         */
        tableMaxHeight () {
            // 10px ucmp-contant > div : margin-top: 10px
            // 30px operatorPannel height
            // 10px el-table margin-top
            // 1px el-table border-top-width
            return this.tableContainerHeight - 10 - 30 - 10 - 1
        },
        // 列表的操作列(默认有查看详情操作)
        actionColumn () {
            let config = {
                prop: 'actions',
                label: '操作',
                fixed: 'right',
                width: 50
            }
            config.router = `/${this.metaItem.service_code}/instanceDetail/`
            config.routerIdKey = this.metaItem.value_field

            if (this.allActions.columnGroup && this.allActions.columnGroup.length) {
                config.width = 50 * (this.allActions.columnGroup.length + 1)
                return config
            } else
                return null
        },
        // 服务的code(唯一)
        serviceCode () {
            return this.$route.params.code
        },
        // 从store里获取存贮的数据
        ...mapGetters([
            'metadata',
            'checkedMetadata',
            'instanceConfig',
            'groupActions',
            'tenancy'
        ]),
        // 元数据项数据
        metaItem () {
            return this.checkedMetadata
        },
        // 前端配置
        fontendConfig () {
            // 筛选得到前端的配置
            return this.instanceConfig
        },

        /**
         * @description 表格实际展示的列
         */
        displayedColumns: {
            get () {
                return this.checkedColumns
            },
            set (columns) {
                this.checkedColumns = columns
                this.updateFilterForm()
                if (this.$refs.table) {
                    this.$nextTick(() => {
                        this.$refs.table.doLayout()
                    })
                }
            }
        },

        allActions () {
            return this.groupActions
        },

        // 动态生成面包屑
        breadcrumbItems () {
            // 如果父级页面为蓝图管理时，修改其面包屑展示方式
            let _breadcrumbItems = []
            if (this.serviceCode === 'blueprint' || this.$route.query.type === 'blueprint') {
                _breadcrumbItems.push({prop: '/serviceInstance/blueprint', label: '应用服务'})
                if (this.metaItem && this.metaItem.group === 'blueprint')
                    _breadcrumbItems.push({prop: '', label: this.metaItem.name})
            } else
                _breadcrumbItems = [ ..._breadcrumbItems, { prop: '', label: this.metaItem.name } ]
            return _breadcrumbItems
        },
        pagination: {
            get () {
                return {
                    index: this.originPagination.offset,
                    size: this.originPagination.limit,
                    count: this.originPagination.count,
                    total: this.originPagination.total
                }
            },
            set (val) {
                this.originPagination.offset = val.index
            }
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

        displayedColumnKeys () {
            // UCMP3-1416 过滤取当前表格显示的列
            let filterItems = this.displayedColumns.filter(
                item => {
                    return item.isShow
                }
            )
            return filterItems.map(item => item.prop)
        },

        panelFilterItems () {
            return this.filterItems.filter(item => {
                // UCMP3-1416 比对当前列是否在表格显示
                // item.key.split('.')[0]是因为所属云主机又改成了 ecs.instancename 这种东西
                // keep_query:增加过滤条件不收displayedColumnKeys影响
                return !(item.query_condition && item.query_condition.table_head) && ((this.displayedColumnKeys.indexOf(item.key.split('.')[0]) !== -1) || item.keep_query)
            })
        },

        panelFilterItemKeys () {
            // UCMP3-4617 【控制台】资源所属类型-应用查询切换存在问题
            // 解决方法：过滤的key是动态表单的key加上子表单的key
            let panelFilterItems = []
            this.panelFilterItems.forEach(item => {
                panelFilterItems.push(item.key)
                if (item.childKey && item.children) {
                    item.children.forEach(childItem => {
                        panelFilterItems.push(childItem.key)
                    })
                }
            })

            return panelFilterItems
        },

        headFilterItems () {
            let selectInColumn = this.filterItems.filter(item => {
                // return item.type === 'select' && this.displayedColumnKeys.indexOf(item.key) > -1
                return item.query_condition && item.query_condition.table_head
            })

            return JSON.parse(JSON.stringify(selectInColumn))
        },

        headFilterKeys () {
            // item.key 依附的列prop， item.query_condition.query_attribute是实际查询用的key
            let key2Attribute = {}
            this.headFilterItems.forEach(item => {
                key2Attribute[item.key] = item.query_condition.query_attribute
            })

            return key2Attribute
        },
        // UCMP3-5804 当前服务是否禁用WebSocket订阅
        disableSubscribeService () {
            return SUBSCRIBE_SERVICES.indexOf(this.serviceCode) === -1
        }
    },
    watch: {
        // 应用服务第一次进入按钮不显示
        checkedMetadata (val) {
            if (val.group === 'blueprint')
                this.btnServiceCode = 'blueprint'
            else
                this.btnServiceCode = this.$route.params.code
        },
        /**
         * @description 当前服务发生变化，动态设置对应的元数据以及前端个性化设置信息
         */
        serviceCode (newVal, oldVal) {
            if (newVal === oldVal) return

            this.init()
            this.clearFilterData()
        },

        /**
         * @description 选中的元数据发生变化，动态设置表格列信息、按钮组等信息
         */
        metaItem: {
            deep: true,
            handler (newVal) {
                if (newVal && newVal.service_code)
                    this.getColumnsAndFiltersByMeta()
            }
        },

        /**
         * @description 选中的前端个性化配置发生变化，动态设置表格列信息、按钮组等信息
         */
        fontendConfig () {
            this.getColumnsAndFiltersByMeta()
        },
        // 监听元数据变化(解决当前页面刷新时,元数据请求响应晚于获取单个服务数据的请求响应)
        'metadata.length' (newVal, oldVal) {
            if (newVal === oldVal) return
            this.init()
        }
    },
    components: {
        CommonPanel,
        OperatorPanel,
        LabelGroup,
        DynamicTableCol,
        EditTag,
        ExportEcs,
        BlueprintMgt,
        ServiceInstanceTableColumn
    },
    created () {
        // 初始化
        this.init()
        if (this.checkedMetadata && this.checkedMetadata.group === 'blueprint')
                this.btnServiceCode = 'blueprint'
        else
            this.btnServiceCode = this.$route.params.code
        this.subscribe()
    },
    mounted () {
        // // 添加表格列拖拽排序的方法
        // const columns = this.$el.querySelector('.el-table__header-wrapper tr')
        // Sortable.create(columns, {
        //     filter: '.el-table-column--selection',
        //     onEnd ({ newIndex, oldIndex }) {
        //         let copiedColumns = JSON.parse(JSON.stringify(self.displayedColumns))
        //         const targetRow = copiedColumns.splice(oldIndex, 1)[0]
        //         copiedColumns.splice(newIndex, 0, targetRow)
        //         self.displayedColumns.splice(0, self.displayedColumns.length)
        //         self.$nextTick(
        //             () => {
        //                 self.displayedColumns = copiedColumns
        //             }
        //         )
        //     }
        // })
    },
    destroyed () {
        this.unsubscribe(this.serviceCode)
    }
}
</script>
<style lang="scss" scoped>
    .ucmp-icon-filter-down {
        transform: scale(0.7);
    }
</style>

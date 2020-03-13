<template lang="pug">
    div.table-select
        //- search
        el-form.search(inline size="mini" v-if="config.search")
            template(v-if="config.otherSearch")
                el-form-item(v-for="searchItem in config.otherSearch" :key="searchItem.key")
                    el-select(v-if="searchItem.select" v-model="searchForm[searchItem.key]" size="mini" clearable :placeholder="searchItem.placeholder")
                        // 只做了固定数据的defaultOptions select形式， 接口获取的未做
                        el-option(v-for="item in searchItem.options.defaultOptions" :key="item[searchItem.options.value_field]" :label="item[searchItem.options.text_field]" :value="item[searchItem.options.value_field]")
                    el-input(v-else v-model="searchForm[searchItem.key]" size="mini" clearable :placeholder="searchItem.placeholder")

            //- 普通搜索
            el-form-item
                el-input(v-model.trim="searchForm[config.searchKey]" clearable :placeholder="config.searchPlaceholder" @clear="query")
            el-form-item
                el-button(@click="query" type="primary") 搜索
            span.ucmp-icon-question.text-danger(v-if="config.alert") {{config.alert}}

        //- table
        el-table.dialog-table(ref="normalTable" :data="tableData" stripe border @select="selectRow" @select-all="selectAll" )
            el-table-column(type="selection" width="45" :disabled="true" :selectable="selectable")
            el-table-column(v-for="column in columns" :prop="column.prop" :key="column.prop" :label="column.label" :width="column.width")
                template(slot-scope="scope")
                    template(v-if="config.isUseEcsCoreAttrColumn")
                        EcsCoreAttrTableColumn(:scope="scope" :column="column")
                    template(v-else)
                        //- select
                        el-select(v-if="column.select" v-model="scope.row[column.prop]" size="mini" :disabled="scope.row[rowIsDisabled] || !selectable(scope.row)")
                            el-option(v-for="item in options" :key="item[config.options.value_field]" :label="item[config.options.text_field]" :value="item[config.options.value_field]")
                        span(v-else-if="column.enum") {{getEnum(column.enum, scope.row[column.prop], column.text_field, column.value_field)}}

                        //- reference
                        span(v-else-if="column.reference") {{getReference(scope.row, column.prop, column.referenceKey, column.referenceValue)}}

                        //- 操作 TODO
                        div(v-else-if="column.isEdit")
                            //- 单选
                            el-radio-group(v-if="column.type === 'radios'"
                                v-model="scope.row[column.key]"
                                :disabled="scope.row[rowIsDisabled] || !selectable(scope.row)")
                                el-radio(v-for="radio in column.options" :label="radio.value" :key="radio.value") {{radio.label}}
                            el-select(v-else-if="column.type === 'select'"
                                v-model="scope.row[column.key]"
                                size="mini"
                                :disabled="scope.row[rowIsDisabled] || !selectable(scope.row)"
                                :name="column.prop + scope.$index"
                                :data-vv-as="column.label"
                                v-validate="scope.row[rowIsDisabled] || !selectable(scope.row) ? {} : rules.required"
                                :class="{'input': true, 'is-danger': errors.has(column.prop + scope.$index)}"
                            )
                                el-option(v-for="item in getOptions(scope.row, column)" :key="item.label || item" :value="item.value || item")
                            el-input(v-else-if="isF5FormItem && column.key === 'port'"
                                size="mini"
                                v-validate="rules.ssh_port"
                                v-model="scope.row[column.key]"
                                placeholder="端口号(1-65535)"
                                maxlength="10"
                                :name="'ssh_port' + scope.row['instance_id']"
                                :data-vv-as="'端口号'"
                                :class="{'input': true, 'is-danger': errors.has('ssh_port' + scope.row['instance_id'])}"
                                :disabled="scope.row[rowIsDisabled] || !selectable(scope.row)"
                                @blur="portBlur(scope.row['selectIp'])"
                            )
                            el-input-number(v-else-if="column.type === 'number'"
                                v-model="scope.row[column.key]"
                                size="mini"
                                :precision="column.precision || 0"
                                :step="column.step || 1"
                                :min="column.min !== undefined ? column.min : (column.prop === 'port' ? 1 : -Infinity)"
                                :max="column.max !== undefined ? column.max : (column.prop === 'port' ? 65535 : Infinity)"
                                :disabled="scope.row[rowIsDisabled] || !selectable(scope.row)"
                                )
                            el-input(v-else-if="column.type === 'input' || column.type === 'password'"
                                :type="column.type"
                                v-validate="column.validator"
                                v-model="scope.row[column.key]"
                                size="mini"
                                :name="column.key + scope.row['instance_id']"
                                :data-vv-as="column.label"
                                :disabled="scope.row[rowIsDisabled] || !selectable(scope.row)"
                                :class="{'input': true, 'is-danger': errors.has(column.key + scope.row['instance_id'])}")
                            span.validator-error.is-danger.cell-error(v-if="isF5FormItem && column.key === 'port' && errors.has('ssh_port' + scope.row['instance_id'])") {{ errors.first('ssh_port' + scope.row['instance_id']) }}
                            span.validator-error.is-danger.cell-error(v-if="column.type === 'input' && errors.has(column.key + scope.row['instance_id'])") {{ errors.first(column.key + scope.row['instance_id']) }}
                        // icon
                        span(v-else-if="column.icon")
                            span.icon(v-if="scope.row[column.prop]" :class="scope.row[column.prop]")
                            span(v-else) --
                        //- 其他
                        span(v-else)
                            span(v-if="column.format")
                                span(v-if="column.format === 'TranslateOrgApp'") {{scope.row[column.prop] | TranslateOrgApp}}
                                el-tag(
                                    v-else-if="column.format === 'FormatStatus'"
                                    :type="column.statusTypeObj[scope.row.status] ? column.statusTypeObj[scope.row.status].style : 'default'"
                                    :style="column.statusTypeObj[scope.row.status] && column.statusTypeObj[scope.row.status].custom_style ? column.statusTypeObj[scope.row.status].custom_style : {}"
                                    size="mini") {{column.statusTypeObj[scope.row.status] ? column.statusTypeObj[scope.row.status].name : '其他'}}
                                el-tag(v-else-if="column.format === 'FormatNasStatus'" :type="nasEcsStatus[scope.row[column.prop]] ? nasEcsStatus[scope.row[column.prop]].type : ''" size="mini")
                                    i.el-icon-loading(v-if="scope.row[column.prop].includes('ing')")
                                    | {{nasEcsStatus[scope.row[column.prop]] ? nasEcsStatus[scope.row[column.prop]].label : '未知'}}
                            span(v-else-if="Array.isArray(scope.row[column.prop])")
                                li(v-for="arrItem in scope.row[column.prop]") {{arrItem}}
                            span(v-else) {{scope.row[column.prop]}}
            //- 多次添加同一条
            el-table-column(v-if="config.multiple" label="添加次数")
                template(slot-scope="scope")
                    el-input-number(v-model="scope.row[multipleCount]" size="mini" :min="1" :disabled="scope.row[rowIsDisabled]")
        el-pagination.align-right(
            v-if="config.pagination"
            background
            size="small"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page.sync="defaultPagination.index"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="defaultPagination.size"
            layout="sizes, total, prev, pager, next"
            :total="defaultPagination.total"
            :page-count="defaultPagination.count")
</template>

<script>
    import Api from '@api'
    import { Validator } from 'vee-validate'
    import {mapGetters} from 'vuex'
    import DynamicFormItem from './dynamicForm/DynamicFormItem'
    import { NasEcsStatus } from '@server/ConstParams'
    import EcsCoreAttrTableColumn from '@/components/console/EcsCoreAttrTableColumn'

    /**
     * @description 公用组件 —— 表格勾选
     * @author jia.lu
     * @prop {Object} config 表格控制参数
     *      config: {
                    listRoot: '', // table的key，不存在即为response
                    search: true,
                    searchKey: 'name',
                    searchPlaceholder: '请输入用户名称搜索',
                    otherSearch: [
                        {
                            select: true,
                            key: 'service_code',
                            options: {
                                defaultOptions: this.tagServiceCodes,
                                text_field: 'name',
                                value_field: 'id'
                            },
                            placeholder: ''
                        },
                        {
                            select: true,
                            key: 'tag_type',
                            options: {
                                defaultOptions: this.tagTypes,
                                text_field: 'name',
                                value_field: 'id'
                            }
                        },
                        {
                            key: 'someKey', // input search
                            placeholder: ''
                        }
                    ],
                    maxChooseCount: 10, // 最大可选项

                    multiple: false, // 是否多选
                    unique: 'id',   // 能确定唯一数据的key
                    defaultTableData: [] // 前台传入表格数据 和api不共存
                    api: 'userList',
                    params: {domain_id: this.domainId}, // api调用参数
                    frontPagination: true, // 是否前台分页
                    selectedHead: true, //是否把选中的项放在队列最前，前提frontPagination为true
                    selectable: function // 当前row是否可选择

                    radio: 'authority' // 存在 代表用户自定义了单选框 ， value是单选框的值（columns里需配置对应信息）

                    select: 'abc',  // 用户定义select, 对应columns需加入select:true
                    options: {
                        api: '/ecs/flavor/list',
                        params: {},
                        // defaultOptions: [], // 前台数组 和api不共存
                        text_field: 'name',
                        value_field: 'id'
                    }，
                    paginationParam: {limit: 'limit', offset: 'page_idx'} // 分页参数替换
     *          }
     * @prop [columns] 表格列头
     *       dialogColumns: [
     {label: '用户名称', prop: 'name'},
     {label: '中文名称', prop: 'realname'},
     {label: '邮箱地址', prop: 'email'},
     {
         label: '授权方式',
         prop: 'authority',
         width: '210px',
         // 用户自定义的单选
         radios: [
             {label: '管理权限', value: 0},
             {label: '使用权限', value: 1}
         ],
         icon: true //用来定义图标的显示，后台传class
     }
     ]
     * @prop [selectedList] 初始化选中的值
     */
    export default {
        name: 'TableSelect',
        inject: ['$validator'],
        components: {DynamicFormItem, EcsCoreAttrTableColumn},
        props: {
            // 表格控制选项
            config: {
                type: Object,
                default: () => {
                    return {
                        search: false,
                        multiple: false,
                        // 使用云主机核心属性的Column
                        isUseEcsCoreAttrColumn: false
                    }
                },
                validator: (obj) => {
                    return obj.unique
                }
            },
            columns: {
                type: Array,
                default: () => []
            },
            // 选中的值
            selectedList: {
                type: Array,
                default: () => []
            },
            isF5FormItem: {
                type: Boolean,
                default: false
            }
        },
        data () {
            return {
                // multipleCount: '__UCMP_multipleCount__', // Object.keys()会忽略掉 symbol 键，vue walk函数不能感知
                rowIsDisabled: '__UCMP_rowIsDisabled__',
                originTableData: null,
                tableData: [], // 表格维护数据
                defaultPagination: {
                    index: 1,
                    count: 1,
                    size: 20,
                    total: 0
                },
                queryStr: '',
                selectedArray: [], // 组件保存已选中的所有数组
                options: [],
                searchForm: {},
                ip: '',
                rules: {
                    required: {
                        required: true
                    },
                    ssh_port: {
                        required: false,
                        regex: /^(^[1-9]\d{0,3}$)|(^[1-5]\d{4}$)|(^[6][0-5][0-5][0-3][0-5]$)/,
                        uniqueRule: true
                    }
                }
            }
        },
        computed: {
            curSelectedOverMax () {
                return this.selectedArray.length === this.config.maxChooseCount
            },
            ...mapGetters([
                'multipleCount'
            ]),
            nasEcsStatus () {
                return NasEcsStatus
            }
        },
        methods: {
            alarmOverMax () {
                if (this.curSelectedOverMax) {
                    // 提示用户
                    this.$notify({
                        type: 'warning',
                        message: '已达到最大可选项（' + this.config.maxChooseCount + '）个'
                    })
                }
            },
            /**
             * @description 表格全选事件
             */
            selectAll (selection) {
                if (selection.length) {
                    // 全选
                    selection.forEach(item => {
                        this.selectRow(selection, item, true)
                    })

                    this.alarmOverMax()
                } else {
                    // 全取消
                    this.tableData.forEach(item => {
                        this.selectRow(selection, item, true)
                    })
                }

                this.$emit('changeSelected', this.selectedArray)
            },
            /**
             * @description 表格勾选事件
             * @param selection
             * @param row
             */
            selectRow (selection, row, selectAllCall = false) {
                const isChecked = selection.indexOf(row) > -1
                row[this.rowIsDisabled] = !isChecked

                this.selectedArrayChange(row, isChecked)
                if (!selectAllCall) {
                    this.alarmOverMax()
                    this.$emit('changeSelected', this.selectedArray)
                }
            },
            /**
             * @description 当前row是否可选择
             */
            selectable (row, index) {
                return this.config.selectable ? this.config.selectable(row, index) : true
            },
            /**
             * @description 当前选项变化后 赋值selectedArray
             */
            selectedArrayChange (row, isChecked) {
                // dialog 获得当前页所有的选中项，其他页的需要存
                if (isChecked) {
                    //
                    let hasRow = this.selectedArray.find(item => {
                        return item[this.config.unique] === row[this.config.unique]
                    })

                    // 已勾选中不存在这个，需加入
                    if (!hasRow) {
                        if (this.config.maxChooseCount && this.selectedArray.length === this.config.maxChooseCount) {
                            // 已达到最大值，不能再选取了
                            // diasbled 多选项
                            row[this.rowIsDisabled] = isChecked

                            // 表格row反勾选
                            this.$nextTick(() => {
                                this.$refs.normalTable && this.$refs.normalTable.toggleRowSelection(row, false)
                            })
                        } else {
                            //
                            this.selectedArray.push(row)
                            this.$emit('update:selectedList', this.selectedArray)
                        }
                    }
                } else {
                    this.selectedArray = this.selectedArray.filter(item => {
                        return item[this.config.unique] !== row[this.config.unique]
                    })
                    this.$emit('update:selectedList', this.selectedArray)
                }
            },
            /**
             * @description 父元素调用， 用来获得选中的所有选项
             */
            getSelection () {
                // this.$emit('updateDialogSelectedArray', this.selectedArray)
                return this.selectedArray
            },
            handleSizeChange (size) {
                this.defaultPagination.index = 1
                this.defaultPagination.size = size
                this.getList()
            },
            handleCurrentChange () {
                this.getList()
            },
            query () {
                this.defaultPagination.index = 1
                this.getList()
            },
            /**
             * @description 得到父组件传来的 默认勾选数据， 数据列可能不对齐
             */
            initSelectedArray () {
                if (this.selectedList.length) {
                    //
                    this.selectedArray = JSON.parse(JSON.stringify(this.selectedList))
                }
            },
            /**
             * @description 获取整个表格的数据
             */
            getList () {
                if (this.config.frontPagination && this.originTableData) {
                    this.tableData = this.getPageData(this.originTableData)
                    this.initPageSelected()

                    return
                }

                // 数据从后台获取
                if (this.config.api) {
                    // payload 默认携带参数
                    const params = {...this.config.params}

                    // 分页参数
                    if (this.config.pagination && !this.config.frontPagination) {
                        params[this.config.paginationParam && this.config.paginationParam && this.config.paginationParam.offset ? this.config.paginationParam.offset : 'offset'] = this.defaultPagination.index
                        params[this.config.paginationParam && this.config.paginationParam && this.config.paginationParam.limit ? this.config.paginationParam.limit : 'limit'] = this.defaultPagination.size
                    }

                    // 过滤参数
                    // if (this.config.search && !this.config.frontPagination && this.queryStr) {
                    //     // 过后台的过滤参数只有一个的情况
                    //     params[this.config.searchKey] = this.queryStr
                    // }

                    // 过滤参数
                    if (this.config.search && !this.config.frontPagination) {
                        for (let [key, value] of Object.entries(this.searchForm)) {
                            if (value !== undefined && value !== null && value !== '') {
                                //
                                params[key] = value
                            }
                        }
                    }

                    Api.get(this.config.api, params, true).then(res => {
                        // this.originTableData = (listRootArray ? res[this.config.listRoot] : res) || []
                        // this.config.listRoot 存在表明有total属性，没有则表明返回直接是数组
                        // this.defaultPagination.total = (this.config.listRoot ? res.total : res.length) || 0
                        let listRootArray = this.config.listRoot ? this.config.listRoot.split('.') : ''
                        if (listRootArray) {
                            //
                            let tableList = res
                            let totalRoot = res
                            listRootArray.forEach((item, index) => {
                                tableList = tableList[item] || []
                                if (index < listRootArray.length - 1) totalRoot = res[item]
                            })
                            this.originTableData = tableList
                            this.defaultPagination.total = totalRoot.total
                        } else {
                            //
                            this.originTableData = res
                            this.defaultPagination.total = res.length
                        }

                        this.originTableData.forEach(item => {
                            // 可多选
                            if (this.config.multiple)
                                item[this.multipleCount] = 1 // 输入框显示的最小值是1

                            item[this.rowIsDisabled] = true
                        })

                        // 制定选中的放在队列最前
                        if (this.config.frontPagination && this.config.selectedHead) {
                            // 取出匹配的关键key， 做indexof操作
                            const selectedUniqueArray = this.selectedArray.map(selectedRow => {
                                return selectedRow[this.config.unique]
                            })

                            let selectedArray = []
                            let unSelectedArray = []
                            this.originTableData.forEach(row => {
                                if (selectedUniqueArray.indexOf(row[this.config.unique]) > -1)
                                    selectedArray.push(row)
                                else
                                    unSelectedArray.push(row)
                            })

                            this.originTableData = [...selectedArray, ...unSelectedArray]
                        }

                        this.tableData = this.getPageData(this.originTableData)
                        this.initPageSelected()
                    })
                }
            },
            /**
             * @description 获取当前页数据
             */
            getPageData (tempArray) {
                // 前端分页
                if (this.config.frontPagination) {
                    // 过滤
                    if (this.config.search) {
                        tempArray = tempArray.filter(item => {
                            let filtered = true
                            for (let [key, value] of Object.entries(this.searchForm)) {
                                if (value !== undefined && value !== null && value !== '') {
                                    if (item[key].indexOf(value) === -1)
                                        filtered = false
                                }
                            }
                            return filtered
                        })
                    }

                    // 总条数
                    this.defaultPagination.total = tempArray.length

                    // 总页数
                    this.defaultPagination.count = Math.ceil(tempArray.length / this.defaultPagination.size)

                    // 分割当前页数据
                    tempArray = tempArray.slice(this.defaultPagination.size * (this.defaultPagination.index - 1), this.defaultPagination.size * this.defaultPagination.index)
                    return this.sortSelectedTable(tempArray)
                } else {
                    //  后台分页, 页数的设置暂不知道key
                    return this.sortSelectedTable(tempArray)
                }
            },
            /**
             * @description 选中的table row 置前
             * UCMP-1216 F5申请页面，挂载云主机页面（已选择的云主机未排在最前面）
             */
            sortSelectedTable (tempArray) {
                if (!this.selectedArray || this.selectedArray.length === 0) return tempArray
                let selectArr = [], unSelectArr = []
                tempArray.forEach(item => {
                    let selectedItem = this.selectedArray.find(selectItem => item[this.config.unique] === selectItem[this.config.unique])
                    selectedItem ? selectArr.push(item) : unSelectArr.push(item)
                })

                return [...selectArr, ...unSelectArr]
            },
            /**
             * @description 初始化本页数据
             */
            initPageSelected () {
                this.selectedArray.forEach((item, index) => {
                    for (let _index = 0; _index < this.tableData.length; _index++) {
                        const row = this.tableData[_index]
                        if (row[this.config.unique] === item[this.config.unique]) {
                            this.initTableDataRow(item, row)
                            this.selectedArray[index] = row
                            this.$nextTick(() => {
                                this.$refs.normalTable && this.$refs.normalTable.toggleRowSelection(this.tableData[_index], true)
                            })
                            continue
                        }
                    }
                })
                this.$emit('update:selectedList', this.selectedArray)
            },
            /**
             * @description 替换selectArray里面的数据，确保tableData和selectedArray引用的是同一个对象
             * @param selectedArray
             * @param index
             * @param tableData
             */
            replaceSelectedArray (selectedArray, index, tableData) {
                let sameOne = tableData.find(item => {
                    return item[this.config.unique] === selectedArray[index][this.config.unique]
                })

                if (sameOne) {
                    // 将tableData数据 替换 selectedArray的
                    selectedArray[index] = sameOne
                }
            },
            /**
             * @description 初始化本页数据中每个是否被选中及多选次数，用户自定义数据
             * @param selectedRow
             * @param selectedTableRow
             */
            initTableDataRow (selectedRow, selectedTableRow) {
                // 有用户定义的select
                if (this.config.select)
                    this.$set(selectedTableRow, this.config.select, selectedRow[this.config.select])
                this.columns.forEach(column_item => {
                    if (column_item.isEdit) {
                        if (this.isF5FormItem) {
                            //UCMP3-2813【申请F5】申请F5页面，挂载云主机弹出框中，选择ip地址，点击翻页，保存，ip地址就变了
                            let ipItem = selectedRow['selectIp'] || selectedRow['ip']
                            this.$set(selectedTableRow, column_item.key, ipItem)
                            this.$set(selectedTableRow, 'port', selectedRow['port'])
                            this.$set(selectedTableRow, 'major', selectedRow['major'])
                        } else
                            this.$set(selectedTableRow, column_item.key, selectedRow[column_item.key])
                    }
                })

                this.$nextTick(() => {
                    selectedTableRow[this.rowIsDisabled] = false

                    // 多选
                    if (Number.isInteger(selectedTableRow[this.multipleCount]))
                        selectedTableRow[this.multipleCount] = selectedRow[this.multipleCount]
                })
            },
            // checkIsSameOne (pre, next) {
            //     return pre[this.config.unique] === next[this.config.unique]
            // },
            /**
             * @description 获取对应的select options
             */
            getSelectOptions () {
                if (this.config.select && this.config.options) {
                    if (this.config.options.api) {
                        const params = {...this.config.options.params}
                        Api.get(this.config.options.api, params, true).then(res => {
                            this.options = res
                        })
                    } else if (this.config.options.defaultOptions) {
                        //
                        this.options = this.config.options.defaultOptions
                    }
                }
            },

            getEnum (columnEnum, value, text_field, value_field) {
                const getOne = columnEnum.find(item => {
                    if (value_field) {
                        //
                        return item[value_field] === value
                    }
                    return item === value
                })

                return getOne ? getOne[text_field] : ''
            },

            // 过滤nas挂载时的挂载类型
            filterByImage (image, options = []) {
                let _options = []

                // windows仅支持nfs类型
                if (image && image.os_type && image.os_type.indexOf('Windows') !== -1) {
                    _options = [...[], ...options].filter(item => {
                        return item.value === 'nfs'
                    })
                } else
                    _options = [...[], ...options]

              return _options
            },
            getOptions (row, column) {
                if (column.options) {
                    if (column.prop === 'mountType')
                        return this.filterByImage(row.image, column.options)
                    else
                        return column.options
                } else if (column.optionsApi) {
                    // Todo
                } else
                    return row[column.prop]
            },
            portBlur (ip) {
                this.ip = ip
            },
            /**
             * @description 端口号添加唯一性校验
             */
            setValidePort () {
                let self = this
                let uniqueRule = {
                    getMessage (field, params, data) {
                        return (data && data.message) || 'something error!'
                    },
                    validate (value) {
                        if (!self.ip) return {valid: true, data: undefined}
                        return Api.get('f5PortExist', {port: value, ip: self.ip}, true).then(
                            res => {
                                return {
                                    valid: !res.in_use,
                                    data: res.in_use ? {message: '端口号被占用，请修改'} : undefined
                                }
                            }
                        )
                    }
                }
                Validator.extend('uniqueRule', uniqueRule)
            },

            getReference (data, key, refKey, refOptionObj) {
                if (refKey === 'os_icon') {
                    let osType = data.os_icon || ''

                    if (osType) {
                        let type = osType === ('ucmp-icon-os-windows') ? 'windows' : 'linux'
                        // 赋值
                        data[key] = refOptionObj[type].value
                        return refOptionObj[type].label
                    } else {
                        // 灭有不让挂载
                        data[key] = ''
                        return ''
                    }
                }

                return '--'
            }
        },
        created () {
            this.getSelectOptions()
            this.initSelectedArray()
            if (this.isF5FormItem)
                this.setValidePort()
            this.$nextTick(() => {
                this.getList()
            })
        }
    }
</script>

<style lang="scss" scoped>
    .table-select {
        width: 100%;
        .dialog-table {
            height: 500px;
        }
    }

    .cell-error {
        padding-left: 10px;
    }

    .icon {
        font-size: 24px;
        line-height: 1;
    }
</style>

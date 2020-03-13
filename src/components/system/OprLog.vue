<template lang="pug">
    UcmpContainer(:breadcrumbItems="breadcrumbItems")
        div.full-container(slot="content")
            UcmpTableContainer(
            :pagination="pagination"
            :filterItems="filterItems"
            searchPlaceholder="请输入操作人进行搜索"
            @sizeChange="handleSizeChange"
            @currentChange="handleCurrentChange"
            :submit="query")

                div.full-height.border-top.padding-top(slot="tableContainer")
                    div.margin-bottom.d-flex.justify-content-end.aligin-center
                        el-button.oper-icon-btn(size="small" icon="el-icon-download" @click="download('txt')") 导出Txt
                        el-button.oper-icon-btn(size="small" icon="el-icon-download" @click="download('xlsx')") 导出Excel

                        a(ref="downLoadFile" :href="downLoadFile" download)

                        el-tooltip.margin-left(:content="alertContent")
                            i.ucmp-icon-question.theme-color
                    el-table.panel-table(:data="tableData" v-loading="isLoading" element-loading-spinner="ucmp-icon-loading" border)
                        el-table-column(label="序号" type="index")
                        el-table-column(:prop="column.prop" v-for="column in columns" :key="column.prop" :label="column.label" :width="column.width")
</template>

<script>
    /**
     * @description 操作日志
     */
    import Api from '@api'
    import FileSaver from 'file-saver'
    import DateUtil from '@server/date-utils'

    export default {
        name: 'OprLog',
        data () {
            return {
                breadcrumbItems: [
                    {prop: '', label: '操作日志'}
                ],
                downLoadFile: null,
                filterItems: [
                    {
                        label: '操作人',
                        key: 'operator',
                        type: 'input'
                    },
                    {
                        label: '日志类型',
                        key: 'logTypeCode',
                        type: 'select',
                        text_field: 'name',
                        data_link: {
                            endpoint: '/ucmp3/log/type',
                            value_field: 'code',
                            text_field: 'name'
                        }
                    },
                    {
                        label: '日志内容',
                        key: 'text',
                        type: 'input'
                    },
                    {
                        label: '开始时间',
                        key: 'startCreatedAt',
                        type: 'date'
                    },
                    {
                        label: '结束时间',
                        key: 'endCreatedAt',
                        type: 'date'
                    }
                ],
                searchForm: {},
                advanceSearchForm: {},
                pagination: {
                    index: 1,
                    count: 1,
                    size: 20,
                    total: 0
                },
                logTypeOptions: [],
                columns: [
                    {prop: 'operator', label: '操作人'},
                    {prop: 'createdAt', label: '操作时间'},
                    {prop: 'modularName', label: '操作模块'},
                    {prop: 'logType', label: '日志类型'},
                    {prop: 'resource', label: '类型'},
                    {prop: 'text', label: '日志内容'}
                ],
                tableData: [],
                alertContent: '下载的过滤参数为上一次普通或高级搜索时的参数',
                searchParams: {},
                isLoading: false
            }
        },
        methods: {
            handleCurrentChange (val) {
                this.pagination.index = val
                this.getList()
            },
            handleSizeChange (val) {
                this.pagination.size = val
                this.pagination.index = 1
                this.getList()
            },
            /**
             * @description 查询
             */
            query (params) {
                this.pagination.index = 1
                // UCMP-660 操作日志查询，翻页后，查询条件被重置
                this.searchParams = params
                this.getList()
            },
            /**
             * @description 下载
             * @param {String} suffix 文件后缀
             */
            download (suffix) {
                const data = this.formatParams(this.searchParams, true)
                data.suffix = suffix

                // UCMP-571【操作日志】导出操作日志，内容为空
                // 下载需加参数'blob'
                Api.get('logDownloadStream', data, true, 'blob').then(res => {
                    let blob = new Blob([res], {type: 'application/octet-stream'})
                    FileSaver.saveAs(blob, '操作日志' + new Date().getTime() + '.' + suffix)
                })
            },
            /**
             * @description 分页 获取操作日志
             */
            getList () {
                const data = this.formatParams(this.searchParams)

                this.isLoading = true
                Api.get('logList', data).then(res => {
                    this.isLoading = false
                    this.tableData = res.list
                    this.pagination.count = res.pages || 1
                    this.pagination.total = res.total || 0
                }, () => {
                    this.isLoading = false
                })
            },
            formatParams (params, noPagination = false) {
                const data = {}

                // UCMP-570【操作日志】操作日志分页翻页不生效，接口返回全部数据
                // 分页数据统一修改为offset页数1开始， limit每页显示
                if (!noPagination) {
                    data.offset = this.pagination.index
                    data.limit = this.pagination.size
                }

                // searchKey代表普通搜索
                if (params.searchKey)
                    data.operator = params.searchKey
                else {
                    // UCMP-572【操作日志】操作日志页面按照日志类型查询问题，详见描述
                    // select未选择是null，在选择后clear之后赋值为''，会带入url
                    for (let [key, value] of Object.entries(params)) {
                        if (!value) delete params[key]
                        else {
                            // 时间传空会入参，舍去
                            if (key === 'startCreatedAt' || key === 'endCreatedAt')
                                params[key] = this.formatDate(value)
                        }
                    }

                    Object.assign(data, params)
                }

                return data
            },
            formatDate (timestamp) {
                return DateUtil.formate(new Date(timestamp), 'yyyy-MM-dd')
            }
        },
        created () {
            this.getList()
        }
    }
</script>
<style lang="scss" scoped>
    .panel-table {
        height: calc(100% - 48px);
    }
</style>


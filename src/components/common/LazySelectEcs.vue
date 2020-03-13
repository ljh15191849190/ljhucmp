<template lang="pug">
    div.lazy-select-ecs
        el-select(
        ref="select"
        v-model="ecs"
        :size="size"
        clearable
        @clear="clear"
        filterable
        remote
        :remote-method="getRemoteList"
        v-loadmore="loadMoreEcs"
        @change="change"
        @visible-change="visibleChange"
        v-loading="loading"
        :disabled="disabled"
        :placeholder="placeholder")
            el-option(
            v-for="item in ecsList"
            :key="item.instance_id"
            :label="item.instance_name"
            :value="item.instance_id")
                span.float-left {{item.instance_name}}
                span.float-right.theme-color.margin-left {{item.instance_id}}
</template>

<script>
    import Api from '@api'
    import axios from 'axios'
    import SelectHelper from '@mock/lazySelect.mock'

    /**
     * ecs选择__懒加载__搜索
     *
     * @description
     * @author jia.lu
     */
    export default {
        name: 'LazySelectEcs',
        props: {
            value: String,
            // reqKey和endpoint，endpoint为优先，为解决动态表单中传递真实路径而不是映射
            reqKey: String,
            endpoint: String,
            // 过滤参数
            params: {
                type: Object,
                default: () => {
                    return {}
                }
            }
        },
        data () {
            return {
                helper: new SelectHelper(50),
                loading: false,
                ecs: '',
                ecsList: []
            }
        },
        computed: {
            size () {
                return this.$attrs.size || 'small'
            },

            disabled () {
                // 如果disabled的切换在loading中则会导致query清空
                return !!this.$attrs.disabled
            },

            placeholder () {
                return this.$attrs.placeholder || '请输入主机名搜索'
            },

            display () {
                return this.$refs.select.selectedLabel
            }
        },
        methods: {
            // 缓存第一页数据
            init () {
                let params = {
                    pageSize: this.helper.size,
                    pageNum: this.helper.pageIndexForAll
                }
                Object.assign(params, this.params)
                let getFirstPageEcsList = this.getEcsList(params)

                // 有初始化的值
                if (this.value) {
                    let getSelectedEcsList = this.getEcsList({instance_id: this.value})
                    axios.all([getFirstPageEcsList, getSelectedEcsList]).then(axios.spread(
                        (ecsData, selectEcsData) => {
                            this.handleMoreAllEcs(ecsData, params, true)

                            // 处理通过id得到的默认值, 没找到显示id
                            let paramsForSelected = {
                                query_name: selectEcsData[0] ? selectEcsData[0].instance_name : this.value
                            }

                            this.handleMoreSearchEcs(selectEcsData, paramsForSelected)
                            this.visibleChange(false) // 模拟一次关闭option，用于得到数组为空时重置option

                            // watch没触发，得手动赋值一次
                            this.ecs = this.value
                        })
                    )
                } else {
                    getFirstPageEcsList.then(data => {
                        this.handleMoreAllEcs(data, params, true)
                    })
                }
            },

            // 获取远程数据的路由器
            getRemoteList (query) {
                // 搜索不同的或者全部的option值切换，防止loadMore多次，需要先置空
                if (query !== this.helper.query) {
                    this.helper.pageCountForSearch = 1
                    this.helper.pageIndexForSearch = 1
                }

                if (query !== '' && query !== null && query !== undefined) {
                    if (this.helper.pageIndexForSearch <= this.helper.pageCountForSearch) {
                        // 搜索 + 未完全加载
                        let params = {
                            pageSize: this.helper.size,
                            pageNum: this.helper.pageIndexForSearch,
                            query_name: query
                        }
                        Object.assign(params, this.params)
                        this.getEcsList(params).then(data => {
                            this.handleMoreSearchEcs(data, params)
                        })
                    }
                } else {
                    if (this.helper.pageIndexForAll <= this.helper.pageCountForAll) {
                        // 全部 + 未完全加载
                        let params = {
                            pageSize: this.helper.size,
                            pageNum: this.helper.pageIndexForAll
                        }
                        Object.assign(params, this.params)
                        this.getEcsList(params).then(data => {
                            this.handleMoreAllEcs(data, params)
                        })
                    } else {
                        // 全部 + 完全加载
                        this.ecsList = this.helper.allDataCache
                    }
                }
            },

            // 获取ecs列表
            getEcsList (params) {
                this.loading = true
                return Api.get(this.endpoint || this.reqKey, params, true).then(res => {
                    // 根据传入的回调和获取参数来处理拿到的数据
                    this.loading = false
                    return res
                }, () => {
                    this.loading = false
                })
            },

            // 懒加载
            loadMoreEcs () {
                this.getRemoteList(this.helper.query)
            },

            change (value) {
                this.$emit('input', value)
                this.$emit('change', value)
            },

            handleMoreAllEcs (data, req, init = false) {
                this.helper.query = ''
                this.helper.allDataCache = init ? data.list : this.helper.allDataCache.concat(data.list)
                this.helper.pageCountForAll = data.pages
                this.helper.pageIndexForAll = data.pageNum + 1
                this.ecsList = this.helper.allDataCache
            },

            handleMoreSearchEcs (data, req) {
                // 一致说明是同一个搜索load more
                if (req.query_name === this.helper.query) {
                    this.helper.pageCountForSearch = data.pages
                    this.helper.pageIndexForSearch = data.pageNum + 1

                    this.ecsList = this.ecsList.concat(data.list)
                } else {
                    // 换了新的search value
                    this.ecsList = []
                    this.helper.query = req.query_name

                    if (data.list.length) {
                        this.helper.pageCountForSearch = data.pages
                        this.helper.pageIndexForSearch = data.pageNum + 1

                        this.ecsList = data.list
                    } else {
                        // 没有值为了防止下次展开option时无法展开，需要回退至allUserList
                    }
                }
            },

            clear () {
                this.helper.query = ''
                this.ecsList = this.helper.allDataCache
            },

            visibleChange (visible) {
                // 关闭的时候如果发现options为空且query重置了
                if (!visible && this.helper.query !== '' && !this.ecsList.length) {
                    // 将options置为所有ecs列表
                    setTimeout(() => {
                        this.clear()
                    }, 300)
                }
            }
        },
        created () {
            this.init()
        },
        watch: {
            value (newVal, oldVal) {
                if (this.ecs !== newVal) {
                    this.ecs = newVal

                    if (newVal !== '' && newVal !== null && newVal !== undefined) {
                        this.getEcsList({instance_id: newVal}).then(data => {
                            // 处理通过id得到的默认值, 没找到显示id
                            let paramsForSelected = {
                                query_name: data.list[0] ? data.list[0].instance_name : newVal
                            }
                            this.handleMoreSearchEcs(data, paramsForSelected)
                            this.visibleChange(false) // 模拟一次关闭option，用于得到数组为空时重置option
                        })
                    } else {
                        // 父组件清除了选择
                        this.clear()
                    }
                }
            },
            params: {
                deep: true,
                handler: function (newVal, oldVal) {
                    this.ecs = ''
                    this.change('')
                    this.$nextTick(() => {
                        this.helper = new SelectHelper(50)
                        this.init()
                    })
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
    .lazy-select-ecs {
        display: inline-block;
    }
</style>

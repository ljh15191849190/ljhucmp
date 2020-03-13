<template lang="pug">
    div.lazy-select-user
        el-select(
        ref="select"
        v-model="user"
        :size="size"
        clearable
        @clear="clear"
        filterable
        remote
        :remote-method="getRemoteList"
        v-loadmore="loadMoreUser"
        @change="change"
        @visible-change="visibleChange"
        v-loading="loading"
        :disabled="disabled"
        :placeholder="placeholder")
            slot(:userList="userList")
                el-option(
                v-for="(item, index) in userList"
                :key="index"
                :label="item.name + '(' + item.realname + ')'"
                :disabled="disabledOption(item)"
                :value="item.id")
                    span.float-left {{item.name + '(' + item.realname + ')'}}
                    span.float-right.theme-color.margin-left {{item.org_name}}
</template>

<script>
    import Api from '@api'
    import axios from 'axios'
    import SelectHelper from '@mock/lazySelect.mock'

    /**
     * 用户选择__懒加载__搜索
     *
     * TODO 输入一段没有选项的字符后blur在点击是没有options的blur第二次才有
     * @description
     * @author jia.lu
     */
    export default {
        name: 'LazySelectUser',
        props: {
            value: [String, Array],
            multiple: {
                // 获取user的接口暂还不支持user_id传多个
                type: Boolean,
                default: false
            },
            // reqKey和endpoint，endpoint为优先，为解决动态表单中传递真实路径而不是映射
            reqKey: String,
            endpoint: String,
            // 过滤参数
            params: {
                type: Object,
                default: () => {
                    return {}
                }
            },

            disableOptionCallback: {
                type: Function
            }
        },
        data () {
            return {
                user: '',
                userList: [],
                helper: new SelectHelper(50),
                loading: false
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
                return this.$attrs.placeholder || '请输入名称搜索'
            }
        },
        methods: {
            // 缓存第一页数据
            init () {
                let params = {
                    limit: this.helper.size,
                    page_idx: this.helper.pageIndexForAll
                }
                Object.assign(params, this.params)
                let getFirstPageUserList = this.getUserList(params)

                // 有初始化的值
                if (this.value) {
                    let getSelectedUserList = this.getUserList({user_id: this.value})
                    axios.all([getFirstPageUserList, getSelectedUserList]).then(axios.spread(
                        (userData, selectUserData) => {
                            this.handleMoreAllUser(userData, params)

                            // 处理通过id得到的默认用户, 没找到显示id
                            let paramsForSelected = {
                                name: selectUserData[0] ? selectUserData[0].name : this.value
                            }

                            this.handleMoreSearchUser(selectUserData, paramsForSelected)
                            this.visibleChange(false) // 模拟一次关闭option，用于得到数组为空时重置option

                            // watch没触发，得手动赋值一次
                            this.user = this.value
                        })
                    )
                } else {
                    getFirstPageUserList.then(data => {
                        this.handleMoreAllUser(data, params)
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
                            limit: this.helper.size,
                            page_idx: this.helper.pageIndexForSearch,
                            name: query
                        }
                        Object.assign(params, this.params)
                        this.getUserList(params).then(data => {
                            this.handleMoreSearchUser(data, params)
                        })
                    }
                } else {
                    if (this.helper.pageIndexForAll <= this.helper.pageCountForAll) {
                        // 全部 + 未完全加载
                        let params = {
                            limit: this.helper.size,
                            page_idx: this.helper.pageIndexForAll
                        }
                        Object.assign(params, this.params)
                        this.getUserList(params).then(data => {
                            this.handleMoreAllUser(data, params)
                        })
                    } else {
                        // 全部 + 完全加载
                        this.userList = this.helper.allDataCache
                    }
                }
            },

            // 获取用户列表
            getUserList (params) {
                this.loading = true

                return Api.get(this.endpoint || this.reqKey || 'userListByName', params, true).then(res => {
                    // 根据传入的回调和获取参数来处理拿到的数据
                    this.loading = false
                    return res.data
                }, () => {
                    this.loading = false
                })
            },

            // 清除选择
            clear () {
                this.helper.query = ''
                this.userList = this.helper.allDataCache
            },

            // 懒加载
            loadMoreUser () {
                this.getRemoteList(this.helper.query)
            },

            change (value) {
                this.$emit('input', value)
                this.$emit('change', value)
            },

            handleMoreAllUser (data, req) {
                this.helper.query = ''
                this.helper.allDataCache = this.helper.allDataCache.concat(data.users)
                this.helper.pageCountForAll = data.page_count
                this.helper.pageIndexForAll = data.page + 1
                this.userList = this.helper.allDataCache
            },

            handleMoreSearchUser (data, req) {
                // 一致说明是同一个搜索load more
                if (req.name === this.helper.query) {
                    this.helper.pageCountForSearch = data.page_count
                    this.helper.pageIndexForSearch = data.page + 1

                    this.userList = this.userList.concat(data.users)
                } else {
                    // 换了新的search value
                    this.userList = []
                    this.helper.query = req.name

                    if (data.users.length) {
                        this.helper.pageCountForSearch = data.page_count
                        this.helper.pageIndexForSearch = data.page + 1

                        this.userList = data.users
                    } else {
                        // 没有值为了防止下次展开option时无法展开，需要回退至allUserList
                    }
                }
            },

            visibleChange (visible) {
                // 关闭的时候如果发现options为空且query重置了
                if (!visible && this.helper.query !== '' && !this.userList.length) {
                    // 将options置为所有用户列表
                    setTimeout(() => {
                        this.clear()
                    }, 300)
                }
            },

            disabledOption (option) {
                if (this.disableOptionCallback) {
                    //
                    return this.disableOptionCallback(option)
                }
                return false
            }
        },
        watch: {
            value (newVal, oldVal) {
                if (this.user !== newVal) {
                    this.user = newVal

                    if (newVal !== '' && newVal !== null && newVal !== undefined) {
                        this.getUserList({user_id: newVal}).then(data => {
                            // 处理通过id得到的默认用户, 没找到显示id
                            let paramsForSelected = {
                                name: data.users[0] ? data.users[0].name : newVal
                            }
                            this.handleMoreSearchUser(data, paramsForSelected)
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
                    this.user = ''
                    this.change('')
                    this.$nextTick(() => {
                        this.helper = new SelectHelper(50)
                        this.init()
                    })
                }
            }
        },
        created () {
            this.init()
        }
    }
</script>

<style lang="scss" scoped>
    .lazy-select-user {
        display: inline-block;
    }
</style>

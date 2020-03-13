<template lang="pug">
    Navbar.menu-list(
    v-if="showMenu"
    proModule="ucmp"
    :router="router"
    :data="ucmpNavList"
    :activedIndex="activedIndex"
    :collapseTransition="hasAnimation"
    :collapse="isCollapse"
    :menuDict="menuDict"
    @subMenuOpen="subMenuOpen"
    @update:activedIndex="updateActivedIndex"
    )
    div.full-width.full-height.display-navbar(v-else)
</template>
<script>
    /**
     * @description 左侧导航组件
     * @author xinghua.wen
     */
    import MenuUrl from '@mock/router/menu.url'
    import {mapGetters, mapActions} from 'vuex'
    import Api from '@api'
    import axios from 'axios'
    import { Navbar } from '@leaptocloud/standard-ui'

    export default {
        props: ['isCollapse'],
        data () {
            return {
                router: true,
                menuList: [],
                consoleItems: [],
                hasAnimation: false,
                // promise: {
                //     menu: null,
                //     metadata: null
                // },
                projectId: localStorage.getItem('tenant'),
                menuDict: {},
                showMenu: false
            }
        },
        methods: {
            getMenu () {
                let getModules = Api.get('modules', {project_id: this.projectId}, true)
                let getMenus = Api.get('userMenus', {}, true)
                return axios.all([getModules, getMenus]).then(
                    axios.spread((modules, menus) => {
                        let ucmpApp = modules.data.find(app => app.module_url === 'ucmp')
                        if (ucmpApp) {
                            this.setSysName(ucmpApp.module_name)
                            this.setPlatform(ucmpApp)
                        }
                        let btnPermissionsStr = menus.data.filter(item => {
                            return item.title === '总览' || item.title === '控制台' || item.title === '服务目录' || item.title === '运营管理'
                        })
                        sessionStorage.setItem('btnPermissionsStr', JSON.stringify(btnPermissionsStr))
                        
                        this.menuList = menus.data.filter(menu => menu.sys_module_id === this.platform.id)
                        // this.setUcmpNavList(JSON.parse(JSON.stringify(this.menuList)))
                        this.initMenus()
                    })
                )
            },
            /**
             * @description 根据元数据初始化 服务目录以及控制台菜单列表
             */
            initMenus () {
                let nameDict = {}

                let allCheckedServices = this.menuMetaItems.map(item => {
                    nameDict[item.service_code] = item.name
                    return item.service_code
                })

                this.consoleItems = Array.from(new Set(allCheckedServices)).map(
                    item => {
                        return {
                            id: item,
                            icon: 'ucmp-icon-ecs',
                            title: nameDict[item],
                            url: 'console_' + item,
                            menu_source: 'default'
                        }
                    }
                )
                
                this.menuDict = JSON.parse(JSON.stringify(MenuUrl))
                this.consoleItems.forEach(item => {
                    this.menuDict['console_' + item.id] = '/serviceInstance/' + item.id
                })
                this.showMenu = true
                // 控制台下添加二级菜单项，该处将来要迁移到 Promise.all
                this.menuList.forEach(
                    (item, index) => {
                        if (item.url === 'console') {
                            if (!item.subMenus)
                                item.subMenus = []
                            let subMenusList = item.subMenus.filter(res => {
                                if (res.url)
                                    return allCheckedServices.indexOf(res.url) !== -1
                            })
                            item.subMenus.splice(0, item.subMenus.length)
                            item.subMenus = subMenusList.map(d => {
                                return {
                                    id: d.url,
                                    icon: 'ucmp-icon-ecs',
                                    title: d.title,
                                    url: 'console_' + d.url,
                                    menu_source: 'default'
                                }
                            })
                        }
                    }
                )
                this.setUcmpNavList(JSON.parse(JSON.stringify(this.menuList)))
            },

            /**
             * @description 初始化路由默认路径(主要用于刷新页面还原之前的页面内容)
             */
            initializeDefaultPath () {
                // 从sessionstorage 获取初始化前页面内容
                let storageRoute = sessionStorage.getItem('selectedMenu')
                if (storageRoute && storageRoute !== '/empty') {
                    let menuItemUrl = this.menuDict[storageRoute] ? this.menuDict[storageRoute] : storageRoute
                    this.activedIndex = menuItemUrl
                    this.$router.push(menuItemUrl)
                    return
                }

                this.$router.push('/empty')
            },

            selectChange (index, path) {
            },

            subMenuOpen (index) {
                this.activedIndex = index
                this.$router.push(index)
            },

            ...mapActions([
                'setSysName',
                'setPlatform',
                'setMetaData',
                'setUcmpNavList',
                'setActivedNavIndex',
                'setMenuMetadataPromise',
                'setBusinessOrproject'
            ]),

            updateActivedIndex (val) {
                this.setActivedNavIndex(val)
            },
            businessOrproject () {
                Api.get('businessOrproject', {}, true).then(
                    res => {
                        if (res && res.data) 
                            this.setBusinessOrproject(res.data.choose_name)
                    }
                )
            }
        },
        computed: {
            ...mapGetters([
                'metadata',
                'ucmpNavList',
                'activedNavIndex',
                'platform',
                'menuMetadataPromise'
            ]),

            activedIndex: {
                get () {
                    return this.activedNavIndex
                },
                set (val) {
                    this.setActivedNavIndex(val)
                }
            },

            menuMetaItems () {
                let metadataArr = JSON.parse(JSON.stringify(this.metadata || []))
                let blueprint_group = metadataArr.find(d => d.service_code === 'blueprint')
                // 给菜单列表中添加【应用服务】
                if (!blueprint_group) {
                    metadataArr.push({
                        actions: [],
                        applicable: true,
                        attribute: [],
                        group: 'blueprint_mgt',
                        icon: 'resource-icon-subnet',
                        name: '应用服务',
                        orchestrate: true,
                        service_code: 'blueprint',
                        text_field: '',
                        value_field: ''
                    })
                }
                return metadataArr.filter(
                    meta => {
                        if (!meta.asAttribute && !meta.implements && !meta.parent && meta.group !== 'blueprint')
                            return meta
                    }
                )
            }
        },
        watch: {
            // After service define success, will refresh meta data
            // To watch its length change and init menu of console
            'metadata.length' (oldVal, newVal) {
                if (oldVal === newVal) return
                this.getMenu()
            }
        },
        async created () {
            // 获取 metadata列表信息
            let promise = Api.get('getBasicMetadata', {}, true).then(
                res => {
                    if (res) {
                        let metadata = res.map(
                            item => {
                                return item.metadata
                            }
                        )
                        this.setMetaData(metadata)
                    }
                }
            )
            // vuex 缓存 promise，以便在其他组件使用(服务目录、申请资源等)
            this.setMenuMetadataPromise(promise)
            // appId更改了 不是固定的，随着域变化
            // UCMP3-2941 用火狐浏览器打不开控制台页面
            // 问题原因：this.initMenus()调用的时候this.menuList还没有返回， 结果就是控制台的suburl没有关联上
            // 解决方法：同步请求this.getMenu()，执行完成在执行this.initMenus()
            await this.getMenu()
            Promise.all([this.menuMetadataPromise]).then(
                ([metadata, menus]) => {
                    this.initMenus()
                    // 初次进入，如果显示的是空白路由，自动跳转进入第一个业务页面
                    if (this.$route.path === '/empty')
                        this.initializeDefaultPath()
                    // vuex 清空 promise，表示该请求已经结束
                    this.setMenuMetadataPromise(null)
                }
            )
            this.initializeDefaultPath()
            this.businessOrproject()
        },
        mounted () {
            const self = this
            window.addEventListener('message', res => {
                if (res.data.menu_source === 'custom') {
                    self.activedIndex = '/external?site=' + res.data.selectdCustomMenu
                    self.$router.push(self.activedIndex)
                    return
                }
                // 服务申请
                if (res.data.isApplyService) {
                    self.$router.push('/service-catalog')
                    return
                }
                // 工单
                if (res.data.isTicket) {
                    self.$router.push('/tickets')
                    return
                }
                // 自定义菜单点击事件
                let url = res.data.selectdCustomMenu
                if (url) {
                    if (res.data.consoleUrl === 'console') {
                        for (let index = 0; index < self.menuList.length; index++) {
                            if (self.menuList[index].url === 'console') {
                                self.menuList[index].subMenus.forEach(item => {
                                    if (item.id === url.toLowerCase()) {
                                        self.activedIndex = self.menuDict[item.url]
                                        self.$router.push(self.activedIndex)
                                    }
                                })
                            }
                        }
                    } else {
                        self.activedIndex = self.menuDict[url]
                        self.$router.push(self.activedIndex)
                    }
                }
            })
        },

        components: {
            Navbar
        }
    }
</script>
<style lang="scss" scoped>
    .ucmp-navbar-text-console {
        overflow: hidden;
        display: inline-block;
        text-overflow: ellipsis;
        width: 100%;
    }
    .display-navbar {
        background: #364150;
    }
</style>

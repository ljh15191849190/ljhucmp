<template lang="pug">
    div.full-container.overflow-y-auto.dashboard(slot="content")
        div.dashboard-top-btns
            div.clearfix
                el-popover.float-right(placement="bottom-end" :width="200 * Math.ceil(checkedObjList.length / 8)" trigger="hover")
                    el-checkbox-group.checkbox-group.dashboard__checkbox(v-model="exportList")
                        el-row(:gutter="20")
                            el-col(:span="24 / Math.ceil(checkedObjList.length / 8)" v-for="(n, index) in Math.ceil(checkedObjList.length / 8)" :key="index")
                                el-checkbox.checkItem(v-for="(item, index) in checkedObjList" v-if="index >= 8 * (n - 1) && index < 8 * n" :key="item.key" :label="item.key") {{item.name}}
                        el-row
                            el-button(size="small" @click="exportExcel" :disabled="!exportList.length") 确定
                    el-button.handle-btn(slot="reference")
                        | 导出
                        i.ucmp-icon-down

                el-popover.float-right(placement="bottom-end" :width="200 * Math.ceil(displayItems.length / 8)" trigger="hover")
                    el-checkbox-group.checkbox-group.dashboard__checkbox(v-model="checkedList" @change="changeChecked")
                        el-row(:gutter="20")
                            el-col(:span="24 / Math.ceil(displayItems.length / 8)" v-for="(n, index) in Math.ceil(displayItems.length / 8)" :key="index")
                                el-checkbox.checkItem(v-btn-privilege="item.key" v-for="(item, index) in displayItems" v-if="index >= 8 * (n - 1) && index < 8 * n" :key="item.key" :label="item.key") {{item.name}}
                    el-button.handle-btn(slot="reference")
                        | 定制
                        i.ucmp-icon-down
                el-button.float-right.margin-right.handle-btn(v-btn-privilege="'Overview_big_screen'" @click="gotoBigScreen()") 大屏
        div.bottom-container
            MainContent(:customItems="checkedList")
</template>
<script>
import MainContent from './MainContents'
import { mapActions, mapGetters } from 'vuex'
import Api from '@api'
import FileSaver from 'file-saver'

export default {
    data () {
        return {
            checkedList: [],
            exportList: [],
            panelDB: null,
            loginUser: null
        }
    },
    created () {
        this.checkedList = []
        this.getBigScreenUrl()
    },
    mounted () {
        // UCMP3-5948 【总览】从总览页面切换到台账页面后，再切换回总览页面，云桌面和云应用相关的报表统计数据就不显示了
        // 台账的destroyed 晚于此组件的created
        this.getReportProvider()
    },
    methods: {
        gotoBigScreen () {
            this.setFullscreen()
            this.setNavBarDisplay(false)
            this.$router.push('/bigscreen')
            // 给父框架发送消息，隐藏顶部导航栏并全屏显示页面
            // window.parent.postMessage({status: 'hideNavBar'}, '*')
        },
        ...mapActions([
            'setNavBarDisplay',
            'getReportProvider',
            'setBigScreenDefine'
        ]),
        //进入全屏
        setFullscreen (element) {
            var el = element instanceof HTMLElement ? element : document.documentElement
            var rfs = el.requestFullscreen ||
                el.webkitRequestFullscreen ||
                el.mozRequestFullScreen ||
                el.msRequestFullscreen
            if (rfs)
                rfs.call(el)
        },
        changeChecked (val) {
            // 改变定制列表时存储localstorage
            localStorage.setItem('panel_sort' + this.loginUser, JSON.stringify(val))
            this.exportList = val.filter(item => item !== 'user_orgs' && item !== 'iaas_apply' && item !== 'Overview_Info_summary')
        },

        exportExcel () {
            let exportObj = {}
            this.checkedObjList.forEach(item => {
                if (this.exportList.includes(item.key)) {
                    // UCMP3-4673【总览】导出excel均为空白，而且没有对应sheet页
                    // key值被替换了，导出在后台的字典表存的字段是现在的menu的button_url字段，在导出时替换一下
                    exportObj[item.url] = {} // 后台需要传入参数，故都先置为空对象
                }
            })

            let param = Object.assign(exportObj, this.cardFilters) // 后台需要传入参数的替换
            Api.post('export_overview', param, true, {responseType: 'blob'}).then(res => {
                let blob = new Blob([res], {type: 'application/vnd.ms-excel'})
                FileSaver.saveAs(blob, '报表.xlsx')
                this.$notify({
                    type: 'success',
                    title: '成功',
                    message: '导出成功'
                })
            })
        },
        // UCMP3-5405 查询大屏是否自定义url
        getBigScreenUrl () {
            Api.get('getDictByCode', { code: 'big_screen_define' }, true).then(
                res => {
                    console.log(res)
                    if (res.define_valid && res.define_url)
                        this.setBigScreenDefine(res.define_url)
                    else
                        this.setBigScreenDefine(null)
                }
            )
        }
    },
    computed: {
        ...mapGetters([
            'metadata',
            'ucmpNavList',
            'cardFilters'
        ]),
        displayItems () {
            if (!this.ucmpNavList) return []

            let displayItems = []
            let dashboardMenu = this.ucmpNavList.find(item => {
                return item.url === 'dashboard'
            })
            if (dashboardMenu && dashboardMenu.subButton) {
                dashboardMenu.subButton.forEach(_menu => {
                    if (_menu.button_code !== 'Overview_big_screen') {
                        let menuItem = { key: _menu.button_code, name: _menu.button_name, url: _menu.button_url }
                        displayItems.push(menuItem)
                    }
                })
                // 根据当前登录人从缓存中获取面板内容
                this.loginUser = localStorage.getItem('systemUserName') || 'test'
                let checkedList = JSON.parse(localStorage.getItem('panel_sort' + this.loginUser) || null)
                if (checkedList && checkedList.length) {
                    let finalCheckList = []
                    checkedList.forEach((sortItem, index) => {
                        // 如果角色权限取消的话需要对选择列表重新定义
                        let _item = displayItems.find(_sortItem => {
                            return _sortItem.key === sortItem
                        })
                        if (_item)
                            finalCheckList.push(sortItem)
                    })
                    this.checkedList = finalCheckList
                    this.exportList = finalCheckList.filter(item => item !== 'user_orgs' && item !== 'iaas_apply' && item !== 'Overview_Info_summary')
                } else {
                    displayItems.forEach((menuItem, index) => {
                        // 初始如果选择列表为空，则新赋值
                        if (index < 4 && !this.checkedList.includes(menuItem.key)) {
                            this.checkedList.push(menuItem.key)

                            if (menuItem.key !== 'user_orgs' && menuItem.key !== 'iaas_apply' && menuItem.key !== 'Overview_Info_summary')
                                this.exportList.push(menuItem.key)
                        }
                    })
                }
            }
            return displayItems
        },

        checkedObjList () {
            return this.displayItems.filter(item => {
                return this.checkedList.includes(item.key) && item.url !== 'user_orgs' && item.url !== 'iaas_apply' && item.url !== 'resource_count'
            })
        }
    },
    destroyed () {
        //UCMP-737 【总览】同一用户，定制的页面，切换菜单之后定制的内容没有保存。
        //问题原因：只在排序后做了本地存储
        //解决方法：组件销毁生命周期作本地存储
        localStorage.setItem('panel_sort' + this.loginUser, JSON.stringify(this.checkedList))
    },
    components: {
        MainContent
    }
}
</script>
<style lang="scss" scoped>
.full-container {
    padding: 0 8px 8px;
}
.dashboard-top-btns {
    position: fixed;
    right: 0;
    top: 0;
    height: 50px;
    width: calc(100% - 20px);
    z-index: 50;
    margin-right: 14px;
    padding: 8px;
}
.absolute-rt {
    top: 10px;
    right: 10px;
}
.bottom-container {
    margin-top: 50px;
    height: calc(100% - 50px);
}
.checkItem {
    display: block;
    line-height: 35px;
    margin: 10px 0 !important;
}
.handle-btn {
    width: 85px;
    height: 30px;
    padding: 0;
    margin-right: 15px;
    line-height: 30px;
    border-radius: 4px;
    //按钮添加圆角
    background: #e0e4e9;
    size: 14px;
    color: $fontContentGray;
    i {
        margin-left: 6px;
    }
}
.checkbox-group {
    padding: 0 20px;
}
</style>
<style lang="scss">
    .dashboard__checkbox {
        .el-checkbox .el-checkbox__label {
            white-space: normal;
            word-break: break-all;
        }
    }
</style>

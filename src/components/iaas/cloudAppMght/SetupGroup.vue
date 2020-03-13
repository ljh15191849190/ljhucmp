<template lang="pug">
div#group-container
    div.title 组
    div.subtitle 添加、删除或更改其中应用程序可用交付组和应用程序组的优先级。
    div.content
        el-form(label-width="100px" label-position="left" size="small")
            div.pad-bom
                div.groups
                    div.groups-header
                        div.header-item.name 名称
                        div.header-item.pc 计算机
                        div.header-item.priority 优先级
                    div.group.group-title(v-if="apps.group.arr.length > 0") 
                        div(@click="handleAppShow(apps.group)")
                            span
                                i.cursor-icon(:class="[apps.group.isShow ? 'el-icon-caret-bottom' : 'el-icon-caret-right']")
                                span {{apps.group.title}}
                        div.app(v-show="apps.group.isShow" v-for="(item, idx) in apps.group.arr" :key="item.id" @click="selectApp(item, idx, 'group')" :class="{'active': selectedApp === item }") 
                            div.item-name {{item.group_name}}
                            div.item-pc 
                            div.item-priority {{item.priority}}
                    div.application.group-title(v-if="apps.app.arr.length > 0")
                        div(@click="handleAppShow(apps.app)")
                            span
                                i.cursor-icon(:class="[apps.app.isShow ? 'el-icon-caret-bottom' : 'el-icon-caret-right']")
                                span {{apps.app.title}}
                        div.app(v-show="apps.app.isShow" v-for="(item, idx) in apps.app.arr" :key="item.id" @click="selectApp(item, idx, 'app')" :class="{'active': selectedApp === item }")
                            div.item-name {{item.group_name}}
                            div.item-pc {{item.computer_count}}
                            div.item-priority 
                div.btn-pane
                    el-dropdown.margin-right(@command="handleAddClick")
                        el-button 添加
                            i.el-icon-arrow-down
                        el-dropdown-menu(slot="dropdown")
                            el-dropdown-item(command="group") 交付组
                            el-dropdown-item(command="app") 应用程序
                    el-button(@click="editPriority" size="small" :disabled="removeDiable") 编辑优先级
                    el-button(@click="remove" size="small" :disabled="!selectedApp") 删除
    el-dialog(:width="width" :title="title" append-to-body :visible.sync="addAppVisible")
        div.dialog-content.app-dialog
            div.form-header.header
                el-checkbox(v-model="checkedAll" :disabled="checkedAllDisabled" @change="handleSelectAll")
                div.header-coloum-item(v-for="item in coloums" :key="item.prop") {{item.label}}
            div.content
                div.coloum-content(v-for="item in groupApps" :key="item.id")
                    el-checkbox(v-model="item.isCheckd" :disabled="item.disabled")
                    div.coloum-content-item(v-for="column in coloums" :key="column.prop") 
                        span {{item[column.prop]}}      
        div.dialog-footer(slot="footer")
            el-button(@click="close" size="small") 取消
            el-button(type="primary" @click="saveAdd" size="small") 确定

    el-dialog(width="400px" :title="editTitle" append-to-body :visible.sync="proporityVisible")
        div.dialog-content
            div(v-if="selectedApp") 
               span.padding-right 优先级
               el-input-number(v-model="selectedApp.priority" :min="0" controls-position="right" :precision="0" size="small")   
        div.dialog-footer(slot="footer")
            el-button(@click="close" size="small") 取消
            el-button(type="primary" @click="saveEdit" size="small") 确定


</template>

<script>
/**
 * 应用程序-设置组
 */
import Api from '@api'
export default {
    name: 'SetupGroup',
    props: {
        instance: {
            type: Object,
            default: () => {}
        },
        application: {
            type: Object,
            default: () => {}
        }
    },
    data () {
        return {
            formData: {
                name: '',
                checked: false,
                num: '',
                condition: false
            },
            selectedApp: null,
            showGroupDialog: false,
            showAppDialog: false,
            commond: '',
            addAppVisible: false,
            checkedAll: false,
            apps: {
                group: {
                    title: '交付组',
                    isShow: true,
                    arr: []
                },
                app: {
                    title: '应用程序',
                    isShow: true,
                    arr: []
                }
            },
            editTitle: '',
            proporityVisible: false,
            groupApps: [],
            selectedType: '',
            selectIndex: -1,
            srcGroups: [],
            srcApps: []
        }
    },
    created () {
        this.init()
    },
    methods: {
        /**
         * 初始化操作
         */
        init () {
            let params = {application_id: this.instance.application_uid, provider_id: this.instance.provider_id}
            Api.get('propsAppGroups', params, true).then(
                res => {
                    this.apps.app.arr = res.application_groups
                    this.apps.group.arr = res.application_desktop_groups
                    this.srcGroups = JSON.parse(JSON.stringify(this.apps.group.arr))
                    this.srcApps = JSON.parse(JSON.stringify(this.apps.app.arr))
                }
            )
        },
        /**
         * 添加交付组|应用程序
         */
        addApp () {
            let selectApps = this.groupApps.filter(item => item.isCheckd)
            if (this.commond === 'app') 
                this.apps.app.arr = [...this.apps.app.arr, ...selectApps]
            else {
                let groupArrs = selectApps.map(item => {
                    return {
                        group_id: item.delivery_group_id,
                        group_name: item.delivery_group_name,
                        priority: 0
                    }
                })
                this.apps.group.arr = [...this.apps.group.arr, ...groupArrs]
            }

            this.checkedAll = false
        },
        /**
         * 处理全选事件
         */
        handleSelectAll () {
            this.groupApps.forEach(item => {
                if (!item.disabled)
                    item.isCheckd = this.checkedAll
            })
        },
        editPriority () {
            this.editTitle = `编辑优先级-${this.selectedApp.group_name}`
            this.proporityVisible = true
        },
        remove () {
            if (!this.selectedApp) return
            if (this.selectedType === 'group')
                this.apps.group.arr.splice(this.selectIndex, 1)
            else 
                this.apps.app.arr.splice(this.selectIndex, 1)

            this.selectedApp = null
            this.selectIndex = -1
            this.selectedType = ''
        },
        selectApp (app, index, type) {
            this.selectIndex = index
            this.selectedType = type
            this.selectedApp = app 
        },
        handleAddClick (commond) {
            this.commond = commond
            this.addAppVisible = true
            this.getGroupApps()
        },
        handleAppShow (item) {
            item.isShow = !item.isShow
        },
        close () {
            this.addAppVisible = false
            this.proporityVisible = false
        },
        saveAdd () {
            this.addApp()
            this.close()
        },
        saveEdit () {
            this.close()
        },
        /**
         * 获取交付组或者应用程序列表
         */
        getGroupApps () {
            let method = this.commond === 'group' ? 'propsGroup' : 'propsAppList'
            let params = this.commond === 'group' ? {} : {provider_id: this.instance.provider_id}
            Api.get(method, params, true).then(
                res => {
                   this.groupApps = res
                   this.setAppStatus()
                }
            )
        },
        /**
         * 设置禁用状态
         */
        setAppStatus () {
            this.groupApps.forEach(item => {
                if (this.commond === 'app') {
                    item.disabled = !!this.apps.app.arr.find(app => app.id === item.id)
                    this.$set(item, 'isCheckd', item.disabled)
                } else {
                    item.disabled = !!this.apps.group.arr.find(app => app.group_id === item.delivery_group_id)
                    this.$set(item, 'isCheckd', item.disabled)
                }
            })
        },
        /**
         * 处理请求参数
         */
        getRequestParams () {
            //action(1:编辑; 2:添加; 3:删除)
            let application_desktop_groups = [], application_groups = []
            // 交付组(1:编辑; 2:添加; 3:删除)
            let groups = JSON.parse(JSON.stringify(this.apps.group.arr))
            // 1.处理添加和编辑action
            groups.forEach(item => {
                let groupItem = { uid: item.group_id, name: item.group_name, priority: item.priority, action: 0 }
                // 是否在原始的交付组存在
                let srcGroup = this.srcGroups.find(group => group.group_id === item.group_id)
                if (srcGroup)
                    groupItem.action = srcGroup.priority !== item.priority ? 1 : 0
                else
                    groupItem.action = 2
                
                application_desktop_groups.push(groupItem)
            })

            // 2. 处理删除的action
            this.srcGroups.forEach(item => {
                let findGroup = groups.find(group => group.group_id === item.group_id)
                if (!findGroup) {
                    let groupItem = { uid: item.group_id, name: item.group_name, priority: item.priority, action: 3 }
                    application_desktop_groups.push(groupItem) 
                }
            })

            // 应用程序(2:添加; 3:删除)
            // 1. 处理应用程序添加的action
            let apps = JSON.parse(JSON.stringify(this.apps.app.arr))
            apps.forEach(item => {
                let appItem = {uuid: item.id, uid: item.group_id, name: item.group_name, computer_count: item.computer_count, provider_id: item.provider_id, action: 0}
                // 是否在原始的app存在
                let srcApp = this.srcApps.find(app => app.id === item.id)
                if (!srcApp)
                    appItem.action = 2
                
                application_groups.push(appItem)
            })
            // 2. 处理应用程序删除的action
            this.srcApps.forEach(item => {
                let findApp = apps.find(app => app.id === item.id)
                if (!findApp) {
                    let appItem = {uuid: item.id, uid: item.group_id, name: item.group_name, computer_count: item.computer_count, provider_id: item.provider_id, action: 3}
                    application_groups.push(appItem)
                }
            })

            const params = {application_uid: this.instance.application_uid, provider_id: this.instance.provider_id, application_desktop_groups: application_desktop_groups, application_groups: application_groups}

            return params
        },
        /**
         * 确定
         */
        save () {
            return Api.put('propsGroup', this.getRequestParams())
        },
        /**
         * 应用
         */
        apply () {
            Api.put('propsGroup', this.getRequestParams()).then(res => {
                this.$notify.success('组应用操作成功!')
            })
        }
    },
    computed: {
        removeDiable () {
            return !this.selectedApp || this.selectedType === 'app'
        },
        title () {
            return this.commond === 'group' ? '添加交付组' : '添加应用程序' 
        },
        width () {
            return this.commond === 'group' ? '500px' : '400px'
        },
        coloums () {
            return this.commond === 'group' ? [
                    {
                        prop: 'delivery_group_name',
                        label: '组名称'
                    },
                    {
                        prop: 'machine_count',
                        label: '计算机'
                    }
                ] : [
                    {
                        prop: 'group_name',
                        label: '组名称'
                    }
                ]
        },
        checkedAllDisabled () {
            return this.groupApps.every(item => item.disabled)
        }
    }
}
</script>

<style lang="scss" scoped>
.pad-bom {
    padding-bottom: 5px;
}
.title {
    color: $fontTitle;
    font-size: 16px;
    font-weight: 600;
}
.subtitle {
    padding-top: 20px;
}

.form-header {
    background-color: $globalBgColor;
    border-bottom: 2px solid $borderColor;
    display: flex;
    padding: 5px;
    justify-content: space-between;
}

.content {
    padding-top: 15px;
    .groups {
        border: 1px solid $borderColor;
        height: 400px;
        overflow-y: auto;
        margin-bottom: 10px;
        .groups-header {
            background-color: $globalBgColor;
            border-bottom: 2px solid $borderColor;
            display: flex;
            padding: 5px;
            justify-content: space-between;
            @extend .form-header;
            .header-item {
                text-align: left;
                padding-left: 5px;
                font-weight: 600;
            }
            .name {
                width: 200px;
                border-right: 2px solid $borderColor;
            }
            .pc {
                border-right: 2px solid $borderColor;
                flex: 1;
            }
            .priority {
                flex: 1;
            }
        }
        .group-title {
            cursor: pointer;
            background-color: #eef1f5;
            padding: 5px 0;
        }
        .application {
            border-top: 2px solid $borderColor;
        }
        .cursor-icon {
            font-size: 20px;
        }
        .app {
            cursor: pointer;
            height: 30px;
            line-height: 30px;
            padding-left: 5px;
            display: flex;
            justify-content: space-between;
            .item-name {
                width: 200px;
            }
            .item-pc {
                flex: 1;
            }
            .item-priority {
                flex: 1;
            }
            &:nth-of-type(odd) {
                background:$globalBgColor;
            }
            &:nth-of-type(even) {
                background:$disabledBgColor;
            }
            &.active {
                color: #ffffff;
                background-color: $themeColor;
            }
        }
    }
}

.app-dialog {
    border: 1px solid $borderColor;
    .header {
        justify-content: flex-start;
    }

    .header-coloum-item {
        flex: 1;
        &:nth-child(even) {
            border-right: 2px solid $borderColor;
        }
    }

    .content {
        height: 300px;
        padding-top: 0;
    }
    .coloum-content {
        display: flex;
        padding: 5px;
        &:nth-of-type(odd) {
            background:$disabledBgColor;
        }
        &:nth-of-type(even) {
            background:$globalBgColor;
        }
    }
    .coloum-content-item {
        flex: 1;
    }
}

</style>
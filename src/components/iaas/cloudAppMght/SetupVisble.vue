<template lang="pug">
div#visble-container
    div.title 限制可见性
    div.subtitle 默认情况下, 所有程序对交付组中的所有用户可见, 但您还可以在Receiver中对某些用户隐藏这些应用程序。所有用户仍可启动此应用程序, 因此, 如果您希望其对某些用户不可用(而非隐藏),请将其置于独立的交付组中。
    div.content
        el-form(label-width="100px" label-position="left" size="small")
            div.pad-bom
                el-radio(v-model="formData.user_filter" label="1" @change="handleChange") 为整个交付组显示此应用程序
            div.pad-bom
                el-radio(v-model="formData.user_filter" label="2") 对下列用户限制此应用程序的可见性:
            div.pad-bom
                div.visble-apps
                    div.app(v-for="(item, index) in formData.users" :key="index" @click="selectApp(item)" :class="{'active': selectedApp === item }") {{item.name}}({{item.domain_name}})
                div.btn-pane
                    el-button(@click="add" size="small" :disabled="formData.user_filter === '1'") 添加
                    el-button(@click="remove" size="small" :disabled="removeDiable") 删除
    el-dialog(width="600px" title="添加用户和组" append-to-body :visible.sync="addUserVisible")
        div.dialog-content
            div.d-flex
                span.padding-right 用户和组: 
                el-checkbox-group(v-model="checkList" @change="searchUser")
                    el-checkbox(label="user") 用户
                    el-checkbox(label="group") 组
            div.search-pane.d-flex
                el-input.search-input(v-model="searchKey" :placeholder="clumnName" size="small") 
                el-button(type="primary" @click="searchUser" size="small") 确定
            div.users-pane
                div.users-header
                    div.header-item.name {{clumnName}}
                    div.header-item.domin 域
                div.user-item(v-for="item in usersAndGroups" :key="item.id" @click="selectUser(item)" :class="{'active': selectedUser === item }")
                    div.item-name {{item.username}}
                    div.item-domin {{item.domain_name}}
        div.dialog-footer(slot="footer")
            el-button(@click="close" size="small") 取消
            el-button(type="primary" @click="saveAdd" size="small") 确定

</template>

<script>
/**
 * 应用程序-设置限制可见性
 */
import Api from '@api'
export default {
    name: 'SetupVisble',
    $_veeValidate: {
        validator: 'new'
    },
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
            users: [],
            formData: {
                user_filter: '1',
                users: []
            },
            selectedApp: null,
            checkList: ['user', 'group'],
            searchKey: '',
            addUserVisible: false,
            selectedUser: null,
            choiceGroups: [],
            usersAndGroups: []
        }
    },
    created () {
        this.init()
    },
    methods: {
        init () {
            this.formData.user_filter = this.application.userFilterEnabled ? '2' : '1'
            this.users = this.application.adUsers ? JSON.parse(JSON.stringify(this.application.adUsers)) : []
            this.formData.users = this.application.adUsers ? this.application.adUsers : []
            this.getAllChoiceGroup()
        },
        /**
         * 获取用户
         */
        async getChoiceUsers (name = '') {
            const res = await Api.get('propsVisUsers', {name: name, page_idx: 1, limit: 20})
            return res.data.users
        },
        /**
         * 获取所有用户组
         */
        async getAllChoiceGroup () {
            const res = await Api.get('propsVisGroup', {}, true)
            this.choiceGroups = res.data.map(item => {
                return {
                    username: item.group_name,
                    domain_name: item.domain_name
                }
            })
        },
        /**
         * 获取用户组
         */
        getChoiceGroup (name = '') {
            return this.choiceGroups.filter(item => item.username.includes(name))
        },
        async searchUser () {
            if (!this.searchKey) this.usersAndGroups = []

            if (this.checkList.length === 0 || this.checkList.length > 1) {
                let users = await this.getChoiceUsers(this.searchKey)
                let groups = await this.getChoiceGroup(this.searchKey)
                this.usersAndGroups = [...users, ...groups]
            } else if (this.checkList.includes('user')) 
                this.usersAndGroups = await this.getChoiceUsers(this.searchKey)
            else 
                this.usersAndGroups = await this.getChoiceGroup(this.searchKey)
        },
        add () {
            this.usersAndGroups = []
            this.addUserVisible = true
        },
        remove () {
            if (!this.selectedApp) return
            let index = this.formData.users.findIndex(item => item.name === this.selectedApp.name)
            this.formData.users.splice(index, 1)
        },
        selectApp (app) {
            if (this.formData.user_filter === '2')  
                this.selectedApp = app
        },
        handleChange (value) {
            if (value === '1') 
                this.selectedApp = null
        },
        close () {
            this.addUserVisible = false
        },
        saveAdd () {
            if (!this.selectedUser) return 
            let selectedUser = {name: this.selectedUser.username, domain_name: this.selectedUser.domain_name}
            this.formData.users.push(selectedUser)
            this.close()
            this.searchKey = ''
            this.selectedUser = null
        },
        /**
         * 选中查询后的用户或组
         */
        selectUser (item) {
            this.selectedUser = item
        },
        getRequestParams () {
            // action(2: add; 3: del)
            // 1. 处理add
            let users = []
            this.formData.users.forEach(item => {
                if (!this.users.some(user => user.name === item.name))
                    users.push({name: item.name, action: 2})
            })

            //2. 处理del
            this.users.forEach(item => {
                if (!this.formData.users.some(user => user.name === item.name))
                    users.push({name: item.name, action: 3})
            })

            const result = {
                body: {
                    application_uid: this.instance.application_uid,
                    provider_id: this.instance.provider_id,
                    user_filter: this.formData.user_filter === '2',
                    users: users
                }
            }

            return result
        },
        /**
         * 确定
         */
        save () {
            return Api.put('propsVisble', this.getRequestParams())
        },
        /**
         * 应用
         */
        apply () {
            Api.put('propsVisble', this.getRequestParams()).then(res => {
                this.$notify.success('限制可见性操作成功!')
            })
        }
    },
    computed: {
        removeDiable () {
            return this.formData.user_filter === '1' || !this.selectedApp
        },
        clumnName () {
            if (this.checkList.length === 0 || this.checkList.length > 1) 
                return '用户 | 组'
            else if (this.checkList.includes('user'))
                return '用户'
            else 
                return '组'
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
.content {
    padding-top: 15px;
    .visble-apps {
        border: 1px solid $borderColor;
        height: 300px;
        overflow-y: auto;
        margin-bottom: 10px;
        .app {
            cursor: pointer;
            height: 30px;
            line-height: 30px;
            padding-left: 5px;
            &:nth-of-type(odd) {
                background:$disabledBgColor;
            }
            &:nth-of-type(even) {
                background:$globalBgColor;
            }
            &.active {
                color: #ffffff;
                background-color: $themeColor;
            }
        }
    }
}
.search-pane {
    margin-top: 10px;
    .search-input {
        width: 200px;
        margin-right: 20px;
    }
}
.form-header {
    background-color: $globalBgColor;
    border-bottom: 2px solid $borderColor;
    display: flex;
    padding: 5px;
    justify-content: space-between;
}
.users-pane {
    margin-top: 16px;
    border: 1px solid $borderColor;
    height: 350px;
    overflow-y: auto;
    margin-bottom: 10px;
    .users-header {
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
            width: 250px;
            border-right: 2px solid $borderColor;
        }
        .domin {
            flex: 1;
        }
    }
    .user-item {
        cursor: pointer;
        height: 30px;
        line-height: 30px;
        padding-left: 5px;
        display: flex;
        justify-content: space-between;
        .item-name {
            width: 250px;
        }
        .item-domin {
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
</style>
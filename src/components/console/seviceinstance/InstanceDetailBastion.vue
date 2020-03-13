<template lang="pug">
    div.bastion-container
        div.top-button-pane
            el-button(v-btn-privilege="serviceCode+'_related'" size="small" @click="associateUser" type="primary" :disabled="!selectedInstanceInfo") 关联用户
        div.user-item
            el-tooltip(v-for="(user, index) in users" :key="index" :content="user.name" placement="top" effect="light")
                div.user
                    el-button {{user.username}}
        el-dialog(title="关联用户" v-if="userVisible" :visible.sync="userVisible" width="800px")
            User(:asset_id="asset_id" :id="id" :users="users" @closeDialog="closeDialog" @submit="submit")
</template>
<script>
/**
 * 堡垒机关联的用户
 */
import Api from '@api'
import User from './UserList'
import { mapGetters } from 'vuex'
export default {
    name: 'InstanceDetailBastion',
    data () {
        return {
            id: '',
            asset_id: '',
            users: [],
            // hostInfo: null,
            userVisible: false
        }
    },
    methods: {
        /**
         * 初始化操作
         */
        init () {
            this.asset_id = this.$route.params.id
            this.getUsers()
        },
        /**
         * @description 获取堡垒机关联用户
         */
        getUsers () {
            let params = {
                type: 'get',
                asset_id: this.asset_id
            }
            Api.get('bastion', params, true).then(
                res => {
                    if (res && res.length) {
                        this.id = res[0].pre_id
                        this.users = res[0].users
                    }
                }
            )
        },
        /**
         * @description 关联用户
         */
        associateUser () {
            let msg = '', isShowDialog = true
            if (this.selectedInstanceInfo.ip && !this.selectedInstanceInfo.ip.length) {
                isShowDialog = false
                msg = '该云主机没有ip, 不能关联用户!'
            }

            if (isShowDialog && !this.selectedInstanceInfo.image.os_type) {
                isShowDialog = false
                msg = '云主机的镜像没有操作系统类型, 不能关联用户!'
            }

            if (!isShowDialog) {
                this.$notify({
                    title: '温馨提示',
                    type: 'warning',
                    message: msg
                })
                return
            }

            this.userVisible = true
        },
        /**
         * @description 关联用户对话框关闭
         */
        closeDialog () {
            this.userVisible = false
        },
        /**
         * @description 关联用户确定事件
         */
        submit () {
            this.userVisible = false
            this.getUsers()
        }
    },
    created () {
        this.init()
    },
    computed: {
        serviceCode () {
            return this.$route.params.code
        },
        ...mapGetters([
            'checkedInstanceId',
            'selectedInstanceInfo'
        ])
    },
    components: {
        User
    }
}
</script>
<style lang="scss" scoped>
.bastion-container {
    height: 100%;
    padding-bottom: 20px;
    .top-button-pane {
        display: flex;
        justify-content: flex-end;
    }
    .user-item {
        height: calc(100% - 60px);
        overflow-y: auto;
        margin-top: 30px;
        display: flex;
        flex-wrap: wrap;
        .user {
            margin-right: 15px;
            margin-top: 20px;
        }
    }
}
</style>

<template lang="pug">
    div.subnet
        UcmpContainer(:breadcrumbItems="breadcrumbItems")
            div.full-container(slot="content")
                div.top-button-container
                    el-button.default-button.creat-button(v-if="activeTab !== 'network'" type="primary" size="small" icon="el-icon-plus" @click="handleBtnClick") {{activeText}}
                el-tabs(v-model="activeTab" @tab-click="handleTabClick")
                    el-tab-pane(v-for="item in tabs" :label="item.label" :name="item.name" :key="item.name")
                div.subnet-table
                    //- UCMP-355 网络管理--创建子网、编辑子网、删除子网成功后，页面没有异步刷新
                    router-view(:key="$route.fullPath")
        el-dialog(title="创建IP" v-if="ipPoolVisible" :visible.sync="ipPoolVisible" width="600px")        
            AddIps(@closeDialog="closeDialog" @submitIp="submitIp" :ipInfo="ipForm")
        el-dialog(title="创建子网" v-if="subnetVisible" :visible.sync="subnetVisible" width="600px")
            EditSubnet(:prefixForm="prefixForm" @closeDialog="closeSubnetDialog" @submit="submitIpPool")
</template>
<script>
import AddIps from '../AddIps'
import EditSubnet from '../EditSubnet'

/**
 * @description 网络管理
 */
export default {
    data () {
        return {
            ipPoolVisible: false,
            subnetVisible: false,
            prefixForm: {},
            ipForm: {},
            activeTab: 'ips',
            tabs: [
                { label: 'IP地址', name: 'ips' },
                { label: '子网', name: 'subnet' }
                // { label: '网段', name: 'network' }
            ],
            breadcrumbItems: [       
                { prop: '', label: '网络管理' }
            ]
        }
    },
    methods: {
        /**
         * @description Tab切换事件
         */
        handleTabClick () {
            this.$router.push('/subnet/' + this.activeTab)
        },

        /**
         * @description 顶部按钮点击事件
         */
        handleBtnClick () {
            if (this.activeTab === 'subnet')
                this.subnetVisible = true
            else if (this.activeTab === 'ips')
                this.ipPoolVisible = true
        },

        /**
         * @description 关闭对话框
         */
        closeDialog () {
            this.ipPoolVisible = false
        },
        /**
         * @description 创建ip
         */
        submitIp () {
            this.ipPoolVisible = false
            this.$router.push({path: '/subnet/' + this.activeTab, query: {uuid: new Date().getTime()}})
        },
        /**
         * @description 创建子网
         */
        submitIpPool () {
            this.subnetVisible = false
            this.$router.push({path: '/subnet/' + this.activeTab, query: {uuid: new Date().getTime()}})
        },
        closeSubnetDialog () {
            this.subnetVisible = false
        },

        handleEdit () {
            this.ipPoolVisible = true
        }
    },

    computed: {
        activeText () {
            let activeText = ''
            if (this.activeTab === 'subnet') 
                activeText = '创建子网'
            else if (this.activeTab === 'ips')
                activeText = '创建IP'

            return activeText
        }
    },

    created () {
        this.$router.push('/subnet/' + this.activeTab)
    },

    components: {
        AddIps,
        EditSubnet
    }
}
</script>
<style lang="scss" scoped>
.state-panel {
    margin-left: 32px;
}
.subnet {
    height: 100%;
}
.subnet-table {
    height: calc(100% - 54px);
}
</style>

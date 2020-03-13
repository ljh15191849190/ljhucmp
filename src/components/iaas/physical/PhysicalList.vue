<template lang="pug">
    div.subnet
        UcmpContainer(:breadcrumbItems="breadcrumbItems")
            div.full-container(slot="content")
                div.top-button-container
                    el-button.default-button.creat-button(v-if="activeTab !== 'network'" type="primary" size="small" icon="el-icon-plus" @click="handleBtnClick") 添加物理机
                el-tabs(v-model="activeTab" @tab-click="handleTabClick")
                    el-tab-pane(v-for="item in tabs" :label="item.label" :name="item.name" :key="item.name")
                div.subnet-table
                    router-view(:key="$route.fullPath")
                    // component(:is="activeTab")
        el-dialog(:title="title" v-if="phyVisible" :visible.sync="phyVisible" width="800px")        
            Newphysical(@closeDialog="closeDialog" @submitPhy="submitPhy")
</template>
<script>
import Newphysical from './Newphysical'
import NotNatube from './NotNatube'
import DoNatube from './DoNatube'

/**
 * @description 
 */
export default {
    data () {
        return {
            title: '添加物理机',
            phyVisible: false,
            prefixForm: {},
            activeTab: 'donatube',
            tabs: [
                { label: '已纳管', name: 'donatube' },
                { label: '未纳管', name: 'notnatube' }
            ],
            breadcrumbItems: [       
                { prop: '', label: '物理机管理' }
            ]
        }
    },
    methods: {
        /**
         * @description Tab切换事件
         */
        handleTabClick () {
            this.$router.push('/physical/' + this.activeTab)
        },

        /**
         * @description 顶部按钮点击事件
         */
        handleBtnClick () {
            this.phyVisible = true
        },

        /**
         * @description 关闭对话框
         */
        closeDialog () {
            this.phyVisible = false
        },
        /**
         * @description 创建物理机
         */
        submitPhy () {
            this.phyVisible = false
            this.$router.push({path: '/physical/' + this.activeTab, query: {uuid: new Date().getTime()}})
        }
    },

    computed: {

    },

    created () {
        this.$router.push('/physical/' + this.activeTab)
    },

    components: {
        Newphysical,
        donatube: DoNatube,
        notnatube: NotNatube
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

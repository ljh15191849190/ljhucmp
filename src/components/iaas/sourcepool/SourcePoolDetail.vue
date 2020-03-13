<template lang="pug">
    UcmpContainer(:breadcrumbItems="breadcrumbItems" :bgEmpty="true")
        div.overflow-y-auto.full-container(slot="content")
            div.full-container.source-pool-detail
                Source-Pool-Tree(:treeData="treeData")
</template>
<script>
/**
 * @description 资源池详情
 */
import SourcePoolTree from '@common/topology/TidyTopologyTree'
export default {
    name: 'SourcePoolDetail',
    data () {
        return {
            treeData: [],
            breadcrumbItems: [       
                { prop: '/resource-pool', label: '资源池' },
                { prop: '', label: '资源池详情' }
            ]
        }
    },
    created () {
        this.treeData = {
            name: '阿里云',
            children: [
                {
                    name: '网络',
                    value: '192.168.124.21'
                },
                {
                    name: '集群',
                    value: '阿里云集群'
                },
                {
                    name: '存储服务器',
                    value: '阿里云服务器'
                }
            ]
        }
    },
    components: {
        SourcePoolTree
    }
}
</script>
<style lang="scss" scoped>
.source-pool-detail {
    background-color: #fff;
    padding: 16px;
}
</style>



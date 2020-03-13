<template lang="pug">
    UcmpContainer(:breadcrumbItems="breadcrumbItems" :bgEmpty="true")
        div.overflow-y-auto.full-container(slot="content")
            div.full-container.cloud-provider-detail
                Cloud-Provider-Source-Tree(v-if="isShowTopology" :treeData="treeData" :addCluster="addCluster")
</template>
<script>
/**
 * @description 云厂商详情
 */
import Api from '@api'
import CloudProviderSourceTree from '@common/topology/TidyTopologyTree'
export default {
    name: 'CloudProviderDetail',
    data () {
        return {
            breadcrumbItems: [
                { prop: '/cloud-provider', label: '云厂商' },
                { prop: '', label: '云厂商拓扑' }
            ],
            isShowTopology: false,
            treeData: {}
        }
    },
    methods: {
        /**
        * @description 懒加载选中节点的子节点群 cluster
        */
        addCluster (d, update) {
            // Update topo data
            if (d && d.data && d.data.node_id && d.data.children_type && !d.data.children) {
              let param = { id: this.$route.params.id, parent_node_id: d.data.node_id, node_type: d.data.children_type }
              Api.get('provider', param, true).then(
                res => {
                  if (res && Array.isArray(res.topology)) {
                      d.data.children = res.topology
                      update(d, true)
                  }
                }
              )
            }
        }
    },
    created () {
        Api.get('provider', { id: this.$route.params.id, node_type: '1' }, true).then(
            res => {
                if (res && Array.isArray(res.topology)) {
                  this.treeData = res.topology[0]
                  this.isShowTopology = true
                }
            }
        )
    },
    components: {
        CloudProviderSourceTree
    }
}
</script>
<style lang="scss" scoped>
.cloud-provider-detail {
    background-color: #fff;
    padding: 16px;
}
</style>



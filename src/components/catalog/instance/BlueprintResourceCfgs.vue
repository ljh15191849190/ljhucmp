<template lang="pug">
    div.inner-resources
        AllResourceItems(:shoppingList="transformedItems" :noCheck="noCheck")
</template>
<script>
/**
 * @description 给定编排的所有资源列表以及对应配置展示
 * @description 以下场景使用该组件: 申请指定编排的服务实例; 新建编排,点击指定编排,显示其资源信息
 */
import AllResourceItems from '@/components/catalog/shoppingCar/AllResourceItems'
import Api from '@api'

export default {
    props: ['blueprintId'],

    data () {
        return {
            allResources: [],
            noCheck: true
        }
    },

    methods: {
        getAllResByBpId () {
            Api.get('getMetadata', { _code: 'blueprint/' + this.blueprintId + '/nodes' }, true).then(
                res => {
                    this.allResources = res
                }
            )
        }
    },

    created () {
        this.getAllResByBpId()
    },

    watch: {
       blueprintId () {
            this.allResources.splice(0, this.allResources.length)
            this.getAllResByBpId()
       } 
    },

    computed: {
        transformedItems () {
            return this.allResources.map(
                res => {
                    return {
                        data: {
                            service_code: res.service_code,
                            resources: {
                                [res.id]: res
                            }
                        }
                    }
                }
            )
        } 
    },

    components: {
        AllResourceItems
    }
}
</script>

<style lang="scss" scoped>
.inner-resources {
    width: 100%;
    height: 100%;
}
</style>

<template lang="pug">
    div.instance-detail(v-if="resource" :class="{'including': resource._isIncluding}")
        div.service-name.gray-bg(v-if="resource._isIncluding" @click="toggleDetail") {{resourceName}}
            i.cursor-icon(:class="[resource._isOpening ? 'el-icon-caret-top' : 'el-icon-caret-bottom']")
        ResourceGroupItemDetail(
            v-show="!resource._isIncluding || resource._isOpening"
            v-for="(displayGroup, index) in Object.keys(resourceDisplayList)"
            :key="index"
            v-if="resourceDisplayList[displayGroup].list.length"
            :groupName="resourceDisplayList[displayGroup].name"
            :groupId="resourceDisplayList[displayGroup].id"
            :displayList="resourceDisplayList[displayGroup].list")

            //- 挂载的主机列表
            template(slot="ecsList" v-if="isShowReleteEcs")
                div.service-name 挂载主机列表：
                RelatedEcsList(:ecsList="resource.attributes.ecs" :resourceType="resource.service_code")

</template>
<script>
import MetadataUtils from '@server/metadata.utils'
import RelatedEcsList from './RelatedEcsList'
import ResourceGroupItemDetail from './ResourceGroupItemDetail'

export default {
    components: { RelatedEcsList, ResourceGroupItemDetail },
    props: [ 'resource', 'metadata' ],
    data () {
        return {
            detailColspan: 6,
            resourceName: '',
            resourceDisplayList: []
        }
    },
    created () {
        this.formatServiceName()

        this.$nextTick(() => {
            MetadataUtils.handleOrderDetailConfig(this.resource, this.metadata).then(res => {
                this.resourceDisplayList = res
            })
        })
    },
    methods: {
        toggleDetail () {
            this.resource._isOpening = !this.resource._isOpening
        },
        formatServiceName () {
            MetadataUtils.asyncGetCheckedMetadata(this.metadata, this.resource.service_code).then(res => {
                this.resourceName = res.name
            })
        },
        resizeColspan (windowWidth) {
            if (windowWidth >= 1920)
                this.detailColspan = 6
            else if (windowWidth >= 1280)
                this.detailColspan = 8
            else
                this.detailColspan = 12
        }
    },
    mounted () {
        this.resizeColspan(window.innerWidth)
        window.onresize = () => {
            this.resizeColspan(window.innerWidth)
        }
    },
    computed: {
        isShowReleteEcs () {
            let notShowRelateServiceCodes = ['backup']
            return !notShowRelateServiceCodes.includes(this.resource.service_code) && Array.isArray(this.resource.attributes.ecs) && this.resource.attributes.ecs.length
        }
    }
}
</script>
<style lang="scss" scoped>
.cursor-icon {
    float: right;
    padding-right: 10px;
}
</style>

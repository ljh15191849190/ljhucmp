<template lang="pug">
    UcmpContainer.vcops(:breadcrumbItems="breadcrumbItems")
        div.full-container.position-relative(slot="content")
            el-tabs(v-model="page")
                el-tab-pane(v-for="tag in tagList" :key="tag.prop" :label="tag.label" :name="tag.prop")
            //keep-alive
            div.vcops-content(:is="page")
</template>

<script>
    import UtilizationRateTrend from './UtilizationRateTrend'
    import CapacityDetail from './CapacityDetail'
    import ResourceRank from './ResourceRank'
    import VMTrend from './VMTrend'
    import VMHighLoad from './VMHighLoad'

    /**
     * vcops首页
     *
     * @description
     * @author jia.lu
     */
    export default {
        name: 'VCopsIndex',
        components: {
            UtilizationRateTrend,
            CapacityDetail,
            ResourceRank,
            VMTrend,
            VMHighLoad
        },
        data () {
            return {
                breadcrumbItems: [{prop: '/vcops', label: 'VCOPS运营报表'}],
                page: 'CapacityDetail',
                tagList: [
                    {prop: 'CapacityDetail', label: '群集容量详细信息'},
                    {prop: 'UtilizationRateTrend', label: '利用率趋势'},
                    {prop: 'ResourceRank', label: '资源争用排名'},
                    {prop: 'VMTrend', label: '虚拟机增长趋势报告'},
                    {prop: 'VMHighLoad', label: '重负载虚拟机报告'}
                ]
            }
        },
        computed: {},
        methods: {}
    }
</script>

<style lang="scss" scoped>
    .vcops-content {
        height: calc(100% - 64px);
    }
</style>
<style lang="scss">
    .vcops .vcops-item {
        display: flex;
        flex-direction: column;

        .oper-icon-btn {
            position: absolute;
            top: 0;
            right: 0;
        }

        .filter-btn {
            margin-top: 0;
            margin-left: 12px;
        }

        .vcops__cards {
            display: flex;
            flex-wrap: wrap;
            justify-content: flex-start;

            .el-card {
                min-width: 500px;
                width: 30%;
                margin: 0 12px 12px 0;
            }
        }

        .vcops-item__filter-panel {
            margin-right: 60px;
        }
    }
</style>

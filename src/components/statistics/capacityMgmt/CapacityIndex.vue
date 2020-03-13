<template lang="pug">
    UcmpContainer(:breadcrumbItems="breadcrumbItems")
        div.full-container.position-relative(slot="content")
            el-tabs(v-model="activeItem" @tab-click="handleClick")
                el-tab-pane(v-for="tab in tabs" :label="tab.label" :name="tab.prop" :key="tab.prop")
            div.main-cot
                router-view
</template>

<script>
/**
 * @description 容量概览
 */
export default {
    name: 'CapacityOverview',
    data () {
        return {
            bgEmpty: true,
            breadcrumbItems: [{prop: '/capacity-mgmt', label: '容量概览'}],
            tabs: [
                {label: '使用分析', prop: 'using-analysis'},
                // {label: '空闲分析', prop: 'free-analysis'},
                {label: '容量优化建议', prop: 'capacity-suggestion'}
            ],
            activeItem: 'using-analysis'
        }
    },
    methods: {
        handleClick (tab) {
            // this.$router.push(tab.name)
        }
    },
    watch: {
        activeItem () {
            this.$router.push(this.activeItem)
        }
    },
    created () {
        this.$router.push(this.activeItem)
    }
}
</script>
<style lang="scss" scoped>
.main-cot{
    height: calc(100% - 54px);
}

</style>


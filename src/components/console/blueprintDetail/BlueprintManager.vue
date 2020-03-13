<template lang="pug">
    div.padding-top.full-container(v-loading="isloading" element-loading-spinner="ucmp-icon-loading")
        DynamicFilterForm(:submit="submitFn" :metaItems="metaItems")
        div#services-cot.services-cot.d-flex.justify-content-start.flex-wrap.margin-top.overflow-y-auto(v-if="servicesItems.length")
            div.item-service.d-flex.flex-column.align-items-center(v-for="item in servicesItems" :key="item.serviceCode" @click="routerTo(item)" :style="{background: colorScale(item.blueprintInstanceCount, originServices)}")
                //span.service-icon
                i.service-icon(:class="item.icon ? item.icon :'resource-icon-'")
                p.service-name.text-overflow-ellipsis {{item.blueprintName}}
                span.service-count 实例数 ({{item.blueprintInstanceCount}})
                p.service-des
                    span {{item.description}}
        div(v-else)
            | 无相关应用服务信息
</template>
<script>
/**
 * @description 应用服务管理页面
 */
import Api from '@api'
import DynamicFilterForm from '../../common/dynamicForm/DynamicFilterForm'
import * as d3 from 'd3'

export default {
    data () {
        return {
            metaItems: [{
                key: 'name',
                label: '请输入编排服务名称'
            }],
            originServices: [],
            servicesItems: [],
            isloading: false
        }
    },
    created () {
        this.isloading = true
        // UCMP3-3880 3.3.2性能优化此处加count=true查询blueprintInstanceCount
        Api.get('getBlueorintDetail', {count: true}).then(
            res => {
                this.isloading = false
                if (res) {
                    let bpResources = res.filter(item => item.blueprintInstanceCount)
                    this.originServices = JSON.parse(JSON.stringify(bpResources))
                    this.servicesItems = JSON.parse(JSON.stringify(bpResources))
                }
            },
            () => { this.isloading = false }
        )
    },
    methods: {
        routerTo (item) {
            this.$router.push({path: `/serviceInstance/${item.serviceCode}`, query: {type: 'blueprint'}})
            this.$emit('updateBreadCrumbs', item.blueprintName)
        },
        submitFn (params) {
            if (!params.name)
                this.servicesItems = [...[], ...this.originServices]
            else {
                this.servicesItems = [...[], ...this.originServices].filter(item => {
                    return item.blueprintName.indexOf(params.name) !== -1
                })
            }
        },
        colorScale (count, countArr) {
            let bluePrintList = countArr.map(d => +d.blueprintInstanceCount)
            let scale = d3.scaleLinear()
                    .domain([0, d3.max(bluePrintList)])
                    .range([0.4, 0.7])
            return d3.interpolateBlues(scale(+count))
        }
    },
    components: {
        DynamicFilterForm
    }
}
</script>
<style lang="scss" scoped>
.services-cot{
    height: calc(100% - 50px);
    .item-service{
        width: 300px;
        height: 280px;
        padding: 9px 12px;
        text-align: center;
        cursor: pointer;
        padding: 9px 12px;
        margin-right: 15px;
        margin-bottom: 15px;
        position: relative;
        overflow: hidden;

        .service-icon {
            font-size: 75px;
            line-height: 1;
            margin: 16px 0;
        }
        .service-name{
            font-size: 16px;
            font-weight: 500;
            padding: 0 10px;
            white-space: nowrap;
            overflow-y: hidden;
            margin: 0;
            margin-bottom: 10px;
            height: 30px;
            text-overflow: ellipsis;
        }
        .service-count{
            display: block;
            font-size: 14px;
            position: absolute;
            right: 10px;
            top: 10px;
        }
        .service-des {
            margin-top: 5px;
            font-size: 12px;
            text-align: left;
            height: calc(100% - 76px - 24px - 5px);
            width: 100%;
            margin-bottom: 0;
            display: flex;
            flex-direction: column;
        }
    }
}
</style>


<template lang="pug">
    CardItem(:title="titleLabel" v-loading="loading", :totalPage="cacheApplications.length", :maxShowCount="maxShowCount", ref="cardItem")
        div.full-container(slot="chartCot")
            el-row.padding(v-for="(resource, index) in resources" :key="index", v-if="index < maxShowCount")
                el-col(:span="4")
                    span.title-ins.show-more(@click="routerTo(resource)") {{resource.res_type}}
                el-col.cot-col(:span="20")
                    div.cot-inline.item-cot(v-for="(item, _index) in resource.statusList" :key="_index")
                        span.circle-point(:style="item.custom_style ? item.custom_style: {}")
                        span.txt-color {{item.name}}({{item.count}})
</template>
<script>
// 子模块---我的资源

import CardItem from '../CardItem'
import { mapGetters } from 'vuex'
import Api from '@api'

export default {
    components: { CardItem },
    data () {
        return {
            titleLabel: '我的资源',
            resources: [],
            loading: false,
            cacheApplications: [],
            maxShowCount: 4
        }
    },
    created () {
        this.loading = true
        Api.get('db_resources', {}).then(res => {
            this.loading = false
            if (res) {
                this.cacheApplications = res

                // UCMP3-3523【总览】我的资源展示顺序建议调整成：云主机、云硬盘、NAS、F5
                this.cacheApplications.sort((pre, next) => {
                    let preIndex = this.metadata.findIndex(item => item.service_code === pre.res_code)
                    let nextIndex = this.metadata.findIndex(item => item.service_code === next.res_code)
                    return preIndex - nextIndex
                })
                this.cacheApplications.forEach(item => {
                    item.statusList = this.formatStatus(item, this.metadata)
                })
                this.resources = this.cacheApplications.slice(0, this.maxShowCount)
            }
        }, () => {
            this.loading = false
        })
    },
    methods: {
        // 从元数据中获取状态属性的enum用于显示状态名称及其颜色
        formatStatus (statusRes, metadata = []) {
            let statusList = []
            let currentService = this.metadata.find(_item => _item.service_code === statusRes.res_code)
            if (currentService) {
                let statusAttr = currentService.attribute.find(_attr => _attr.key === 'status')
                let statusMap = statusAttr && statusAttr.query_condition ? JSON.parse(JSON.stringify(statusAttr.query_condition.enum || [])) : []
                statusList = statusMap.map(status_item => {
                    let countObj = statusRes.status_list.find(res_item => res_item.status_code === status_item.id)
                    return {
                        ...status_item,
                        count: countObj ? countObj.status_count : 0
                    }
                })
            }
            return statusList
        },
        // 调转至云主机列表页面
        routerTo (item) {
            this.$router.push({path: `/serviceInstance/${item.res_code}`})
        },
        // 组件调用slot内部的方法
        parentCallSwitchStep () {
            // slot内部拿组件的switchIndex
            let switchIndex = this.$refs.cardItem.switchIndex
            this.resources = this.cacheApplications.slice(switchIndex * this.maxShowCount, (switchIndex + 1) * this.maxShowCount)
        }
    },
    computed: {
        ...mapGetters([
            'metadata'
        ])
    }
}
</script>
<style lang="scss" scoped>
.full-container{
    padding: 0 3%;
}
.title-ins{
    display: inline-block;
    font-size: 12px;
    font-weight: 500;
    padding-right: 3px;
}
.cot-col{
    vertical-align: middle;
    font-size: 12px;
    .item-cot {
        width: 25%;
        span {
            vertical-align: middle;
        }
        // .txt-color {
        //     color: $fontTitleLight;
        // }
    }
}
.cot-inline{
    display: inline-block;
}
.circle-point{/*此处修改宽高*/
    vertical-align: middle;
    display: inline-block;
    width: 10px;
    height: 10px;
    display: inline-block;
    border-radius: 50%;
    margin-right: 8px;
    background: $themeColor;
}
</style>

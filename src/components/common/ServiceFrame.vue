<template lang="pug">
    div.full-container
        div.d-flex.justify-content-between
            div.catalog-list
                span(ref="ServiceAll" v-btn-privilege="'Service_all'" :class="{'active': currentCatalog === 'all'}" @click="currentCatalog = 'all'") 全部({{filteredServiceList.length}})
                span(:class="{'active': currentCatalog === item.serviceGroup}" v-for="item in catalogContents" :key="item.serviceGroup" v-if="item.metadatas.length" @click="currentCatalog = item.serviceGroup") {{ item.label || item.serviceGroup }}({{item.metadatas.length || 0}})
            el-input.input-search-width(prefix-icon="el-icon-search" placeholder="请输入服务名称搜索" v-model="searchVal" clearable)
        div.d-flex.flex-wrap.margin-top.calc-height.scroll-top-shadow
            template(v-for="(service, index) in filteredServiceList")
                div.content-item.border.d-flex.flex-column.align-items-center.position-relative.el-card.is-hover-shadow(
                v-if="service.group === currentCatalog || currentCatalog === 'all'"
                :key="index"
                :class="{'roof': service.roof}"
                )
                    i.theme-color.adjust-icon.margin-top.margin-bottom(:class="['resource-icon-' + service.service_code, service.icon ? service.icon : '']")
                    div.catalog-name.margin-bottom.w-100.text-truncate.text-center(v-title-tip="service.name") {{service.name}}
                    p.catalog-desc(v-html="service.description")
                    el-dropdown.position-absolute.adjust-oper-icon(@command="handleClick" size="mini")
                        span.el-dropdown-link
                            i.column-name.ucmp-icon-menu-collapse-btn
                        el-dropdown-menu(slot="dropdown")
                            template(v-for="btn in (cornerBtns.concat(defaultCornerBtns))")
                                el-dropdown-item(v-if="!btn.privilege_code && cornerDisplayFuc({service, btn})" :icon="btn.icon" :key="btn.code" :command="{service, btn}") {{btn.description}}
                                el-dropdown-item(v-else-if="cornerDisplayFuc({service, btn}) && validateBtnDisplayByDefault({service, btn})" :icon="btn.icon" :key="btn.code" :command="{service, btn}" v-btn-privilege="btn.privilege_code") {{btn.description}}
                            el-dropdown-item(v-if="useRoof" )
                    div.box-content
                        el-button.box-content-btn(
                            v-for="btn in contentBtns"
                            :key="btn.code"
                            v-btn-privilege="btn.privilege_code"
                            @click="handleClick({service, btn})"
                            size="small"
                            type="warning"
                            :icon="btn.icon")
                            span.apply-margin {{btn.description}}
</template>
<script>
/**
 * @description 服务(元数据)展示框架组件 [服务目录|服务定义|服务配置]
 * 内置 置顶|取消置顶功能，需要通过 cornerDisplayFuc 函数指定使用
 * 内置 通过关键词筛选过滤(name|description)
 */
import { serviceGroupMap, businessContains } from '@mock/catalog/catalogType.mock'

export default {
    props: {
        serviceList: {
            type: Array,
            default: () => []
        }, // 服务列表
        cornerBtns: {
            type: Array,
            default: () => []
        }, // 右上角按钮列表 {code: '', description: '', privilege_code?: '', icon?: ''}
        contentBtns: {
            type: Array,
            default: () => []
        }, // 正文按钮列表, 格式同上
        cornerDisplayFuc: {
            type: Function,
            default: () => true
        } // 判断按钮是否使用的函数 arguments: {service: {service_code: ''}, btn: {code: ''}}
    },
    data () {
        return {
            copiedServiceList: [], // 复制父组件传来的原始列表
            currentCatalog: '', // 当前选中分类
            searchVal: '', // 关键词
            serviceGroupMap: serviceGroupMap,
            defaultCornerBtns: [
                {
                    code: 'unRoof',
                    description: '取消置顶',
                    privilege_code: 'Service_top',
                    icon: ''
                },
                {
                    code: 'roof',
                    description: '置顶',
                    privilege_code: 'Service_top',
                    icon: ''
                }
            ], // 右上角默认内置按钮列表
            roof: [] // 置顶列表
        }
    },
    methods: {
        // 内置置顶和取消置顶功能，不需要传递事件给父组件
        handleClick ({service, btn}) {
            // 置顶功能
            if (btn.code === 'roof') {
                let code = service.service_code

                let roof = this.roof
                if (roof.indexOf(code) === -1) {
                    roof.push(code)
                    localStorage.setItem('service-catalog-roof', JSON.stringify(roof))
                }
                this.$set(service, 'roof', true)
                return
            } else if (btn.code === 'unRoof') { // 取消置顶功能
                let code = service.service_code

                let roof = this.roof
                let index = roof.indexOf(code)
                if (index > -1) {
                    roof.splice(index, 1)
                    localStorage.setItem('service-catalog-roof', JSON.stringify(roof))
                }
                this.$set(service, 'roof', false)
                return
            } 
            this.$emit('handleClick', service, btn)
        },

        // 默认检测按钮是否使用
        validateBtnDisplayByDefault ({service, btn}) {
            if (btn.code === 'roof' && service.roof)
                return false
            else if (btn.code === 'unRoof' && !service.roof)
                return false
            return true
        }
    },
    computed: {
        // 分类属性列表
        catalogContents () {
            let metaItems = []
            let groupKeys = []
            // UCMP3-1128【服务目录】将某蓝图置顶，会影响导航的排序
            for (let key of Object.keys(this.serviceGroupMap)) {
                let item = {
                    serviceGroup: key,
                    label: this.serviceGroupMap[key].label,
                    order: this.serviceGroupMap[key].order,
                    metadatas: []
                }
                groupKeys.push(key)
                metaItems.push(item)
            }

            this.filteredServiceList.forEach(service => {
                if (service.group) {
                    let index = businessContains.indexOf(service.group) > -1 ? groupKeys.indexOf('business') : groupKeys.indexOf(service.group)
                    if (index !== -1) {
                        if (businessContains.indexOf(service.group) > -1)
                            service.group = 'business'
                        metaItems[index].metadatas.push(service)
                    } else {
                        groupKeys.push(service.group)
                        metaItems.push({
                            serviceGroup: service.group,
                            order: 88,
                            metadatas: []
                        })
                        metaItems[metaItems.length - 1].metadatas.push(service)
                    }
                }
            })
            metaItems.sort((a, b) => a.order - b.order)

            return metaItems
        },

        // 判断是否使用置顶/取消置顶功能
        useRoof () {
            if (this.cornerDisplayFuc({service: {}, btn: {code: 'roof'}}) || this.cornerDisplayFuc({service: {}, btn: {code: 'unRoof'}}))
                return true
            else return false
        },

        // 当前页面显示列表
        filteredServiceList () {
            let list = []
            if (this.searchVal) {
                list = this.copiedServiceList.filter(service => {
                    // UCMP3-1469【服务目录】服务目录页面关键字查询需修改只按照服务名称过滤，不包含描述中的
                    return (service.name && service.name.indexOf(this.searchVal) !== -1) || (
                        service.description && service.description.indexOf(this.searchVal) !== -1
                    )
                })
            } else
                list = this.copiedServiceList
            if (!this.useRoof)
                return JSON.parse(JSON.stringify(list))
            else {
                // 使用置顶|取消置顶功能，对服务列表进行排序
                let copiedList = JSON.parse(JSON.stringify(list))
                let roofList = []
                this.roof.forEach(roof_code => {
                    let index = copiedList.findIndex(service => service.service_code === roof_code)
                    if (index !== -1) {
                        let service = copiedList.splice(index, 1)[0]
                        this.$set(service, 'roof', true)
                        roofList.push(service)
                    }
                })
                return roofList.concat(copiedList)
            }
        }
    },
    watch: {
        'serviceList.length' (val) {
            this.copiedServiceList = this.serviceList
        },
        catalogContents: {
            deep: true,
            handler (newVal, oldVal) {
                if (this.$refs.ServiceAll.style.display === 'none') {
                    let firstGroup = newVal.find(item => {
                        return item.metadatas && item.metadatas.length > 0
                    })
                    if (firstGroup)
                        this.currentCatalog = firstGroup.serviceGroup
                } else    
                    this.currentCatalog = 'all'
            }
        }
    },
    // UCMP3-6766服务目录全部不显示时，页面仍显示全部的服务，需修改显示当前第一个页签下的服务--由于catalogContents数据从元数据拿来 数据比较慢 放到监听
    // mounted () {
    //     if (this.$refs.ServiceAll.style.display === 'none')
    //         this.currentCatalog = 'ecs'
    //     else    
    //         this.currentCatalog = 'all'
    // },
    created () {
        this.copiedServiceList = this.serviceList
        if (this.useRoof && localStorage.getItem('service-catalog-roof'))
            this.roof = JSON.parse(localStorage.getItem('service-catalog-roof'))
    }
}
</script>

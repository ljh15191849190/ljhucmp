<template lang="pug">
div(v-cloak)
    div.service-container(v-for="service in sortedList" :key="service.service_code")
        div.service-header.d-flex
            el-checkbox(v-if="!noCheck" v-model="checkAll[service.service_code]"  @change="handleCheckAll($event, service.service_code)")
            span.service-name {{service.name}}
        ul.service-instance-nav
            li.service-instance-item(v-for="(item, index) in service.children")
                div.instance-item-container.d-flex
                    div.checked-container(v-if="!noCheck")
                        el-checkbox(v-if="!noCheck" v-model="item.checked" @change="handleCheck($event, service.service_code, item)")
                    div.info-container(v-if="metadateObj[service.service_code]&&metadateObj[service.service_code].group !== 'blueprint'" :class="{'full-width': noCheck}")
                        //- bug UCMP-450【应用编排】编排名称过长时显示问题
                        div.item.d-flex(v-for="proper in metadateObj[service.service_code].attributes" 
                          v-if="proper.created && Array.isArray(Object.values(item.data.resources)) && Object.values(item.data.resources)[0] && Object.values(item.data.resources)[0].display && Object.values(item.data.resources)[0].display.hasOwnProperty(proper.key)" 
                          :key="proper.key")
                            div.inline-block.read-only.text-normal.text-nowrap {{proper.label}}:
                            div.inline-block.read-only.value.text-overflow-ellipsis(v-title-tip="") {{Object.values(item.data.resources)[0].display[proper.key]}}
                    div.info-container(v-if="metadateObj[service.service_code]&&metadateObj[service.service_code].group === 'blueprint'")
                        div.item
                            div.inline-block.read-only.text-normal {{service.name}}

</template>
<script>
/**
 * @description 购物车资源条目展示/选择，在购物车侧边栏作为子组件使用
 */
import Api from '@api'
import { mapGetters } from 'vuex'

export default {
    props: {
        // 资源列表
        shoppingList: {
            type: Array,
            default: function () {
                return []
            }
        },

        // 是否需要复选框
        noCheck: {
            type: Boolean,
            default: false
        }
    },

    data () {
        return {
            checkAll: {
                cloud_ecs: false,
                cloud_volume: false
            },
            bpServices: [],
            applicableServices: []
        }
    },
    created () {
        Api.get('getBlueorintDetail', {}).then(
            res => {
                this.bpServices = res
                this.initializeData()
            }
        )
    },
    methods: {
        initializeData () {
            let applicableArray = this.metadata.filter(
                service => service.applicable
            )
            // 将编排列表和应用列表合并
            let existBpSerevice = JSON.parse(JSON.stringify(applicableArray)).filter(item => item.group === 'blueprint').map(item => item.service_code)

            this.bpServices.forEach(bp_item => {
                // UCMP3-5614 修复编排修改后跳转进入服务目录多了一条重复数据的问题
                if (!existBpSerevice.includes(bp_item.serviceGroup) && !applicableArray.find(meta => meta.service_code === bp_item.serviceCode)) {
                    applicableArray.push({
                        service_code: bp_item.serviceCode,
                        name: bp_item.blueprintName,
                        description: bp_item.description,
                        icon: bp_item.icon,
                        group: 'blueprint'
                    })
                }
            })

            // 所有服务
            this.applicableServices = JSON.parse(JSON.stringify(applicableArray))
        },
        /**
         * @description 全选/全不选
         */
        handleCheckAll (rst, prop) {
            this.innerShoppingList.forEach(item => {
                if (item.data.service_code === prop)
                    item.checked = rst
            })
        },

        /**
         * @description 资源选择
         */
        handleCheck (rst, prop, item) {
            // item.checked = rst
            if (!rst && this.checkAll[prop])
                this.checkAll[prop] = false
            else {
                // 自动全选
                const serviceList = this.innerShoppingList.filter(item => {
                    return item.data.service_code === prop
                })

                const someoneNoCheck = serviceList.find(item => {
                    return !item.checked
                })

                this.checkAll[prop] = !someoneNoCheck
            }
        }
    },

    computed: {
        /**
         * @description 资源条目列表获取以及更新。当innerShoppingList需要更新时，通知父组件改变 shoppingList的内容
         */
        innerShoppingList: {
            get () {
                return this.shoppingList
            },
            set (val) {
                this.$emit('update:shoppingList', val)
            }
        },

        notCheckedResources () {
            return this.innerShoppingList.filter(
                item => {
                    if (!item.checked)
                        return item
                }
            )
        },

        /**
         * metadata 基础信息，Object类型
         */
        metadateObj () {
            let meta = {}
            this.applicableServices.forEach(
                item => {
                    meta[item.service_code] = {
                        name: item.name,
                        group: item.group ? item.group : '',
                        attributes: item.attribute ? item.attribute : []
                    }
                }
            )
            return meta
        },

        ...mapGetters([
            'metadata'
        ]),

        /**
         * @description 资源分类列表(元数据)，资源作为child附在其子节点上
         */
        sortedList () {
            let rst = []
            this.innerShoppingList.forEach(
                res => {
                    let exsit = rst.filter(
                        item => {
                            if (item.service_code === res.data.service_code)
                                return item
                        }
                    )[0]
                    if (exsit)
                        exsit.children.push(res)
                    else {
                        rst.push({
                            name: this.metadateObj[res.data.service_code] ? this.metadateObj[res.data.service_code].name : '',
                            service_code: res.data.service_code,
                            children: [res]
                        })
                    }
                }
            )
            return rst
        }
    }
}
</script>
<style lang="scss" scoped>
    [v-cloak] {
        display: none;
    }
</style>
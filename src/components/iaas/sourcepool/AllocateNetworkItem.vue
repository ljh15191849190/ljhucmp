<template lang="pug">
    div.allocate-formItem
        div(v-if="formItem[uniqueKey] === 'vm_network'" v-for="(item, index) in networkObj.network" :key="index")
            el-form-item.is-required.margin-bottom.rw-input(:label="'网络(' + (index + 1)+')'")
                el-select(
                    v-model="item.network_id"
                    clearable
                    @change="netChange(item)"
                    v-validate="rules.require"
                    :name="'network'+index"
                    placeholder="请选择网络"
                    data-vv-as="网络"
                    :class="{ 'input': true, 'is-danger': errors.has('network' + index) }"
                    size="small"
                    @focus="focusWidget"
                )
                    el-option(v-for="item in networkObj.networkList" :key="item.network_id" :value="item.network_id" :label="item.name")
                el-tooltip(v-if="index === 0 && formItem.tip" :content="formItem.tip" placement="right")
                    i.ucmp-icon-question.theme-color.tip-icon
                i.network-btn.remove(class="ucmp-icon-device-remove" v-if="(index !== 0 && (index === networkObj.network.length - 1))" size="small" type="primary" @click="deleteNetWork(index)")
                i.network-btn.plus(class="ucmp-icon-device-plus"
                    :class="{active: index !== 0 && (index === networkObj.network.length - 1), isTotip: index === 0 && formItem.tip}"
                    v-if="(index === 0 && (networkObj.network.length === 1)) || (index !== 0 && (index === networkObj.network.length - 1))"
                    size="small" type="primary" @click="addNetWork"
                )
                i.network-btn.remove(class="ucmp-icon-device-remove"
                :class="{isTotip: index === 0 && formItem.tip}" v-else size="small" type="primary" @click="deleteNetWork(index)")
                span.validator-error.is-danger(v-if="errors.has('network' + index)") {{ errors.first('network' + index) }}
            el-form-item.is-required.margin-bottom.rw-input(label="子网")
                // UCMP3-1251 “子网”字段，缺少必填项校验及提示
                el-select(
                    v-model="item.subnet_id"
                    clearable
                    placeholder="请选择子网"
                    size="small"
                    @focus="focusWidget"
                    v-validate="rules.require"
                    name="subnet_id"
                    data-vv-as="子网"
                    :class="{ 'input': true, 'is-danger': errors.has('subnet_id') }"
                )
                    el-option(v-for="item in networkObj.subnetList" :key="item.id" :value="item.id" :label="item.prefix")
                span.validator-error.is-danger(v-if="errors.has('subnet_id')") {{ errors.first('subnet_id') }}
            el-form-item.margin-bottom.rw-input(label="浮动IP")
                el-select(
                    v-model="item.float_subnet_id "
                    clearable
                    placeholder="请选择浮动IP"
                    size="small"
                    @focus="focusWidget"
                )
                    el-option(v-for="item in floatIpList" :key="item.id" :value="item.id" :label="item.prefix")
        el-form-item.is-required.margin-bottom.rw-input(v-if="formItem[uniqueKey] === 'f5_sub_network'" :label="formItem.label")
            el-select(
                v-model="networkObj.f5_sub_network"
                clearable
                placeholder="请选择子网"
                v-validate="rules.require"
                :name="'f5_sub_network'"
                data-vv-as="子网"
                :class="{ 'input': true, 'is-danger': errors.has('f5_sub_network') }"
                size="small"
                @focus="focusWidget"
            )
                el-option(v-for="item in networkObj.subnetList" :key="item.id" :value="item.id" :label="item.prefix")
            span.validator-error.is-danger(v-if="errors.has('f5_sub_network')") {{ errors.first('f5_sub_network') }}
</template>
<script>
export default {
    name: 'AllocateNetworkItem',
    inject: ['$validator'],
    props: {
        formItem: {
            type: Object,
            default: function () {
                return {}
            }
        },

        uniqueKey: {
            type: String,
            default: function () {
                return 'key'
            }
        },

        networkObj: {
            type: Object,
            default: function () {
                return {}
            }
        },

        resourceId: {
            type: String,
            default: ''
        },

        // 网络数据变化处理函数
        networkChange: Function
    },
    data () {
        return {
            rules: {
                require: {
                    required: true
                }
            }
        }
    },
    methods: {
        /**
         * @description 网络选择变化改变下拉选项是否可重复选择
         */
        netChange (networkItem) {
            // 根据网络选择变化调用父组件需要处理的联动函数
            // 需求变更：之前产品为了不让网络重复选择做了限制，现在根据业务去掉限制(2018-11-7)
            this.networkChange && this.networkChange(networkItem)
            this.networkObj.networkList.forEach(netItem => {
                if (networkItem.network_id) {
                    if (networkItem.network_id === netItem.network_id)
                        networkItem.network_name = netItem.name
                } else
                    networkItem.network_name = ''
            })
        },
        /**
         * @description 添加网络
         */
        addNetWork () {
            this.networkObj.network.push({network_id: '', subnet_id: '', network_name: '', float_subnet_id: ''})
        },
        /**
         * @description 删除网络
         */
        deleteNetWork (index) {
            this.networkObj.network.splice(index, 1)
        },
        focusWidget () {
            this.$emit('focusWidget', this.resourceId)
        }
    },
    created () {
    },
    computed: {
        floatIpList () {
            return this.networkObj.floatIpList ? this.networkObj.floatIpList : this.networkObj.subnetList
        }
    }
}
</script>

<style lang="scss" scoped>

</style>

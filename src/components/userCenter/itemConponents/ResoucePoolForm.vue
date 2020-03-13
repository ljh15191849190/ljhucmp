<template lang="pug">
    div.pool-form
        SelectEcs(v-if="isNeedEcs" :tableForms="tableForms" :isF5="isF5")
        DynamicForm(
            :formItems="constructedFormItems"
            :formData.sync="computedFormData"
            :display.sync="computedDisplay"
            :labelPosition="labelPosition"
            :inline="true"
            :uniqueKey="uniqueKey"
            :keepValueFitDom="keepValueFitDom"
            :showLinkedItemKeys="showLinkedItemKeys"
            :externalFormData="externalFormData"
            :disableValidate="disableValidate"
    )
</template>
<script>
/**
 * @description 审批F5表单
 */
import { mapGetters } from 'vuex'
import SelectEcs from '@/components/catalog/services/SelectEcs'
import DynamicForm from '@/components/common/dynamicForm/DynamicForm'
export default {
    name: 'ResoucePoolForm',
    inject: ['$validator'],
    props: {
        formItems: {
            type: Array,
            default: () => []
        },
        formData: {
            type: Object,
            default: () => {}
        },
        display: {
            type: Object,
            default: () => {}
        },
        uniqueKey: {
            type: String,
            default: () => 'key'
        },
        showLinkedItemKeys: {
            type: Array,
            default: () => []
        },
        externalFormData: {
            type: Object,
            default: () => {}
        },
        keepValueFitDom: {
            type: Boolean,
            default: () => false
        },
        isNeedEcs: {
            type: Boolean,
            default: () => true
        },
        labelPosition: {
            type: String,
            default: () => 'top'
        },
        disableValidate: {
            type: Boolean,
            default: () => true
        }
    },
    components: {SelectEcs, DynamicForm},
    data () {
        return {
            isF5: true,
            tableForms: [],
            priorityObj: null,
            constructedFormItems: []
        }
    },
    computed: {
        ...mapGetters([
            'metadata'
        ]),
        mountEcsList () {
            return this.tableForms[0].list.map(item => {
                item.id = item.instance_id + (item.port ? (':' + item.port) : '')
                item.name = item.instance_name + (item.port ? ('(' + item.port + ')') : '')
                return item
            })
        },
        computedFormData: {
            set (val) {
                this.$emit('update:formData', val)
            },
            get () {
                return this.formData
            }
        },
        computedDisplay: {
            set (val) {
                this.$emit('update:display', val)
            },
            get () {
                return this.display
            }
        }
    },
    methods: {
        init () {
            this.constructedFormItems = JSON.parse(JSON.stringify(this.formItems))
            this.tableForms = [{
                name: '挂载主机',
                service_code: 'ecs',
                list: [],
                tabAttrs: []
            }]
            this.tableForms[0].list = this.formData.ecs
            let tableRelateAttr = {key: '_name', label: '云主机', multiple: false, user_defined: true}
            let poolMetadataItem = this.metadata.find(item => item.service_code === 'pool')
            if (poolMetadataItem)
                this.tableForms[0].tabAttrs = [tableRelateAttr, ...poolMetadataItem.related_service[0].attribute]
            this.setArrtibute()
        },
        setArrtibute () {
            //处理负载均衡算法
            let balancingAttr = this.constructedFormItems.find(item => item.key === 'load_balancing_mode') 
            if (balancingAttr) {
                let balanceArithmetic = this.formData[balancingAttr[this.uniqueKey]]
                if (balanceArithmetic && balanceArithmetic === 'priority') {
                    let poolEcsAttr = {
                        created: true,
                        defaultOptions: this.mountEcsList,
                        description: '选择云主机',
                        detail: true,
                        key: 'pool_ecs',
                        id: 'pool_ecs',
                        label: '主服务器',
                        modified: false,
                        multiple: false,
                        query_condition: true,
                        quota: false,
                        required: true,
                        table_column: true,
                        type: 'select',
                        validation: {
                            required: true 
                        },
                        data_link: {
                            text_field: 'name',
                            value_field: 'id'
                        }
                    }

                    this.constructedFormItems = this.constructedFormItems.filter(item => item.key !== 'pool_ecs')
                    for (const index in this.constructedFormItems) {
                        if (this.constructedFormItems[index].key === 'load_balancing_mode') {
                            this.constructedFormItems.splice(index + 1, 0, poolEcsAttr)
                            break
                        }
                    }
                } else {
                    for (const index in this.constructedFormItems) {
                        if (this.constructedFormItems[index].key === 'pool_ecs') {
                            this.constructedFormItems.splice(index, 1)
                            break
                        }
                    }
                }
                //处理挂载主机
                let majorEcs = this.formData.pool_ecs  
                if (majorEcs) {
                    this.mountEcsList.forEach(item => {
                        item.major = item.id === majorEcs ? 1 : 0
                    })
                } else {
                    this.mountEcsList.forEach(item => {
                        item.major = 0
                    })
                }
                this.formData.ecs = this.mountEcsList
            }
        },
         /**
         * @description 根据云主机数目来限制负载均衡算法下拉选项
         */
        setBalaArithOptions () {
            this.formData.ecs = this.mountEcsList
            let ecsLen = this.mountEcsList.length
            let balancingAttr = this.constructedFormItems.find(item => item.key === 'load_balancing_mode') 
            if (balancingAttr) {
                let priorityOptIndex = -1
                for (let index = 0; index < balancingAttr.defaultOptions.length; index++) {
                    if (balancingAttr.defaultOptions[index].id === 'priority') {
                        priorityOptIndex = index
                        break
                    }
                }
                
                //云主机数目为2时才有优先级算法
                if (ecsLen === 2) {
                    if (priorityOptIndex === -1 && this.priorityObj)
                        balancingAttr.defaultOptions.push(this.priorityObj)
                } else {
                    if (this.formData[balancingAttr[this.uniqueKey]] === 'priority') this.formData[balancingAttr[this.uniqueKey]] = null
                    if (priorityOptIndex > -1)
                        this.priorityObj = balancingAttr.defaultOptions.splice(priorityOptIndex, 1)[0]
                }
            }
        }
    },
    created () {
        this.init()
    },
    watch: {
        'formData': {
            deep: true,
            handler (newVal, oldal) {
                this.setArrtibute()
            }
        },
        'tableForms': {
            deep: true,
            handler (newVal, oldal) {
                this.setBalaArithOptions()
            }
        }
    }
}
</script>


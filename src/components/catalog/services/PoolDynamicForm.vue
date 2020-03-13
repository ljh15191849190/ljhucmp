<template lang="pug">
    div.poolForm(:class="{'is-apply':name}")
        div(:class="{'child-form-title':name}")
            label.title {{name}}
        DynamicForm.business-form-body.pool-form-body(
            :formItems="form.attribute"
            :formData.sync="form.formData"
            :display.sync="form.formDisplay"
            :keepValueFitDom="keepValueFitDom"
            labelPosition="right"
        )
</template>
<script>
/**
 * @description pool form
 */
import DynamicForm from '@/components/common/dynamicForm/DynamicForm'
export default {
    name: 'PoolDynamicForm',
    inject: ['$validator'],
    props: ['form', 'tableForms', 'name', 'isneedEcs', 'keepValueFitDom'],
    data () {
        return {
            relateAttributes: [],
            priorityObj: null
        }
    },
    methods: {
        init () {
            if (this.form) {
                this.relateAttributes = this.form.attribute.filter(item => item.relate_created)
                this.setBalaArithOptions()
                this.setArrtibute()
            }
        },
        setArrtibute () {
            if (this.form) {
                //如果不需要关联云主机
                if (!this.isneedEcs) return
                //处理负载均衡算法
                let balanceArithmetic = this.form.formData.load_balancing_mode
                if (balanceArithmetic && balanceArithmetic === 'priority') {
                    let poolEcsAttr = {
                        created: true,
                        defaultOptions: this.mountEcsList,
                        description: '选择云主机',
                        detail: true,
                        key: 'pool_ecs',
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
                            //UCMP3-3415【审批管理】申请F5（优先级算法）走审批流程，审批详情中主服务器显示的是id（见截图）
                            //问题原因：为了区别两个同样的而云主机用新的字段区别
                            text_field: 'name',
                            value_field: 'id'
                        }
                    }

                    this.form.attribute = this.form.attribute.filter(item => item.key !== 'pool_ecs')
                    for (const index in this.form.attribute) {
                        if (this.form.attribute[index].key === 'load_balancing_mode') {
                            this.form.attribute.splice(index + 1, 0, poolEcsAttr)
                            break
                        }
                    }
                    if (!this.form.mapKeys['pool_ecs']) 
                        this.form.mapKeys['pool_ecs'] = 'pool_ecs'
                } else {
                    for (const index in this.form.attribute) {
                        if (this.form.attribute[index].key === 'pool_ecs') {
                            this.form.attribute.splice(index, 1)
                            break
                        }
                    }
                    if (this.form.mapKeys['pool_ecs']) {
                        // UCMP3-3198【控制台】修改F5负载均衡算法（由优先级算法修改到其他算法），节点优先级参数值未变化（见截图描述）
                        delete this.form.formData.pool_ecs
                        delete this.form.mapKeys['pool_ecs']
                    }
                }
                    
                //处理挂载主机
                let majorEcs = this.form.formData.pool_ecs  
                if (majorEcs && balanceArithmetic === 'priority') {
                    this.mountEcsList.forEach(item => {
                        item.major = item.id === majorEcs ? 1 : 0
                    })
                } else {
                    this.mountEcsList.forEach(item => {
                        item.major = 0
                    })
                }
                this.form.ecsList = {
                    ecs: this.mountEcsList
                }
            }
        },
        /**
         * @description 根据云主机数目来限制负载均衡算法下拉选项
         */
        setBalaArithOptions () {
            let ecsLen = this.mountEcsList.length
            let balancingAttr = this.form.attribute.find(item => item.key === 'load_balancing_mode') 
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
                    // UCMP3-940问题一：F5申请页面，选择两台主机，选择优先级算法，再添加一台主机，页面没有刷新（此时还显示优先级算法）；问题二：当选择小于两台主机时，提示信息文字描述有误（至少，不是至上）
                    // UCMP3-1510 F5实例详情中，点击修改按钮，负载均衡算法没有显示当前值
                    if (this.form.formData.load_balancing_mode === 'priority') this.form.formData.load_balancing_mode = null
                    if (priorityOptIndex > -1)
                        this.priorityObj = balancingAttr.defaultOptions.splice(priorityOptIndex, 1)[0]
                }
            }
        }
    },
    created () {
        this.init()
    },
    components: {
        DynamicForm
    },
    computed: {
        mountEcsList () {
            return this.tableForms[0].list.map(item => {
                item.id = item.instance_id + (item.port ? (':' + item.port) : '')
                item.name = item.instance_name + (item.port ? ('(' + item.port + ')') : '')
                return item
            })
        }
    },
    watch: {
        'form.formData': {
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
<style lang="scss" scoped>
.applyleft-title {
    width: 280px;
    background: #fff;
    color: $fontTitleLight;
}

.poolForm {
    background: #fff;
    margin-bottom: 10px;
}
/*
 * 公共组件, 在服务目录F5申请与控制台F5修改健康检查算法都引用了, 修改注意查看是否影响到其他页面
*/
.business-form .business-form-body {
    min-width: 500px;
}


</style>


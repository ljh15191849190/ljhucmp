<template lang="pug">
    div
        div.business-form.select-ecs.border-light-bottom(v-if="!hasEcs")
            SelectEcs(:tableForms="tableForms" :isF5="isF5")
        div.business-form.pool-form
            PoolDynamicForm(:form="forms[0]" :tableForms="tableForms" :name="name" :isneedEcs="true" :keepValueFitDom="keepValueFitDom")
</template>
<script>
/**
 * @description f5 form
 */
import SelectEcs from './SelectEcs'
import PoolDynamicForm from './PoolDynamicForm'
export default {
    name: 'F5DynamicForm',
    inject: ['$validator'],
    props: ['forms', 'tableForms', 'name', 'hasEcs', 'keepValueFitDom'],
    data () {
        return {
            isF5: true
        }
    },
    methods: {
    },
    created () {
    },
    components: {
        SelectEcs,
        PoolDynamicForm
    }
}
</script>
<style lang="scss">
.select-ecs, .pool-form{
    width: 100%;
}
</style>

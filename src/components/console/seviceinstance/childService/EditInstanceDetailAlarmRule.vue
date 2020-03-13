<template lang="pug">
    div.full-container
        EditRuleComponent(:isBelongToEcsDetail="isBelongToEcsDetail" :operationType="operationType" :strategyId="strategyId" :instanceName="instanceName")
</template>
<script>
import EditRuleComponent from '@/components//monitorAlarm/alarmStrategy/EditRuleComponent'
export default {
    components: { EditRuleComponent },
    data () {
        return {}
    },
    computed: {
        isBelongToEcsDetail () {
            return this.$route.query.isBelongToEcsDetail
        },
        operationType () {
            return this.$route.query.type
        },
        strategyId () {
            return this.$route.query.strategyId
        },
        instanceName () {
            return this.$route.query.instanceName
        }
    }
}
</script>

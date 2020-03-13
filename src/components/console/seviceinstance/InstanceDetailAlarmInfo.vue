<template lang="pug">
    div.full-container
        AlarmTable(v-if="$route.params.id" :instanceId="$route.params.id" :instanceType="instanceType" :isEcsAlarm="isEcsAlarm")
        EmptyPage(v-else)
            span(slot="content") 无相关告警信息
</template>
<script>
import AlarmTable from '../../monitorAlarm/alarm_components/AlarmTable'
import EmptyPage from '../../common/EmptyPage'
import { mapGetters } from 'vuex'
export default {
    data () {
        return {
            isEcsAlarm: true
        }
    },
    computed: {
        ...mapGetters([
            'metadata'
        ]),
        serviceList () {
            let allObj = {}
            this.metadata.map(item => {
                if (item && item.group && (item.group !== 'blueprint' && item.group !== 'tag' && item.group !== 'storage'))
                    allObj[item.service_code] = item.name
            })
            return allObj
        },
        instanceType () {
            return this.$route.params.code ? this.$route.params.code : 'ipmi'
        }
    },
    components: { AlarmTable, EmptyPage }
}
</script>
<style lang="scss" scoped>
</style>


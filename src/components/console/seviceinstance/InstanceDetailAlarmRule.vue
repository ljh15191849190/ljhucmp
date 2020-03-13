<template lang="pug">
    div.full-container
        StrategyList(v-if="selectedInstanceInfo" :isBelongToEcsDetail="isBelongToEcsDetail" :instanceInfo="selectedInstanceInfo")
</template>
<script>
import StrategyList from '@/components/monitorAlarm/alarmStrategy/StrategyList'
import { mapGetters } from 'vuex'

export default {
    data () {
        return {
            // isBelongToEcsDetail: true
        }
    },
    computed: {
        ...mapGetters([
            'selectedInstanceInfo'
        ]),
        isBelongToEcsDetail () {
            if (this.selectedInstanceInfo.isBelongToEcs === 'notBelong') 
                return false
            else
                return true
        }
    },
    components: {
        StrategyList
    }
}
</script>
<style lang="scss" scoped>
</style>


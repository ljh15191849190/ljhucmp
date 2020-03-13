<template lang="pug">
    div.ecs-coreAttr-column
        div(v-if="Array.isArray(scope.row[column.prop])")
            p.array-column(v-for="(option, idx) in scope.row[column.prop]" :key="idx")
                span {{option}}
        div(v-else-if="(column.prop === 'group_ip')")
            p.array-column(v-for="(option, idx) in groupIpList(scope.row)")
                span.text-light-grey {{ option.label }}
                span {{option.value}}
        el-tag(
            :type="statusTypeObj[scope.row.status] ? statusTypeObj[scope.row.status].style : 'default'"
            size="mini"
            v-else-if="column.prop === 'status'") {{formatterStatus(scope.row.status)}}
        span(v-else-if="column.icon")
            span.ucmp-icon(v-if="scope.row[column.prop]" :class="scope.row[column.prop]")
            span(v-else) --
        span(v-else) {{scope.row[column.prop] ? scope.row[column.prop] : '--'}}
</template>
<script>
/**
 * @description ECS云主机核心属性简约版column格式化
 */
import { mapGetters } from 'vuex'
import {isIpv6} from '@mock/util.mock'
export default {
    name: 'EcsCoreAttrTableColumn',
    props: ['scope', 'column'],
    data () {
        return {}
    },
    methods: {
        formatterStatus (status) {
            return this.statusTypeObj[status].name || ''
        },
        groupIpList (rowObj) {
            let groupIpList = []
            this.groupIpAttrs.forEach(item => {
                let ipValues = rowObj[item.key]
                if (ipValues && Array.isArray(ipValues)) {
                    ipValues.forEach(ip => {
                        if (ip && !this.isIpv6(ip)) {
                            let groupIpItem = {label: item.table_column_group.group_column_label, value: ip}
                            groupIpList.push(groupIpItem)
                        }
                    })
                }
            })

            return groupIpList
        },
        isIpv6 (item) {
            return isIpv6(item)
        }
    },
    computed: {
        /**
         * @description 状态类型对象集合
         */
        statusTypeObj () {
            let statusItem = this.ecsAttributes.find(item => item.key === 'status')
            let rst = {}
            if (statusItem && statusItem.enum) {
                statusItem.enum.forEach(
                    status => {
                        rst[status.id] = status
                    }
                )
            }
            return rst
        },
        groupIpAttrs () {
            return this.ecsAttributes.filter(item => item.table_column_group && item.table_column_group.group_key === 'group_ip')
        },
        ecsAttributes () {
            return this.metadata.find(item => item.service_code === 'ecs').attribute
        },
        ...mapGetters([
            'metadata'
        ])
    }
}
</script>
<style lang="scss" scoped>

</style>

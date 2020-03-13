<template lang="pug">
    div.full-height
        UcmpTableContainer(
            :filterItems="filter"
            @sizeChange="handleSizeChange"
            @currentChange="handleCurrentChange"
        )
            div.full-height(slot="tableContainer")
                el-table.margin-top.panel-table-container(style="width: 100%" :data="tableData" highlight-current-row border)
                    el-table-column(:prop="column.prop" v-for="column in columns" :key="column.prop" :label="column.label")
                        template(slot-scope="scope")
                            span(v-if="column.prop === 'startup_time'") {{ formatterTime(scope.row[column.prop]) }}
                            span(v-else-if="column.prop === 'status'") {{ osstateObj[scope.row[column.prop]] }}
                            span(v-else) {{ scope.row[column.prop] }}
</template>
<script>
import Api from '@api'
import { mapGetters } from 'vuex'
import DateUtil from '@server/date-utils'

const CONFIG = {
    stopped: '已停止',
    running: '运行中'
}
export default {
    name: 'instanceDetailInstance',
    data () {
        return {
            pagination: {
                index: 1,
                size: 20,
                total: 0
            },
            osstateObj: CONFIG,
            filter: [],
            columns: [
                { prop: 'instance_name', label: '实例名称' },
                { prop: 'instance_role', label: '实例角色' },
                { prop: 'node', label: '节点' },
                { prop: 'startup_time', label: '启动时间' },
                { prop: 'status', label: '状态' },
                { prop: 'version', label: '版本' }
            ],
            tableData: []
        }
    },
    computed: {
        ...mapGetters([
            'checkedInstanceId'
        ])
    },
    methods: {
        formatterTime (time) {
            if (time) 
                return DateUtil.formate(new Date(time))
        },
        handleSizeChange (size) {
            this.pagination.size = size
            this.init()
        },
        handleCurrentChange (index) {
            this.pagination.index = index
            this.init()
        },
        init () {
            let params = {}
            params.oracleRacInstanceId = this.checkedInstanceId
            params.offset = this.pagination.index
            params.limit = this.pagination.size
            Api.get('oracleInstanceList', params, true).then(
                res => {
                    this.tableData = res.list
                }
            )
        }
    },
    created () {
        this.init()
    }

}
</script>
<style lang="scss" scoped>

</style>

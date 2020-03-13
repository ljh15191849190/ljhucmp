<template lang="pug">
    el-table(:data="ecsList" border)
        el-table-column(
            v-for="column in (columns[resourceType] || [])"
            :key="column.prop"
            :prop="column.prop"
            :label="column.label"
        )
</template>
<script>
import {mapGetters} from 'vuex'

const nasAutoColumns = [
    {label: '端口', prop: 'target_ssh_port'},
    {label: '主机密码', prop: 'root_passwd', password: true}
]
export default {
    props: ['ecsList', 'resourceType'],
    data () {
        return {}
    },
    computed: {
        columns () {
            let obj = {
                nas: [
                    {label: '云主机名称', prop: 'instance_name'},
                    {label: 'ID', prop: 'instance_id'},
                    {label: 'IP', prop: 'target_host'},
                    {label: '文件系统类型', prop: 'nas_fs_type'},
                    {label: '挂载路径', prop: 'target_path'}
                ],
                pool: [
                    {label: '云主机名称', prop: 'instance_name'},
                    {label: 'ID', prop: 'instance_id'},
                    {label: 'IP', prop: 'ip'},
                    {label: '端口', prop: 'port'},
                    {label: '主服务器', prop: 'major'}
                ]
            }

            if (this.nasAutoAttach) {
                // nas自动挂载
                obj.nas = obj.nas.concat(nasAutoColumns)
            }

            return obj
        },

        ...mapGetters([
            'nasAutoAttach'
        ])
    }
}
</script>

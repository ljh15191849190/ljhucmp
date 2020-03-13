<template lang="pug">
    el-dialog(:title="title" :visible.sync="visible" :before-close="closeDialog" width="800px")
        TableSelect(ref="ecsTable" :config="dialogConfig" :columns="dialogColumns" :isF5FormItem="isF5FormItem")
        div.dialog-footer(slot="footer")
            el-button(@click="closeDialog" size="small") 取消
            el-button(type="primary" @click="selectEcs" size="small") 保存
</template>
<script>
import TableSelect from '@/components/common/TableSelect'
export default {
    name: 'SelectEcsDialog',
    props: ['visible', 'selectedList', 'isF5FormItem'],
    $_veeValidate: {
        validator: 'new'
    },
    data () {
        return {
            title: '选择云主机',
            dialogColumns: [
                {label: '云主机名称', prop: 'instance_name'},
                {label: 'ID', prop: 'instance_id'},
                {label: '操作系统', prop: 'os_icon', icon: true},
                {label: 'IP地址', prop: 'ip', key: 'selectIp', isEdit: true, type: 'select'}
            ],
            dialogConfig: {
                search: true,
                searchKey: 'instance_name',
                searchPlaceholder: '请输入主机名',
                multiple: false, // 是否多选
                unique: 'instance_id',   // 能确定唯一数据的key
                api: '/f5/f5Pool/ecs/list',
                params: {},
                listRoot: 'list',
                pagination: true,
                frontPagination: false
            }
        }
    },
    methods: {
        closeDialog () {
            this.$emit('closeDialog')
        },
        selectEcs () {
            let selectedArray = this.$refs.ecsTable.getSelection()
            this.$validator.validate().then(result => {
                if (result) {
                    let selectEcsArr = [...this.selectedList, ...selectedArray]
                    this.$emit('selectEcs', selectEcsArr)
                }
            })
        }
    },
    components: {
        TableSelect
    }
}
</script>
<style lang="scss" scoped>

</style>

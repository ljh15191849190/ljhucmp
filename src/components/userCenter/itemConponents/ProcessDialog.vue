<template lang="pug">
    //- 流程跟踪弹窗
    el-dialog(title="流程跟踪" :visible.sync="dialogVisible" width="860px" v-if="dialogVisible")
        div
            ProcessImg(:processInstanceId="selectedRow.process_instance_id" :taskId="selectedRow.task_id")

            ProcessList(:processInstanceId="selectedRow.process_instance_id" :isApproving="selectedRow.status === 'approving'")
        div.text-center(slot="footer" class="dialog-footer")
            el-button(@click="dialogVisible = false") 关闭
</template>
<script>
import ProcessImg from './ProcessImg'
import ProcessList from './ProcessList'
export default {
    props: [ 'selectedRow' ],
    components: { ProcessImg, ProcessList },
    data () {
        return {
            dialogVisible: false
        }
    }
}
</script>

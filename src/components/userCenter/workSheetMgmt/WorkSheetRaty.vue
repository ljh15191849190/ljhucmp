<template lang="pug">
    el-dialog(:title="title" :visible.sync="visible" :before-close="handleClose" width="600px")
        Raty(title="服务态度" @selectedStar="selectedStar" prop="attitude")
        Raty(title="处理效率" @selectedStar="selectedStar" prop="efficiency")
        div.dialog-footer(slot="footer")
            el-button(size="small" @click="handleClose") 取消
            el-button(size="small" @click="save" type="primary") 保存
</template>

<script>
    import Raty from '@common/Raty'
    import Api from '@api'
    import {WS_ACTION} from '@/server/ConstParams'

    /**
     * 工单评价
     *
     * @description
     * @author jia lu
     */
    export default {
        name: 'WorkSheetRaty',
        components: {Raty},
        props: ['visible', 'ticketCode'],
        data () {
            return {
                evaluation: {
                    attitude: 0,
                    efficiency: 0
                }
            }
        },
        computed: {
            title () {
                return `工单${this.ticketCode}评价`
            }
        },
        methods: {
            handleClose () {
                this.$emit('update:visible', false)
            },
            selectedStar (prop, stars) {
                this.evaluation[prop] = stars
            },
            save () {
                if (this.evaluation.attitude === 0 || this.evaluation.efficiency === 0) {
                    this.$notify({
                        type: 'warning',
                        message: '关闭前请先对此次工单完成情况打分'
                    })
                } else {
                    let params = {
                        id: this.ticketCode,
                        action: WS_ACTION.CLOSE,
                        rating: JSON.stringify(this.evaluation)
                    }

                    Api.post('ticketAction', params, true).then(res => {
                        this.$notify.success(this.title + '操作成功!')
                        this.$emit('closed')
                        this.handleClose()
                    })
                }
            }
        }
    }
</script>

<style lang="scss" scoped>

</style>
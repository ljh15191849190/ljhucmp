<template lang="pug">
    CardItem(:title="titleLabel")
        div.full-container.d-flex(slot="chartCot")
            div.flex-grow-0.ws-item.bg-blue(@click="goApprove")
                div.ws-item__info
                    div.info-count {{todoCount}}
                    div.info-des 待我处理
                i.ws-item__bg.ucmp-icon-serlog-todo
            div.flex-grow-0.ws-item.bg-deep-green(@click="goApply")
                div.ws-item__info
                    div.info-count {{applyCount}}
                    div.info-des 我的申请
                i.ws-item__bg.ucmp-icon-serlog-apply-service
</template>

<script>
    import CardItem from '../CardItem'
    import Api from '@api'

    /**
     * @description
     * @author jia.lu
     */
    export default {
        name: 'WorkSheet_mine',
        components: {CardItem},
        data () {
            return {
                titleLabel: '我的工单',
                applyCount: 0,
                todoCount: 0
            }
        },
        computed: {},
        methods: {
            goApprove () {
                this.$router.push({
                    name: 'WorkSheetIndex',
                    params: {tab: 'WorkSheetPendingList', handleType: 'tohandle'}
                })
            },
            goApply () {
                this.$router.push({
                    name: 'WorkSheetIndex',
                    params: {tab: 'WorkSheetList', createdBy: localStorage.getItem('userId')}
                })
            },
            getStatics () {
                Api.get('ticketStaticCount', {}, true).then(res => {
                    this.applyCount = res.apply_count || 0
                    this.todoCount = res.todo_count || 0
                })
            }
        },
        created () {
            this.getStatics()
        }
    }
</script>

<style lang="scss" scoped>
    .ws-item {
        display: inline-block;
        width: 50%;
        margin: 20px 10px;
        color: white;
        position: relative;
        cursor: pointer;
    }

    .ws-item__info {
        position: absolute;
        left: 20px;
        top: 20px;
        .info-count {
            font-size: 36px;
        }

        .info-des {
            font-size: 16px;
        }
    }

    .ws-item__bg {
        position: absolute;
        right: 20px;
        bottom: 20px;
        font-size: 50px;
    }
</style>

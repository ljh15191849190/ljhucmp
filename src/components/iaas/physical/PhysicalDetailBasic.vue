<template lang="pug">
  div.overflow-y-auto.full-height
    div.row.font-detail.no-margin-left.no-margin-right
        div.col-md-6
            CardPanel(v-for="(leftCard, index) in leftCards" v-if="leftCard.content && leftCard.content.length" :key="index" :cardTitle="leftCard.title" :cardContent="leftCard.content")
        div.col-md-6.no-padding-left
            CardPanel(v-for="(rightCard, index) in rightCards" v-if="rightCard.content && rightCard.content.length" :key="index" :cardTitle="rightCard.title" :cardContent="rightCard.content")
</template>
<script>
import CardPanel from '@/components/common/CardPanel'
// import Physical from '@mock/subnet/physical.mock'
import Api from '@api'
import DateUtil from '@server/date-utils'
import { PowerStates, InstallStates } from '@server/ConstParams'
import { mapGetters } from 'vuex'

export default {
    name: 'PhysicalDetailBasic',
    data () {
        return {
            detailBasic: {},
            leftCards: [],
            rightCards: []
            // cards: {
            //     left: Physical.cards.left,
            //     right: Physical.cards.right
            // }
        }
    },

    methods: {
        init () {
            let resObj = {bareId: this.$route.params.id}
            Api.get('physic_getDetailPhy', resObj, false).then(
                res => {
                    this.detailBasic = res
                    this.getStatus()
                },
                () => {
                }
            )
        },
        formatterTime (time) {
            if (time) 
                return DateUtil.formate(new Date(time))
        },
        getStatus () {
            this.leftCards = [{
                title: '基础信息',
                content: [{
                        'key': 'physical_name',
                        'name': '物理机名称',
                        'label': this.detailBasic.name,
                        'link': ''
                    },
                    {
                        'key': 'status',
                        'name': '操作系统',
                        'label': this.detailBasic.system_name
                    },
                    {
                        'key': 'size',
                        'name': '操作系统IP',
                        'label': this.detailBasic.ip
                    }, {
                        'key': 'physical_name',
                        'name': '电源状态',
                        'label': PowerStates[this.detailBasic.power],
                        'link': ''
                    },
                    {
                        'key': 'status',
                        'name': '状态',
                        'label': InstallStates[this.detailBasic.os_status]
                    },
                    {
                        'key': 'size',
                        'name': '创建时间',
                        'label': this.formatterTime(this.detailBasic.created_at)
                    }, {
                        'key': 'physical_name',
                        'name': '物理机类型',
                        'label': this.typeObj[this.detailBasic.type],
                        'link': ''
                    }]
            }, {
                title: '带外信息',
                content: [{
                        'key': 'physical_name',
                        'name': '电源IP地址',
                        'label': this.detailBasic.oob ? this.detailBasic.oob.oob_ip : '',
                        'link': ''
                    },
                    {
                        'key': 'status',
                        'name': '带外版本',
                        'label': this.detailBasic.oob ? this.detailBasic.oob.oob_version : ''
                    },
                    {
                        'key': 'size',
                        'name': '用户名',
                        'label': this.detailBasic.oob ? this.detailBasic.oob.oob_name : ''
                    }]
            }]
            this.rightCards = [{
                title: '硬件信息',
                content: [{
                        'key': 'physical_name',
                        'name': 'SN',
                        'label': this.detailBasic.sn,
                        'link': ''
                    },
                    {
                        'key': 'status',
                        'name': '制造商',
                        'label': this.detailBasic.company
                    },
                    {
                        'key': 'size',
                        'name': '产品型号',
                        'label': this.detailBasic.model
                    }, {
                        'key': 'cup_type',
                        'name': '处理器型号',
                        'label': this.detailBasic.cpu_type,
                        'link': ''
                    },
                    {
                        'key': 'status',
                        'name': '网卡信息',
                        'isTable': true,
                        'columns': [
                            {
                                prop: 'Name',
                                label: '名称'
                            },
                            {
                                prop: 'Mac',
                                label: 'Mac地址'
                            },
                            {
                                prop: 'Ip',
                                label: 'IP'
                            }],
                        'label': this.detailBasic.nic
                    },
                    {
                        'key': 'size',
                        'name': '网络硬件信息',
                        'isHtml': true,
                        'label': this.detailBasic.nic_device
                    }, {
                        'key': 'physical_name',
                        'name': 'CPU（核）',
                        'label': this.detailBasic.cpu_sum,
                        'link': ''
                    },
                    {
                        'key': 'memory_sum',
                        'name': '内存（MB）',
                        'label': this.detailBasic.memory_sum
                    },
                    {
                        'key': 'disc_sum',
                        'name': '磁盘（GB）',
                        'label': this.detailBasic.disc_sum
                    }]
            }]
        }
    },

    computed: {
        ...mapGetters([
            'selectedInstancephyInfo'
        ]),
        typeObj () {
            const configIcon = {
                metal: '裸物理机',
                virtual: '虚拟服务器'
          }
            return configIcon
        }
    },
    watch: {
        selectedInstancephyInfo (val) {
            this.init()
        }
    },

    components: {
        CardPanel
    },

    created () {
        // 初始化
        this.init()
    }
}
</script>
<style lang="scss" scoped>

</style>

<template lang="pug">
    div.sub-resource
        el-card(header="关联资源")
            ul.reset
                li(v-for="item in innerResource")
                    div.d-flex.align-item-center.justify-content-between
                        el-checkbox(v-model="item.checked") {{getName(item.service_code, item.name)}}
                        span 过期时间: {{item.expired_at | time}}
                        ExpiredAtWidget(:value.sync="item.date" :start="item.expired_at")
                    RenewalGroup(v-if="item.sub_resource" :resource="item.sub_resource")
</template>

<script>
    /**
     * @description
     * @author jia.lu
     */
    import DateUtil from '@server/date-utils'
    import {mapGetters} from 'vuex'
    import ExpiredAtWidget from '@/components/common/dynamicForm/ExpiredAtWidget'

    export default {
        name: 'RenewalGroup',
        props: ['resource'],
        data () {
            return {
                group: [],
                c: '',
                innerResource: []
            }
        },
        computed: {
            ...mapGetters([
                'tenancy',
                'metadata'
            ])
        },
        filters: {
            time: (value) => {
                return value ? DateUtil.formate(new Date(value)) : ''
            }
        },
        created () {
            this.innerResource = this.resource
        },
        methods: {
            /**
             * @description 返回名称
             */
            getName (service_code, name) {
                let metaItem = this.metadata.find(item => item.service_code === service_code)
                return metaItem ? `${metaItem.name}(${name})` : name
            }
        },
        components: {
            ExpiredAtWidget
        }
    }
</script>

<style lang="scss" scoped>
    .sub-resource {
        margin: 12px 0;
        ul.reset {
            padding: 0;
            margin: 0;
        }

        li {
            margin-bottom: 12px
        }

        .el-checkbox {
            min-width: 120px;
            /* UCMP3-6421 .el-checkbox:last-of-type（2.11）引起，生产环境的element高于本地2.9.2 */
            margin-right: 30px;
        }
    }
</style>
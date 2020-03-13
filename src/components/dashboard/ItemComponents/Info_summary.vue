<template lang="pug">
    CardItem(:title="titleLabel")
        div.full-container(slot="chartCot")
            div.quarter
                span.quarter__icon.el-icon-bank-card.theme-color
                div.quarter__info.margin-left
                    span 许可证
                    br
                    span {{info.license}}
            div.quarter.cursor-pointer(@click="goControlPage('xen_app')")
                i.quarter__icon.ucmp-icon-service-virtual_app.theme-color
                div.quarter__info.margin-left
                    span 云应用
                    br
                    span {{info.xen_app}}
            div.quarter.cursor-pointer(@click="goControlPage('baremetal')")
                i.quarter__icon.ucmp-icon-service-physical_machine.theme-color
                div.quarter__info.margin-left
                    span 物理机
                    br
                    span {{info.baremetal}}
            div.quarter.cursor-pointer(@click="goControlPage('xen_desktop')")
                i.quarter__icon.ucmp-icon-service-virtual_desktop.theme-color
                div.quarter__info.margin-left
                    span 云桌面
                    br
                    span {{info.xen_desktop}}
</template>

<script>
    import CardItem from '../CardItem'
    import Api from '@api'

    /**
     * 信息统计
     *
     * @description
     * @author jia.lu
     */
    export default {
        name: 'Info_summary',
        components: {CardItem},
        data () {
            return {
                code: 'resource_count',
                titleLabel: '信息统计',
                info: {
                    license: 0,
                    xen_app: 0,
                    baremetal: 0,
                    xen_desktop: 0
                },
                resourceList: ['xen_app', 'xen_desktop', 'baremetal']
            }
        },
        computed: {},
        methods: {
            getInfo () {
                this.resourceList.forEach(service_code => {
                    Api.get('resource_count', {service_code}, true).then(res => {
                        this.info[service_code] = res.count || 0
                    })
                })
            },

            getLicenseCount () {
                Api.get('license_count_all', {}, true).then(res => {
                    let total = 0
                    res.data.provider_licenses && res.data.provider_licenses.forEach(item => {
                        item.licenses.forEach(licenseData => {
                            total += licenseData.count || 0
                        })
                    })

                    this.info.license = total
                })
            },

            goControlPage (code) {
                this.$router.push('/serviceInstance/' + code)
            }
        },
        created () {
            this.getInfo()
            this.getLicenseCount()
        }
    }
</script>

<style lang="scss" scoped>
    .quarter {
        width: 50%;
        height: 50%;
        display: inline-block;
        padding: 12px 12px 12px 60px;
        overflow: hidden;
    }

    .quarter__icon {
        font-size: 48px;
        line-height: 1;
    }

    .quarter__info {
        display: inline-block;
        font-size: 16px;
        font-weight: bold;
    }

    .cursor-pointer {
        cursor: pointer;
    }
</style>

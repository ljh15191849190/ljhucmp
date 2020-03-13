<template lang="pug">
    div.resource-group-container
        p.group-name.config-form-title {{ groupName }}
        el-row(:gutter="10")
            el-col.group-row-col.padding-row(:xs="24" :sm="12" :md="8" :lg="8" :xl="6" v-for="displayItem in displayList" :key="displayItem.key")
                span.col-name {{displayItem.label}}：
                span.col-value(v-if="displayItem.password") 
                    PassWordPanel(:displayItem="displayItem")
                span.col-value(v-else-if="displayItem.key==='dst_add_address'||displayItem.key==='src_add_address'||displayItem.key==='source_ip_group'||displayItem.key==='target_ip_group'") {{ReplaceValue(displayItem.value)}}
                span.col-value(v-else) {{Array.isArray(displayItem.value) ? displayItem.value.join(',') : displayItem.value}}
                el-tooltip(v-else :content="Array.isArray(displayItem.value) ? displayItem.value.join(',') : displayItem.value" placement="bottom-start" effect="light")
                    span.col-value {{Array.isArray(displayItem.value) ? displayItem.value.join(',') : displayItem.value}} 
        slot(name="ecsList")
</template>

<script>
import PassWordPanel from '@/components/common/PassWordPanel'
export default {
    props: {
        groupName: {
            type: String,
            default: ''
        },
        groupId: {
            type: String,
            default: ''
        },
        displayList: {
            type: Array,
            default: () => []
        }
    },
    components: {PassWordPanel},
    data () {
        return {

        }
    },
    methods: {
        ReplaceValue (value) {
            if (value && value.length > 0) {
                let S = []
                value.forEach(item => {
                    if (item.ip)
                        S.push(item.name + ':' + item.ip)
                    else if (item.source_ip_addr)
                        S.push(item.source_ip_addr_name + ':' + item.source_ip_addr)
                    else if (item.target_ip_addr)
                        S.push(item.target_ip_addr_name + ':' + item.target_ip_addr)
                    else    
                        S.push('--')
                })
                return S.toString()
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.group-name {
    margin-bottom: 0;
    color: $fontContentGray;
    font-weight: bold;
    font-size: 12px;
}
.group-row-col {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.col-name {
    display: inline-block;
    width: 120px;
    text-align: left;
}
.col-value {
    width: calc(100% - 120px);
}
</style>

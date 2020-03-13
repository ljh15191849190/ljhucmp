<template lang="pug">
    div.text-formItem-container
        span.text-formItem-item(v-for="item in textList" :key="item.key")
            span.name {{item.name}}:
            span.value {{item.value}}

</template>

<script>

export default {
    props: {
        value: {
            type: Object,
            default: () => {}
        },
        display: {
            type: String,
            default: () => ''
        },
        formData: {
            type: Object,
            default: function () {
                return {
                }
            }
        },
        formItem: {
            type: Object,
            default: function () {
                return {}
            }
        },
        uniqueKey: {
            type: String,
            default: function () {
                return 'key'
            }
        },
        formId: {
            type: String,
            default: ''
        }
    },
    data () {
        return {
        
        }
    },
    computed: {
        textList () {
            let dependenciesObj = {}, textList = []
            this.formItem.dependencies.forEach(item => {
                let dependKey = item, formData = this.formData ? JSON.parse(JSON.stringify(this.formData)) : {}
                    if (item.indexOf('@') > -1 && !([0, item.length - 1].includes(item.indexOf('@'))))
                        dependKey = item.split('@')[1]
                
                dependenciesObj = {...dependenciesObj, ...formData[dependKey]}
            })

            this.formItem.attribute.forEach(attr => {
                let itemObj = {key: attr.key, name: attr.name, value: ''}
                let value = dependenciesObj[attr.key]
                if (Array.isArray(value)) 
                    itemObj.value = value.join('、') ? value.join('、') : '--'
                else 
                    itemObj.value = value ? value : '--'
                
                textList.push(itemObj)
            })

            // 更新display和value
            let display = '', formdata = {}
            textList.forEach(item => {
                let value = item.value === '--' ? '' : item.value
                formdata[item.key] = value
                display = display + item.name + ':' + item.value + 
                ' '
            })

            this.$emit('update:display', display)
            this.$emit('update:value', formdata)

            return textList
        }
    }
}
</script>
<style lang="scss" scoped>
.text-formItem-item {
    padding-right: 30px;
    .name {
        color: $fontTitleLight;
    }
    .value {
        padding-left: 5px;
        color: $fontContent;
    }
}
</style>

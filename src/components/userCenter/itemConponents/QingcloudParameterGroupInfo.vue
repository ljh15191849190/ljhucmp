<template lang="pug">
    div.el-form-item.margin-bottom.el-form-item--small(v-if="checkedParameterGroupName")
        label.el-form-item__label.qingcloud_parameger_label 匹配的配置组
        div.el-form-item__content {{ checkedParameterGroupName }}
</template>

<script>
/**
 * @description 审批环节修改青云rdb\cache，显示配置组的匹配信息
 */
export default {
    props: {
        item: {
            type: Object,
            default: () => {
                return {}
            }
        }
    },

    data () {
        return {

        }
    },

    computed: {
        /**
         * @description 配置组的attribute key
         */
        parameterKey () {
            return this.item.service_code === 'qingcloud_rdb' ? 'rdb_parameter_group' : 'cache_parameter_group'
        },

        /**
         * @description 配置组的attribute 对象
         */
        parameterItem () {
            return this.item.formItems.filter(
                formItem => {
                    if (formItem.key === this.parameterKey)
                        return formItem
                }
            )[0]
        },

        /**
         * @description 数据库/缓存版本的key
         */
        version () {
            let uuid = ''
            if (this.item.service_code === 'qingcloud_rdb') {
                // 版本是否可以被编辑
                Object.keys(this.item.attributes).forEach(
                    itemKey => {
                        let checkedKey = itemKey.split('@')[1]
                        if (checkedKey && (checkedKey === 'rdb_engine' || checkedKey === 'engine_version'))
                            uuid = itemKey.split('@')[0]
                    }
                )
                if (uuid)
                    return this.item.attributes[uuid + '@rdb_engine'] + this.item.attributes[uuid + '@engine_version']
                return this.item.attributes.rdb_engine + this.item.attributes.engine_version
            } else {
                // 版本是否可以被编辑
                Object.keys(this.item.attributes).forEach(
                    itemKey => {
                        let checkedKey = itemKey.split('@')[1]
                        if (checkedKey && checkedKey === 'cache_type')
                            uuid = itemKey.split('@')[0]
                    }
                )
                if (uuid)
                    return this.item.attributes[uuid + '@cache_type'] 
                return this.item.attributes.cache_type
            }
        },

        /**
         * @description 配置组列表数据中的数据库、缓存关于版本信息的key
         */
        family () {
            return this.item.service_code === 'qingcloud_rdb' ? 'family' : 'cache_type'
        },

        textField () {
            return this.item.service_code === 'qingcloud_rdb' ? 'parameter_group_name' : 'cache_parameter_group_name'
        },

        valueField () {
            return this.item.service_code === 'qingcloud_rdb' ? 'parameter_group_id' : 'cache_parameter_group_id'
        },

        /**
         * @description 表单中配置组的值集合
         */
        parameterValues () {
            let parameterValue = []
            let hasParameterForm = false
            if (this.parameterItem && this.$parent.$parent.$refs.proverderform[0].$refs[this.parameterItem.id]) {
                // 找到基础配置的配置组值
                Object.keys(this.item.attributes).forEach(
                    itemKey => {
                        let checkedKey = itemKey.split('@')[1]
                        if (checkedKey && checkedKey === this.parameterKey) {
                            hasParameterForm = true
                            parameterValue = this.item.attributes[itemKey]
                        }
                    }

                )
                // 如果当前审批环节不能修改配置组
                if (!hasParameterForm)
                   parameterValue = this.item.attributes.provider_conf[this.parameterKey]
            }
            return parameterValue
        },

        /**
         * @description 配置组的列表数据
         */
        list () {
            if (this.parameterItem && this.$parent.$parent.$refs.proverderform[0].$refs[this.parameterItem.id])
                return this.$parent.$parent.$refs.proverderform[0].$refs[this.parameterItem.id][0].list
            return []
        },

        allParameterGroupIds () {
            return this.list.map(
                group_item => {
                    return group_item[this.valueField]
                }
            )
        },

        /**
         * @description 根据数据库或者缓存版本匹配的配置组名称
         */
        checkedParameterGroupName () {
            for (let value_index = 0; value_index < this.parameterValues.length; value_index++) {
                // let group_item = allGroupIds[value_index]
                let index = this.allParameterGroupIds.indexOf(this.parameterValues[value_index])
                if (index !== -1 && this.list[index][this.family] === this.version)
                    return this.list[index][this.textField] + '(' + this.version + ')'
            }
            // 默认输出为空
            return ''
        }
    }
}
</script>

<style lang="scss" scoped>
.qingcloud_parameger_label {
    width: 120px;
    & + div {
        margin-left: 120px;
    }
}
</style>

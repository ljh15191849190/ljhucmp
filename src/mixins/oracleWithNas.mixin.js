/**
 * oracle 关联 nas 时自动计算其最小值
 *
 * @author jia.lu
 */
export default {
    data () {
        return {
            nasValid: []
        }
    },
    computed: {
        ecsLinkedNas () {
            const linkedArray = this.defaultLinks.filter(link => {
                // 获取所有关联的ecs 和 nas
                return link.type === 'shared'
            })

            return linkedArray.map(link => {
                // UCMP-bug3.1-14 申请带Nas的Oracle目录时，NAS的大小需要根据Oracle的归档目录、数据文件的大小进行计算
                // 接口返回时link.source是id，d3初始化为Node节点，内有id
                const sourceId = link.source.id || link.source
                const targetId = link.target.id || link.target

                // 初始化脚本数组，可能存在多个oracle的配置脚本，取第一个
                let sourceScriptArray = this.configs[sourceId].formData[sourceId + '@init_script']

                // 暂时使用SYSTEM表空间大小存在来确认 是否初始化了oracle（存疑）
                let firstEcsScript = sourceScriptArray.find(item => item.params && item.params.SYSTEM) || {}

                let ecs = JSON.parse(JSON.stringify(firstEcsScript))
                let nas = JSON.parse(JSON.stringify(this.configs[targetId]))

                // ecs 副本 ==》watch， nas 地址
                return {ecs, nas, targetId}
            })
        }
    },
    watch: {
        ecsLinkedNas: {
            handler (newValue, oldValue) {
                for (let i = 0; i < newValue.length; i++) {
                    // 比对是哪一对更改
                    if (!oldValue[i] || JSON.stringify(oldValue[i]) !== JSON.stringify(newValue[i])) {
                        //
                        const min = this.computeNasVolumn(newValue[i])
                        // 保留一份所有 需验证nas最小值的数据，供修改的时候检索出对应的最小值

                        //UCMP3-610【Oracle-nas】编辑修改Oracle+nas的应用编排，修改Oracle初始化脚本中的表空间大小，查看nas的总大小校验仍是之前的，未重新计算
                        //问题原因：每次重新计算新的值都作为一项存入数组中,有重复的id存在, 且取的是这些中最小的
                        //解决方法：数组去重，相同id作替换
                        let index = this.nasValid.findIndex(item => item.id === newValue[i].targetId)
                        if (index > -1)
                            this.nasValid[index].min = min
                        else
                            this.nasValid.push({id: newValue[i].targetId, min})
                    }
                }
            },
            deep: true
        }
    },
    methods: {
        computeNasVolumn (newValue) {
            // sum(应用表大小 + system + sysaux + temp + undo + 1024) / 0.6 M, 向上取整（10的倍数), 没有redo
            const params = newValue.ecs.params

            // UCMP3-803 【蓝图编排】在蓝图处申请nas的时候，提示最小大小为10G，这个逻辑不对，如果单独申请nas的话，只要不小于20M就可以申请了
            // 在不存在oracle的时候，定义此处为最小的20M
            // nas是否用于oracle根据nas的最后一级挂载点和oracle脚本中的两个地址匹配来判断，否则不设置最小值
            const nasData = newValue.nas.formData
            const nasAttachPath = `/${nasData[newValue.targetId + '@volume_set'] || ''}`
            if (!params || (params.STORAGEPATH !== nasAttachPath && params.ARCHPATCH !== nasAttachPath)) return {size: 20, unit: 'MB'}

            // 应用表大小
            let appArray = []
            if (params.tablespace && Array.isArray(params.tablespace))
                appArray = params.tablespace
            if (params.tablespace && !Array.isArray(params.tablespace))
                appArray = JSON.parse(params.tablespace)
            let appSize = appArray.reduce((total, cur) => {
                // UCMP3-829【应用编排】oracle-nas的应用编排部署页面，网页卡死了
                // params.tablespace 没有返回对应的APP_SIZE，返回了空导致这里计算为NaN，在vee的验证中造成卡死
                return total + (cur.APP_SIZE || 0)
            }, 0)

            let count = (appSize + (params.SYSTEM || 0) + (params.SYSAUX || 0) + (params.TEMP || 0) +
                (params.UNDO || 0) + 1024) / 0.6
            count = count / 1024 // GB
            count = Math.ceil(count / 10) * 10 // 向上取整（10的倍数）

            // 对应nas赋值
            // newValue.nas.formData[newValue.targetId + '@size'] = count
            // newValue.nas.formData[newValue.targetId + '@size_unit'] = 'gb'

            // newValue.nas.display[newValue.targetId + '@size'] = count
            // newValue.nas.display[newValue.targetId + '@size_unit'] = 'GB'

            return {size: count, unit: 'GB'}
        }
    }
}

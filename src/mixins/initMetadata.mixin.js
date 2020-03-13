import { mapActions } from 'vuex'
import Api from '@api'

export const initMetadataByMethod = {
    methods: {
        updateaAllMetadatas (callback) {
            // 获取 metadata列表信息
            let basicPromise = Api.get('getBasicMetadata', {}, true)
            let blueprintPromise = Api.get('getBlueorintDetail', {}, true)
            Promise.all([basicPromise, blueprintPromise]).then(
                ([metas, blueprints]) => {
                    let allMetadatas = metas.map(meta => meta.metadata).concat(blueprints.map(meta => {
                        return {
                            name: meta.blueprintName,
                            service_code: meta.serviceCode,
                            group: 'blueprint'
                        }
                    }))
                    this.setMetaData([])
                    this.$nextTick(() => {
                        this.setMetaData(allMetadatas)
                        callback && callback()
                    })
                }
            )
        },
        ...mapActions([
            'setMetaData'
        ])
    }
}

export const initMetadataBeforeRouteEnter = {
    beforeRouteEnter (from, to, next) {
        let basicPromise = Api.get('getBasicMetadata', {}, true)
            let blueprintPromise = Api.get('getBlueorintDetail', {}, true)
            Promise.all([basicPromise, blueprintPromise]).then(
                ([metas, blueprints]) => {
                    let allMetadatas = metas.map(meta => meta.metadata).concat(blueprints.map(meta => {
                        return {
                            name: meta.blueprintName,
                            service_code: meta.serviceCode,
                            group: 'blueprint'
                        }
                    }))
                    next(vm => {
                        vm.setMetaData([])
                        vm.setMetaData(allMetadatas)
                    })
                }
            )
    },

    methods: {
        ...mapActions([
            'setMetaData'
        ])
    }
}

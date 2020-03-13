import { mapActions } from 'vuex'
export default {
    methods: {
        ...mapActions([
            'setGroupActions',
            'setCheckedProviderId',
            'setInstanceConfig',
            'setCheckedMetadata',
            'setCheckedInstanceId'
        ])
    },
    created () {
        let instanceConfig = sessionStorage.getItem('instanceConfig')
        let checkedMetadata = sessionStorage.getItem('checkedMetadata')
        let allActions = sessionStorage.getItem('instanceActions')
        if (allActions)
            this.setGroupActions(JSON.parse(allActions))
        if (instanceConfig)
            this.setInstanceConfig(JSON.parse(instanceConfig))
        if (checkedMetadata)
            this.setCheckedMetadata(JSON.parse(checkedMetadata))
    }
}

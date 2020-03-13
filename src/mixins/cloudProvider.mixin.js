import { mapGetters, mapActions } from 'vuex'

export default {
    methods: {
        ...mapActions([
            'setCloudProvider'
        ])
    },
    computed: {
        ...mapGetters([
            'cloudProvider'
        ])
    }
}

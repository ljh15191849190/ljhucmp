import { mapGetters, mapActions } from 'vuex'

export default {
    methods: {
        ...mapActions([
            'setEscFormStep'
        ])
    },
    computed: {
        ...mapGetters([
            'escFormStep'
        ])
    }
}

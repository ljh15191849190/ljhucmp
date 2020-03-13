import Api from '@api'

export default {
    data () {
        return {
            blueprintGroup: []
        }
    },

    methods: {
        getBlueprintGroups () {
            return Api.get('blueprintGroups', { limit: 9999, offset: 0 }, true).then(
                res => {
                    this.blueprintGroup = res.list.map(
                        group => {
                            let rst = {}
                            rst.group_id = group.id
                            rst.group_name = group.name
                            if (group.config)
                                rst.styles = group.config.styles
                            return rst
                        }
                    )
                }
            )
        }
    },

    computed: {
        defaultGroups () {
            let rst = {}
            this.blueprintGroup.forEach(
                group => {
                    rst[group.group_id] = {
                        group_name: group.group_name,
                        styles: group.styles
                    }
                }
            )
            return rst
        }
    }
}

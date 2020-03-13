import OrchestrateDiagram from '@/components/orchestration/diagram/OrchestrateDiagram'
import { mapActions, mapGetters } from 'vuex'
import GetBlueprintGroups from '@mixins/getBlueprintGroups.mixin'

export default {
    mixins: [GetBlueprintGroups],
    data () {
        return {
            checkedNode: {},
            showConfig: false,
            linkConfigs: {},
            rootId: '',
            editDisabled: true,
            checkedMetadata: {},
            operations: [
                { type: 'center', icon: 'center-canvas', title: '画布居中' }
            ],
            diagramInstance: null,
            viewportDom: null,
            loading: true
        }
    },

    methods: {
        canNestNodeRule () {
            return false
        },

        ...mapActions([
            'setCheckedInstanceId'
        ]),

        handleOper (type) {
            if (type === 'center')
                this.centerCanvas()
        },

        centerCanvas (callback) {
            let bbox = this.viewportDom.getBBox()
            if (bbox.width && bbox.height)
                this.diagramInstance.zoomExtent(callback)
        },

        getDiagramObj (vm) {
            this.diagramInstance = vm
            this.$emit('getDiagramObj', vm)
        },

        getViewportDom (dom) {
            this.viewportDom = dom
        }
    },
    computed: {
        ...mapGetters([
            'metadata'
        ])
    },

    watch: {
        defaultResources () {
            // 初始化数据完成后自动选中第一个节点资源
            if (this.defaultResources && this.defaultResources.length) {
                // 自动居中处理画布 【画布viewport 尺寸不为 0，即视为节点绘制结束，此时可以定位画布】
                if (this.viewportDom) {
                    let interval = setInterval(() => {
                        let bbox = this.viewportDom.getBBox()
                        if (bbox.width && bbox.height) {
                            let clearLoading = () => {
                                this.loading = false
                            }
                            this.centerCanvas(clearLoading)
                            clearInterval(interval)
                        }
                    }, 100)
                }
            }
        }
    },

    components: {
        OrchestrateDiagram
    }
}

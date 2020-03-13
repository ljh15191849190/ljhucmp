import Api from '@api'
import ColumnFilter from '@/components/common/ColumnFilter'

export default {
    data () {
        return {
            currentFilter: null,
            currentFilterItem: null,
            showFilter: {},
            filterActived: {}
        }
    },

    methods: {
        headerClick (col, event) {
            this.showFilter[col.property] = true
            let getRootNode = function (node, rootClassName) {
                if (!node) {
                    // 节点不存在或追溯到了根节点
                    return null
                } else if (node.className && node.className.split(/\s+/).indexOf(rootClassName) > -1) {
                    // 找到此节点
                    return node
                } else {
                    // 向上追溯
                    return getRootNode(node.parentNode, rootClassName)
                }
            }

            let getFilterDataOptions = function (filterItem) {
                if (filterItem.query_condition.data_link && filterItem.query_condition.data_link.endpoint) {
                    let params = {}
                    if (filterItem.query_condition.data_link && filterItem.query_condition.data_link.params)
                        params = { ...params, ...filterItem.query_condition.data_link.params }

                    Api.get(filterItem.query_condition.data_link.endpoint, params, true).then(
                        res => {
                            this.$set(filterItem, 'options', (filterItem.query_condition.data_link.result ? res[filterItem.query_condition.data_link.result] : res))
                        }
                    ).catch(() => {
                    })
                } else if (filterItem.query_condition.defaultOptions || filterItem.query_condition.default_options || filterItem.query_condition.enum) {
                    //
                    filterItem.options = filterItem.query_condition.defaultOptions || filterItem.query_condition.default_options || filterItem.query_condition.enum
                } else {
                    //
                    filterItem.options = filterItem.defaultOptions || filterItem.default_options || filterItem.enum || []
                }
            }

            this.currentFilter = col.property

            this.currentFilterItem = this.filterItems.filter(item => item.query_condition && item.query_condition.table_head).find(item => item.key === this.currentFilter)

            // eslint-disable-next-line
            if (!!this.currentFilterItem) {
                // eslint-disable-next-line
                (this.currentFilterItem.type === 'select' || this.currentFilterItem.type === 'selectObj' || this.currentFilterItem.query_condition.fe_type && this.currentFilterItem.query_condition.fe_type.type === 'select') && getFilterDataOptions(this.currentFilterItem)
                this.$nextTick(() => {
                    // 固定显示在head的下方而不是根据点击位置来显示
                    let th = getRootNode(event.target, 'is-leaf')
                    let thPosition = th
                        ? th.getBoundingClientRect()
                        : {bottom: event.clientY, left: event.clientX} // 防止节点未找到

                    let thFilter = document.querySelector('.th-filter')
                    thFilter.style.top = thPosition.bottom + 'px'

                    // 过滤器（position:absolute）的父元素为右侧的container-right-part的div，所以需要减去margin-left才能对齐位置
                    let fatherLeft = window.getComputedStyle(document.querySelector('.container-right-part')).marginLeft.replace('px', '')
                    thFilter.style.left = thPosition.left - parseFloat(fatherLeft) + 'px'
                })
            }
        }
    },

    components: {
        ColumnFilter
    }
}

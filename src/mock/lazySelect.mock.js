export default class SelectHelper {
    constructor (size = 20) {
        this.pageIndexForAll = 1
        this.pageIndexForSearch = 1
        this.pageCountForAll = 1
        this.pageCountForSearch = 1
        this.size = size // 不能小于8 会高度不够无法滚动加载loadmore
        this.allDataCache = []
        this.query = ''
    }
}

import { Loading, Notification } from 'element-ui'
class Utils {
    /**
     * 遍历树得到选中key值
     * @param {*数据} data
     * @param {*选中属性名} isCheck
     * @param {*key} resourceId
     * @param {*子节点属性名} children
     * @param {*保存到哪里} keys
     */
    traverseTree (data, isCheck, resourceId, children, keys) {
        for (let i = 0; i < data.length; i++) {
            if (data[i][isCheck]) keys.push(data[i][resourceId])
            if (data[i].children.length) {
                this.traverseTree(
                    data[i][children],
                    isCheck,
                    resourceId,
                    children,
                    keys
                )
            }
        }
    }

    /**
     * Object类型的层次数据转化为数组类型的层次数据
     * @param {*} data Object类型的层次数据
     * @param {*} childrenName children的名称
     * @param {*} idName id名称
     * @param {*} pIdName parentId名称
     * @param {*} rst 数组类型的层次数据(结果)
     */
    transformTreeToArr (data, childrenName, idName, pIdName, rst) {
        if (data[childrenName]) {
            for (let _key in data[childrenName]) {
                let item = JSON.parse(JSON.stringify(data[childrenName][_key]))
                item[idName] = _key
                item[pIdName] = data[idName]

                delete item[childrenName]
                rst.push(item)
                if (data[childrenName][_key][childrenName] && JSON.parse(JSON.stringify(data[childrenName][_key][childrenName])) !== '{}')
                    this.transformTreeToArr(data[childrenName][_key], childrenName, idName, pIdName, rst)
            }
        }
    }

    transformToTreeData (data, idName, pIdName, childrenName, pId) {
        let result = []
        let temp = []
        // 深拷贝数组对象
        for (let i = 0; i < data.length; i++) {
            if (data[i][pIdName] === pId) {
                let node = data[i]
                let tempArr = JSON.parse(JSON.stringify(data))
                tempArr.splice(i, 1)
                temp = this.transformToTreeData(
                    tempArr,
                    idName,
                    pIdName,
                    childrenName,
                    data[i][idName]
                )
                if (temp.length) node[childrenName] = temp
                result.push(node)
            }
        }
        return result
    }

    transformTreeMapData (data, idName, pIdName, childrenName, pId) {
        let result = {}
        let temp = []
        // 深拷贝数组对象
        for (let i = 0; i < data.length; i++) {
            if (data[i][pIdName] === pId) {
                let node = data[i]
                let tempArr = JSON.parse(JSON.stringify(data))
                tempArr.splice(i, 1)
                temp = this.transformTreeMapData(
                    tempArr,
                    idName,
                    pIdName,
                    childrenName,
                    data[i][idName]
                )
                if (JSON.stringify(temp) !== '{}')
                    node[childrenName] = temp
                result[data[i][idName]] = node
            }
        }
        return result
    }

    getAncestorIds (
        dataSource,
        targetId,
        id = 'id',
        parentId = 'parentId',
        children = 'children',
        root = 'root'
    ) {
        let tempData = JSON.parse(JSON.stringify(dataSource))
        let result = []
        let temp = []
        for (let i = 0; i < tempData.length; i++) {
            if (tempData[i][id] === targetId) {
                if (tempData[i][parentId]) result.push(tempData[i][parentId])
                if (tempData[i][parentId] !== root) {
                    let copiedData = JSON.parse(JSON.stringify(tempData))
                    copiedData.splice(i, 1)
                    temp = this.getAncestorIds(
                        copiedData,
                        tempData[i][parentId],
                        id,
                        parentId,
                        children,
                        root
                    )
                    if (temp.length) result = result.concat(temp)
                }
                break
            }
        }
        return result
    }

    uuid () {
        function s4 () {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1)
        }
        return (
            s4() +
            s4() +
            '-' +
            s4() +
            '-' +
            s4() +
            '-' +
            s4() +
            '-' +
            s4() +
            s4() +
            s4()
        )
    }
    filterType (type, hasSpec) {
        switch (type) {
            case 'cpu':
                return hasSpec ? 'CPU(GHZ)' : 'CPU'
            case 'memory':
                return hasSpec ? '内存(GB)' : '内存'
            case 'disk':
                return hasSpec ? '存储(GB)' : '存储'
            default:
                break
        }
    }

    flatten (_array) {
        let tempArr = JSON.parse(JSON.stringify(_array))
        let result = []
        tempArr.forEach(
            item => {
                if (Array.isArray(item)) {
                    item.forEach(
                        childItem => {
                            result.push(childItem)
                        }
                    )
                    return
                }
                result.push(item)
            }
        )
        return result
    }

    loading () {
        let loadingInstance = Loading.service({
            lock: true,
            spinner: 'ucmp-icon-loading'
        })

        return loadingInstance
    }

    getArrDifference (arr1, arr2) {
        return arr1.concat(arr2).filter((v, i, arr) => {
            return arr.indexOf(v) === arr.lastIndexOf(v)
        })
    }

    getArrDifferenceByOrder (arr1, arr2) {
        let rst = [[], []]
        let differences = arr1.concat(arr2).filter((v, i, arr) => {
            return arr.indexOf(v) === arr.lastIndexOf(v)
        })
        differences.forEach(
            diff => {
                if (arr1.indexOf(diff) !== -1)
                    rst[0].push(diff)
                else
                    rst[1].push(diff)
            }
        )

        return rst
    }

    getArrEqual (arr1, arr2) {
        let newArr = []
        for (let i = 0; i < arr2.length; i++) {
            for (let j = 0; j < arr1.length; j++) {
                if (arr1[j] === arr2[i])
                    newArr.push(arr1[j])
            }
        }
        return newArr
    }

    // 将对象的字典类型转化为数组 label/value格式
    generateOpts (configMap, labelName = 'label', value = 'value') {
        if (Object.prototype.toString.call(configMap).slice(8, -1) === 'Object') {
            return Object.keys(configMap).map(key => {
                let label = typeof configMap[key] === 'object' ? configMap[key].label : configMap[key]
                return {
                    [labelName]: label,
                    [value]: key
                }
            })
        } else
            return []
    }

    /**
     * @description 转换掩码的格式
     * @param inetMask 如192.168.1.0/24的24
     */
    getNetMask (inetMask) {
        let netMask = ''
        if (inetMask > 32)
            return netMask

        //子网掩码为1占了几个字节
        let num1 = parseInt(inetMask / 8)
        //子网掩码的补位位数
        let num2 = inetMask % 8
        let array = []
        for (let i = 0; i < num1; i++)
            array[i] = 255

        for (let i = num1; i < 4; i++)
            array[i] = 0

        for (let i = 0; i < num2; num2--)
            array[num1] += Math.pow(2, 8 - num2)

        netMask = array[0] + '.' + array[1] + '.' + array[2] + '.' + array[3]

        return netMask
    }

    /**
     * @description 计算子网起始地址(不包括网络地址)
     * @param netMask 掩码如：255.255.255.0
     */
    getLowAddr (ip, netMask) {
        let lowAddr = ''
        let ipArray = []
        let netMaskArray = []
        // 参数不正确
        if (ip.split('.').length !== 4 || netMask === '')
            return ''

        for (let i = 0; i < 4; i++) {
            ipArray[i] = ip.split('.')[i]
            netMaskArray[i] = netMask.split('.')[i]
            if ((ipArray[i] > 255 || ipArray[i] < 0 || netMaskArray[i] > 255) && netMaskArray[i] < 0)
                return ''

            ipArray[i] = ipArray[i] & netMaskArray[i]
        }
        // 构造最小地址
        for (let i = 0; i < 4; i++) {
            if (i === 3)
                ipArray[i] = ipArray[i] + 1

            if (lowAddr === '')
                lowAddr += ipArray[i]
            else
                lowAddr += '.' + ipArray[i]
        }

        return lowAddr
    }
    /**
     * @description 计算子网终止地址（不包括广播地址）
     * @param netMask 掩码如：255.255.255.0
     */
    getHighAddr (ip, netMask) {
        let lowAddr = this.getLowAddr(ip, netMask)
        let hostNumber = this.getHostNumber(netMask)

        if (lowAddr === '' || hostNumber === 0)
            return ''

        let lowAddrArray = []
        for (let i = 0; i < 4; i++) {
            lowAddrArray[i] = lowAddr.split('.')[i]
            if (i === 3)
                lowAddrArray[i] = Number(lowAddrArray[i] - 1)
        }

        lowAddrArray[3] = lowAddrArray[3] + Number(hostNumber - 1)
        if (lowAddrArray[3] > 255) {
            let k = parseInt(lowAddrArray[3] / 256)
            lowAddrArray[3] = lowAddrArray[3] % 256
            lowAddrArray[2] = Number(lowAddrArray[2]) + Number(k)
            if (lowAddrArray[2] > 255) {
                k = parseInt(lowAddrArray[2] / 256)
                lowAddrArray[2] = lowAddrArray[2] % 256
                lowAddrArray[1] = Number(lowAddrArray[1]) + Number(k)
                if (lowAddrArray[1] > 255) {
                    k = parseInt(lowAddrArray[1] / 256)
                    lowAddrArray[1] = lowAddrArray[1] % 256
                    lowAddrArray[0] = Number(lowAddrArray[0]) + Number(k)
                }
            }
        }

        let highAddr = ''
        for (let i = 0; i < 4; i++) {
            if (i === 3)
                lowAddrArray[i] = lowAddrArray[i] - 1

            if (highAddr === '')
                highAddr = lowAddrArray[i]

            else
                highAddr += '.' + lowAddrArray[i]
        }

        return highAddr
    }
    /**
     * @description 获取主机数
     * @param netMask
     * @returns {Number}
     */
    getHostNumber (netMask) {
        var hostNumber = 0
        var netMaskArray = []
        for (var i = 0; i < 4; i++) {
            netMaskArray[i] = netMask.split('.')[i]
            if (netMaskArray[i] < 255) {
                hostNumber = Math.pow(256, 3 - i) * (256 - netMaskArray[i])
                break
            }
        }

        return hostNumber
    }

    /**
     * 复制内容到剪切板
     * @param {*} str 待复制的内容
     * @param {*} tipInfo 
     */
    copyToCutboard (str, tipInfo) {
        let save = function (e) {
            e.clipboardData.setData('text/plain', str)//下面会说到clipboardData对象
            e.preventDefault()//阻止默认行为
        }
        document.addEventListener('copy', save)
        document.execCommand('copy')//使文档处于可编辑状态，否则无效

        Notification.success({
            title: '成功',
            message: (tipInfo ? tipInfo : '') + '拷贝到剪切板'
        })
    }

    getCaption (str) {
        let arr = str.substring(str.indexOf('_') + 1)
        return arr
    }
    getButtonsUrl (serviceCode) {
            let btnPermissionsStr = sessionStorage.getItem('btnPermissionsStr')
            let ucmpcatalogData = JSON.parse(btnPermissionsStr).filter(item => {
                return item.title === '控制台'
            }) 
            let subMenus = ucmpcatalogData[0].subMenus || []
            let arr = []
            subMenus.forEach(item => {
                if (serviceCode === item.id.toLowerCase()) 
                    arr.push(item.subButton)
            })
            let Btns = []
            if (arr && arr.length) {
                arr[0].forEach(item => {
                    Btns.push(this.getCaption(item.button_code)) 
                })
            }
            return Btns
    }
    getEqualArray (arr1, arr2) {
        console.log(arr1, arr2)
        let newArr = []
        for (let i = 0; i < arr2.length; i++) {
            for (let j = 0; j < arr1.length; j++) {
                if (arr2[i].button_code && arr1[j] === arr2[i].button_code) 
                    newArr.push(arr2[i])
                 else if (arr2[i].name && arr1[j] === arr2[i].name) 
                    newArr.push(arr2[i])
            }
        }
        return newArr
    }

    /**
     * @description 获取设备系统类型(pc)
     */
    getPlatform () {
        let platform = window.navigator.platform
        if (platform.includes('Win')) return 'windows'
        if (platform.includes('Mac')) return 'mac'
        if (platform.includes('X11') || platform.includes('Linux')) return 'linux'

        return 'windows'
    }

    /**
     * @description 下载文件
     * @param {*} fileName 下载文件名称
     * @param {*} url 下载文件地址
     */
    downloadFile (fileName, url) {
        const evt = document.createEvent('MouseEvents')
        evt.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
        const aLink = document.createElement('a')
        aLink.download = fileName
        aLink.href = url
        aLink.dispatchEvent(evt)
    }
}
export default new Utils()

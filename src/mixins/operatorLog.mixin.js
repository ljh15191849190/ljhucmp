import Api from '@api'

/**
 * 模块code
 *
 OVERVIEW("10100", "总览"),
 SERVICEDIRECTORY("10200", "服务目录"),
 CONSOLE("10300", "控制台"),
 STATISTICALANALYSIS("10400", "统计分析"),
 CLOUDINFRASTRUCTURE("10500", "云基础架构"),
 APPLICATIONLAYOUT("10600", "应用编排"),
 MONITORINGALARM("10700", "监控告警"),
 OPERATIONMANGEMENT("10800", "运营管理"),
 PERSONALCENTER("10900", "个人中心"),
 SYSTEMSETUP("11000","系统设置"),
 SYSTEMMANAGEMENT("11100","系统设置");
 */
const MODULAR_CODE = {
    OVERVIEW: 10100,
    SERVICEDIRECTORY: 10200,
    CONSOLE: 10300,
    STATISTICALANALYSIS: 10400,
    CLOUDINFRASTRUCTURE: 10500,
    APPLICATIONLAYOUT: 10600,
    MONITORINGALARM: 10700,
    OPERATIONMANGEMENT: 10800,
    PERSONALCENTER: 10900,
    SYSTEMSETUP: 11000,
    SYSTEMMANAGEMENT: 11100
}

/**
 * 操作code
 *
 */
const TYPE_CODE = {
    CREATE: 1100, // 创建
    UPDATE: 1200, // 修改
    DELETE: 1300  // 删除
}
export default {
    data () {
        return {
            MODULAR_CODE,
            TYPE_CODE
        }
    },
    methods: {
        addOperLog (payload) {
            Api.post('operLog', payload).then(res => {
                // 静默插入日志
            })
        }
    }
}

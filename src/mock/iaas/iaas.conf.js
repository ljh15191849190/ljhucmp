/**
 * 资源池 常量 及 常态配置项
 * @author jia.lu
 */

// 资源池详情页 页面功能属性
export const EDIT_PAGE_LABEL_TYPES = {
    CHECK: 'check',
    ADD: 'add',
    EDIT: 'edit'
}

// 不同厂商的 额外输入框
export const SOURCE_POOL_CLOUD_INPUT_CONF = {
    Aliyun: {
        region: true,
        zone: true
    },
    Azure: {
        region: true,
        subscription: true //订阅
    },
    QCloud: {
        region: true,
        zone: true
    },
    // 青云
    QingCloud: {
        zone: true
    },
    OpenStack: {
        zone: true
    },
    VMWare: {
        selectAppNames: true, //服务对象
        monopoly: true, // 是否独占
        automatedDeploymentStrategy: true,
        activeTab: true
    },
    XenServer: {},
    // Hyper-v
    Scvmm: {}
}

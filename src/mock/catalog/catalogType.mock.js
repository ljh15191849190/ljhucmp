export const serviceGroupMap = {
    ecs: {label: '计算资源', order: 1},
    storage: {label: '存储资源', order: 2},
    network: {label: '网络资源', order: 3},
    paas: {label: 'Paas资源', order: 5},
    scripts: {label: '脚本', order: 6},
    business: {label: '应用资源', order: 7},
    security: {label: '安全资源', order: 4},
    vdi: {label: '桌面云', order: 8},
    specialty_software: {label: '专业软件', order: 9},
    blueprint: {label: '应用服务', order: 100},
    system_service: {label: '系统服务', order: 200}
}
// 属于应用资源的：标签， oracle， mysql， tomcat， weblogic
export const businessContains = ['rds', 'middleware', 'tag']
// 属于应用资源的（在流程定义中），现只有标签是需要流程的特殊的存在
export const serviceCodeInBusiness = ['public_tag']

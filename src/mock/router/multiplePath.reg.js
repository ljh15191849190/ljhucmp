/**
 * @description 路由跳转时，鉴别特殊路由（菜单与多个实际的路由映射）
 */
const MULTI_PATH_RULE = /^\/(physical|subnet|processDefinition|capacity\-mgmt|resourceIndex){1}\/[a-zA-Z0-9\_\-]+$/g
const FILTER_PATH = /^\/(physical|subnet|processDefinition|capacity\-mgmt|resourceIndex){1}/g

export {
    MULTI_PATH_RULE,
    FILTER_PATH
}

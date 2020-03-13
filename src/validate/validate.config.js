import validationMessages from 'vee-validate/dist/locale/zh_CN'
export const baseConfig = {
    errorBagName: 'errors', // change if property conflicts.
    fieldsBagName: 'vfields',
    delay: 0,
    locale: 'zh_CN',
    dictionary: {
        zh_CN: validationMessages
    },
    classNames: {
        touched: 'touched', // the control has been blurred
        untouched: 'untouched', // the control hasn't been blurred
        valid: 'valid', // model is valid
        invalid: 'invalid', // model is invalid
        pristine: 'pristine', // control has not been interacted with
        dirty: 'dirty' // control has been interacted with
    },
    strict: true,
    enableAutoClasses: false,
    /* 原子作业平台ATOMFLOWAT-286(脚本管理页面，添加返回码的时候，无法输入汉字)
     * 解决方法：经过降低element-ui版本后发现此问题依然存在，设置规则和input的初始值不一致，就无法再输入。去掉event：input校验
     */
    events: 'blur|click|change',
    inject: false
}

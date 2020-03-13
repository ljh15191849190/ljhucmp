# 服务
 
    >对服务的申请、纳管及系列操作
## 1.服务申请
![服务申请组件](http://easycloud.jios.org:38889/download/attachments/29265704/image2019-10-29_9-40-28.png?version=1&modificationDate=1572313259000&api=v2 "组件设计")
* 关联服务（mysql、tomcat、云硬盘、防病毒、防火墙...）
* 父子服务（F5与pool）
## 2.控制台
![控制台组件](http://easycloud.jios.org:38889/download/attachments/29265720/image2019-10-29_17-1-18.png?version=1&modificationDate=1572339700000&api=v2 "组件设计")
## 3.服务元数据
* 关联服务（mysql、tomcat、云硬盘、防病毒、防火墙...）
元数据中关联服务用related_service来表示，他是一个数组，可以多关联，refer_type表示关联关系，如o:m表示一对多
* 父子服务（F5与pool）
元数据中子服务用children来表示。
* 云厂商
元数据中子服务用children来表示。
* 配置模板
通过接口返回配置模板元数据( cfgTemplateDefines: UCMP_ROOT + '/service_define/:service_code/provider/:provider_code')。
* 审批
元数据中provider_conf：审批配置云厂商。
* 计费
元数据中billing_conf: 计费元数据配置

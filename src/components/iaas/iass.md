# 云基础架构
 
    >对云资源的统一纳管: 包括云厂商(共有云、私有云); 配置模板(各种资源的属性配置);镜像管理、网络管理(vmware)、桌面云等
## 1.云厂商(cloudProvider)
## 图示云厂商组件设计图
![云厂商组件](http://easycloud.jios.org:38889/download/attachments/29265562/image2019-10-18_17-17-10.png?version=1&modificationDate=1571390258000&api=v2 "组件设计")
* 云厂商创建、编辑
* 云厂商元数据
* 云厂商列表
* 云厂商详情(d3)
## 2.配置模板(configTemplate)
![配置模板组件](http://easycloud.jios.org:38889/download/attachments/29265573/image2019-10-22_10-44-17.png?version=1&modificationDate=1571712283000&api=v2 "组件设计")
*配置模板的创建、编辑
*配置模板列表
## 3.镜像管理(tempTemplate)
![配置模板组件](http://easycloud.jios.org:38889/download/attachments/29265576/image2019-10-22_14-37-3.png?version=1&modificationDate=1571726248000&api=v2 "组件设计")
* 镜像的创建、编辑
* 镜像列表
## 4.网络管理(subnet)
注意：此处的网络针对的是系统的VMware
![网络管理组件](http://easycloud.jios.org:38889/download/attachments/29265579/image2019-10-22_14-50-23.png?version=1&modificationDate=1571727056000&api=v2 "组件设计")
* IP
包括IP列表和IP创建、批量创建、编辑、删除
* 子网
包括子网列表和创建、编辑、删除, 以及子网与组织机构的关系
## 5.桌面云计算机管理(virtualCloudMght)
![桌面云计算机管理组件](http://easycloud.jios.org:38889/download/attachments/29265593/image2019-10-23_10-44-43.png?version=1&modificationDate=1571798710000&api=v2 "组件设计")
* 桌面云
* 会话
## 6.应用程序管理(cloudAppMght)
![应用程序管理组件](http://easycloud.jios.org:38889/download/attachments/29265608/image2019-10-23_17-30-34.png?version=1&modificationDate=1571823526000&api=v2 "组件设计")
* 应用程序
* 会话
* 应用程序设置
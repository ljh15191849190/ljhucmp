const Detail = { "strategy_name": "DASD", "alarm_type": "performance", "monitor_obj_type": "ecs", "monitor_obj": [], "alarm_level": 1, "msg_strategy": "msg_strategy01", "is_on": true, "description": "DASsadadad", "ruleList": [{ "isShowLogic": false, "logical_operator": "and", "tag_class": "cpu", "tag": "CPU使用率", "tag_operator": "average", "compare_operator": ">", "threshold": 2222, "unit": "%" }, { "isShowLogic": true, "logical_operator": "and", "tag_class": "cpu", "tag": "CPU使用率", "tag_operator": "average", "compare_operator": ">", "threshold": 2222, "unit": "%" }] }

export default Detail

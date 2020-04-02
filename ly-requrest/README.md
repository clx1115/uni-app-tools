## ajax 使用方式

### return: [Promise](https://www.runoob.com/w3cnote/javascript-promise-object.html)



### 使用指南

##### 全局使用（推荐）

```js
//main.js
import {req} from "common/ly-requrest/ly-requrest.js"; //文件路径请换成本地路径
req.defaultData.baseUrl = "127.0.0.1"; //公共请求基础地址
req.defaultData.dataPublic.token = "0000-1111-2222-3333" //设置token值
Vue.prototype.$ly = {req}; //挂载在原形上
```

##### 局部使用

```js
import {req} from "/ly-tool/ly-regexp.js"; //文件路径请换成本地路径
const data = await req.ajax({
    path:"127.0.0.1/getName"
})
console.log(data);
```



### 代码演示

##### 	1.简单使用

```js
const data = this.$ly.req.ajax({
    path:"/getName"
})
console.log(data);
```

##### 	2.带请求提示

```js
const data = this.$ly.req.ajax({
    title:"加载中...",
    path:"/getName"
})
console.log(data);
```

##### 	3.带参数

```js
const data = this.$ly.req.ajax({
    path:"/getName",
    data:{
        //token:"0000-1111-2222-3333" 设置了公共参数，默认会带上
    	name:"LiuYang"
    }
})
console.log(data);
```



### 全局配置表 defaultData


| 属性名 |      类型      |          描述          |          默认值          |
| :----: | :--------------: | :--------------------: | :--------------------: |
| baseUrl | string | 基础地址（一般为服务器地址） |  |
|    data    | object | 传递的参数 |  |
| method | string | 请求方式 | GET |
| header | string | 请求头 | 'content-type': "application/x-www-form-urlencoded" |
| dataType | string | 后端返回的数据格式 | json |
| dataPublic | object | 请求时默认带上的参数(常用于token) |  |



### ajax参数

|  属性名  |  类型  |                             描述                             | 兼容 |
| :------: | :----: | :----------------------------------------------------------: | :--: |
|  title   | string |       是否显示请求提示，推荐8字以内，默认为false不显示       |      |
|   path   | string |         请求路径，默认加上基础地址；可以请求外部地址         |      |
|  method  | string |                     请求的方式，默认GET                      |      |
|  header  | object | 请求头，默认为'content-type': "application/x-www-form-urlencoded" |      |
| dataType | string | 后端返回的数据类型，默认为json，会对返回的数据做一次JSON.parse |      |
|   data   | object |        请求的参数，设置了dataPublic会默认带上公共参数        |      |







欢迎补充  984584014@qq.com

------

<p style="text-align:right;font-size:14px;color:#999999;">文档更新时间：2020-04-02</p>
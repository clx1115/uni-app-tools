/**
 * @file 这是一个基于uniapp中的异步请求封装
 * @author LiuYang <984584014@qq.com>
 * @copyright LiuYang 2020
 * @version 1.1.0
 * 增加了图片上传,错误拦截,更改部分返回数据
 */
const defaultData = {
    baseUrl: '', // 基础地址
    data: {}, //  传递的参数
    method: "GET", //默认请求方式
    header: {'content-type': "application/x-www-form-urlencoded"}, //默认请求头
    dataType: "json", //默认返回数据为JSON格式  
    dataPublic: {}, // 默认请求时带的公共参数 常用于设置token
    //files: [], // 需要上传的文件列表。使用 files 时，filePath 和 name 不生效。APP端支持
    sourceType: ["album", "camera"], //album 从相册选图，camera 使用相机，默认二者都有。如需直接开相机或直接选相册，请只使用一个选项
    formData: {}, //HTTP 请求中其他额外的 form data
    beforeAjax: (bf,task) => {}, //请求前置拦截
    afterAjax: data => {}, //请求后置拦截
    beforeAjaxUpload : (bf,task) =>{},//上传前置拦截
    afterAjaxUpload : data =>{},//上传后置拦截
    error:(err,reject)=>{}//错误拦截
}
/**
 * @description 处理请求错误信息
 * @param {String} rtnInfo 请求后不管成功与否的消息
 * @param {String} type 判断是什么方法的错误
 * @returns {Object} 返回错误信息
 */
function errInfo(rtnInfo,type){
    if(type === "ajax"){// 请求的错误拦截
        if(rtnInfo.errMsg.indexOf("abort") != -1){ //是否为主动拦截
            return {statusCode:201,msg:"拦截成功",data:rtnInfo,type};
        }else if(rtnInfo.statusCode == 404){ //是否为地址错误
            return {statusCode:204,msg:"地址错误",data:rtnInfo,type};
        }else if(rtnInfo.statusCode == 500){ //是否为服务器错误
            return {statusCode:205,msg:"服务器错误",data:rtnInfo,type};
        }else{ //否则为网络错误
            return {statusCode:202,msg:"网络错误",data:rtnInfo,type};
        }
    }else if(type === "upload"){ //上传图片的错误拦截
        if(rtnInfo.errMsg.indexOf("cancel") != -1){ //是否为主动取消
            return {statusCode:203,msg:"取消选择",data:rtnInfo,type};
        }else if(rtnInfo.errMsg.indexOf("abort") != -1){ //是否为主动拦截
            return {statusCode:201,msg:"拦截成功",data:rtnInfo,type};
        }else if(rtnInfo.statusCode == 404){ //是否为地址错误
            return {statusCode:204,msg:"地址错误",data:rtnInfo,type};
        }else if(rtnInfo.statusCode == 500){ //是否为服务器错误
            return {statusCode:205,msg:"服务器错误",data:rtnInfo,type};
        }else if(rtnInfo.errMsg.indexOf("network") != -1){ //是否为网络错误
            return {statusCode:202,msg:"网络错误",data:rtnInfo,type};
        }else{ //否则为未知错误
            return {statusCode:0,msg:"未知错误",data:rtnInfo,type};
        }
    }else{
        // 未知type
        return {statusCode:0,msg:"未知错误",data:rtnInfo,type};
    }
    // console.log(rtnInfo)
}
/**
 * @class
 */
class Request {
    constructor() {
        // this.defaultData =defaultData;
        this.defaultData ={...defaultData,name:"刘洋"};
    }
    /**
     * @description 请求
     * @param {String} title 是否需要显示loading加载提示框 title值就是loading的值
     * @param {String} path 请求的地址 
     * @param {Object} data 请求带过去的参数 默认为空对象
     * @param {String} method = [GET|POST] 请求的方式 
     * @param {Object} header 请求头信息 content-type':"application/x-www-form-urlencoded
     * @param {String} dataType 默认json返回的信息默认为json会尝试进行一次json解析
     * @param {Function(Event)} beforeAjax 请求前置拦截回调
     * @param {Function(Event)} afterAjax 请求后置拦截回调
     * @param {Function(Event)} error 错误回调
     * @returns {Promise} 返回一个Promise对象
     */
    ajax({
        title = false,
        path = '',
        data = this.defaultData.data,
        method = this.defaultData.method,
        header = this.defaultData.header,
        dataType = this.defaultData.dataType,
        beforeAjax = this.defaultData.beforeAjax,
        afterAjax = this.defaultData.afterAjax,
        error = this.defaultData.error
    } = {}) {
        return new Promise((resolve, reject) => {
            // 方便拿值，提升性能
            let defaultData = this.defaultData;
            //合并公共参数
            Object.assign(data,defaultData.dataPublic);
            //拿到请求的信息
            const requestInfo = {
                // 外部请求就不拼接基础地址
                url: /^http/.test(path) ? path : defaultData.baseUrl + path, //拼接请求地址
                data, //需要传递的参数
                method, //请求方法
                header, //请求头
                dataType //返回的数据格式
            }
            // 如果title值存在，就显示loading，标题就是显示的值
            if (title)(uni.showLoading({
                title,
                mask: true
            }));
            // 开始请求
            let requestTask = uni.request({
                ...requestInfo, //请求的参数
                complete: (rtnInfo) => {
                    // console.log(rtnInfo) //请求后的信息
                    // 状态不等于200说明有错误
                    if (rtnInfo.statusCode != 200) {
                        // 错误拦截
                        error ? error(errInfo(rtnInfo,"ajax"),reject) : defaultData.error(errInfo(rtnInfo,"ajax"),reject)
                    } else {
                        //请求后置拦截
                        afterAjax ? resolve(afterAjax(rtnInfo.data)) : resolve(defaultData.afterAjax(rtnInfo.data));
                    }
                    uni.hideLoading() //隐藏加载loading框
                }
            })
            //请求前拦截
            beforeAjax ? beforeAjax(requestInfo,requestTask) : defaultData.beforeAjax(requestInfo,requestTask)
        })
    }
    /**
     * @description 图片上传
     * @param {String} title 是否需要显示loading加载提示框 title值就是loading的值
     * @param {String} path 请求的地址 
     * @param {String} name 文件对应的 key , 开发者在服务器端通过这个 key 可以获取到文件二进制内容。
     * @param {Object} header 请求头信息
     * @param {Object} formData HTTP请求中其他额外的formData
     * @param {Array} sourceType album从相册选图,camera使用相机，默认二者都有。如需直接开相机或直接选相册，请只使用一个选项
     * @param {Function(Event)} beforeAjaxUpload 上传前置拦截回调
     * @param {Function(Event)} afterAjaxUpload 上传后置拦截回调
     * @param {Function(Event)} error 错误回调
     * @returns {Promise}  返回一个Promise对象
     */
    ajaxUpload({
        title = false, // 是否显示加载提示框
        path = '', // 路径
        //files=this.defaultData.files, 暂不开放 //需要上传的文件列表。使用 files 时，filePath 和 name 不生效。只支持APP。
        // filePath = "", //要上传文件资源的路径。必填
        name = "", // 文件对应的 key , 开发者在服务器端通过这个 key 可以获取到文件二进制内容。必填
        header = this.defaultData.header, //请求头
        formData = this.defaultData.formData, //HTTP 请求中其他额外的 form data
        sourceType = this.defaultData.sourceType, //album 从相册选图，camera 使用相机，默认二者都有。如需直接开相机或直接选相册，请只使用一个选项
        beforeAjaxUpload = this.defaultData.beforeAjaxUpload, //前置拦截
        afterAjaxUpload = this.defaultData.afterAjaxUpload, //后置拦截
        error = this.defaultData.error //错误拦截
    } = {}) {
        return new Promise((resolve, reject) => {
            // 方便拿值，提升性能
            let defaultData = this.defaultData;
            // 获取文件路径
            uni.chooseImage({
                count: 1,
                sourceType,//album 从相册选图，camera 使用相机，默认二者都有。如需直接开相机或直接选相册，请只使用一个选项
                complete: (rtnInfo) => {
                    // console.log(rtnInfo);
                    // 如果没有查到ok，意味着打开文件选择失败
                    if(rtnInfo.errMsg.indexOf("ok") == -1){
                        // 错误拦截
                        error ? error(errInfo(rtnInfo,"upload"),reject) : defaultData.error(errInfo(rtnInfo,"upload"),reject);
                    }else{
                        // 拿到上传的信息
                        const uploadInfo = {
                            // 外部请求就不拼接基础地址
                            url: /^http/.test(path) ? path : defaultData.baseUrl + path, //拼接请求地址
                            header, //请求头
                            filePath: rtnInfo.tempFiles[0].path, //上传地址
                            name, //后台接收的key值
                            formData, //额外参数
                        };
                        // 如果title值存在，就显示loading，标题就是显示的值
                        if (title)(uni.showLoading({
                            title,
                            mask: true
                        }));
                        let uploadTask = uni.uploadFile({
                            ...uploadInfo, //上传的信息
                            complete: (rtnInfo) => {
                                // console.log(rtnInfo)
                                // 状态不等于200说明报错
                                if(rtnInfo.statusCode != 200){
                                    // 错误拦截
                                    error ? error(errInfo(rtnInfo,"upload"),reject) : defaultData.error(errInfo(rtnInfo,"upload"),reject);
                                }else{
                                    //请求后置拦截
                                    afterAjaxUpload ? resolve(afterAjaxUpload(rtnInfo.data)) : resolve(defaultData.afterAjaxUpload(rtnInfo.data));
                                }
                                uni.hideLoading(); //隐藏加载loading框
                            }
                        });
                        //上传前置拦截
                        beforeAjaxUpload ? beforeAjaxUpload(uploadInfo,uploadTask) : defaultData.beforeAjaxUpload(uploadInfo,uploadTask)
                    }
                }
            })
        })
    }
}
export const req = new Request();

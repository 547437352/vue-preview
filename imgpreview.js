var imgobj={
    install:function (vue,ops) {
        vue.directive('preview', {
            inserted: function (el,binding) {
                el.focus()
            }
        })
        var imgPreview=vue.extend({
                data:function () {
                    return {
                        addimgarr:[]
                    }
                },
                template: `
             <div id="iws-imglist">
                <li v-for="(i,index) in addimgarr"><img :src="i" alt="" @click="imgyulan($event,i)"/><strong class="iws-strong" @click="delimg(index,addimgarr)"></strong></li>
                <div class="addimg">
                   <slot name="icon"></slot>
                  <input type="file" @change="inputchange($event)" accept="image/*"/>
                </div>
            </div>
            `,
                methods:{
                    inputchange:function(event){//选择input事件
                        var self=event.target.files[0],that=this
                        if(!self){
                            alert('没有选择到')
                            return false;
                        }else{
                            if(self.type.split('/')[0]=='image'){
                                var isLt3M = self.size / 1024 / 1024 < 3;
                                if (!isLt3M) {
                                    alert('上传图片大小不能超过 3MB!')
                                    return
                                }
                            }else{
                                alert('必须选择图片')
                                event.target.value=''
                                return
                            }
                        }

                        var thissize=self.size / 1024 / 1024,imageUrl,osize
                        if(thissize<=0.12){  //小于120k的不压缩直接转化，其他都按照一定比例压缩
                            var reader = new FileReader();
                            reader.readAsDataURL(self);
                            reader.onload = function (e) {
                                that.addimgarr.push(this.result)
                                event.target.value=''
                            }
                            return false
                        }else if(thissize>0.12 && thissize<=0.3){
                            osize=0.85
                        }else if(thissize>0.3 && thissize<=0.5){
                            osize=0.8
                        }else if(thissize>0.5 && thissize<=0.8){
                            osize=0.72
                        }else if(thissize>0.8 && thissize<=1.4){
                            osize=0.68
                        }else if(thissize>1.4 && thissize<=1.9){
                            osize=0.62
                        }else if(thissize>1.9 && thissize<=2.4){
                            osize=0.55
                        }else{
                            osize=0.5
                        }
                        imageUrl = that.getObjectURL(self);
                        that.convertImgToBase64(imageUrl, function(base64Img){
                            that.addimgarr.push(base64Img)
                            event.target.value=''

                        },osize);
                    },
                    convertImgToBase64: function (url, callback,sizeTimes) {//压缩图片
                        var canvas = document.createElement('CANVAS');
                        var ctx = canvas.getContext('2d');
                        var img = new Image;
                        img.crossOrigin = 'Anonymous';
                        img.onload = function () {
                            var width = img.width, w,height = img.height, h,dataURL
                            if(width>640){    //因为在手机端所以如果图片宽度大于640，则缩小的640，高度同比缩小
                                w=640/width
                                h=height*w
                                canvas.width = 640;
                                canvas.height = h;
                                ctx.drawImage(img, 0, 0, width, height, 0, 0, 640, h);  //将图片绘制到canvas中
                            }else{
                                canvas.width = width;
                                canvas.height = height;
                                ctx.drawImage(img, 0, 0, width, height, 0, 0, width , height );
                            }
                            dataURL = canvas.toDataURL('image/jpeg',sizeTimes);//将图片转化为dataurl也就是base64格式!toDataURL 这个方法有两个参数：type：默认格式是image/png，图片质量：只有在图片格式是jpeg和webP的情况下，这个参数才生效(范围0-1)，默认是0.92
                            callback.call(this, dataURL);
                            canvas = null;
                        };
                        img.src = url;
                    },

                    getObjectURL: function (file) {  //获取图片都bolb地址
                        var url = null;
                        if (window.createObjectURL != undefined) {  // basic
                            url = window.createObjectURL(file);
                        } else if (window.URL != undefined) {      // mozilla(firefox)
                            url = window.URL.createObjectURL(file);
                        } else if (window.webkitURL != undefined) { // web_kit or chrome
                            url = window.webkitURL.createObjectURL(file);
                        }
                        return url;
                    },
                    delimg:function(index,that){//删除图片事件
                        that.splice(index,1)
                    },
                    imgyulan:function(e,dataurl){//预览图片
                        this.$emit('imgclick',dataurl,e.target.naturalWidth,e.target.naturalHeight)
                    }
                }
            })
            vue.component('imgPreview', imgPreview)
        
    }
}



//  CommonJS
if (typeof exports == "object") {
    module.exports = imgobj
//  AMD
} else if (typeof define == "function" && define.amd) {
    define([], function(){ return imgobj })
// Vue 是全局变量时，自动调用 Vue.use()
} else if (window.Vue) {
    window.imgobj = imgobj
    Vue.use(imgobj)
}






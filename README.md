#	IMAGE CLIPPER 图片裁剪器
![](https://img.shields.io/badge/version-1.0.0-green.svg)

![](https://raw.githubusercontent.com/vincentmrlau/image-clipper/master/images/clip.png)

> image clipper, headshot editor 图片裁剪工具， 头像编辑器
> 
> [demo](https://vincentmrlau.github.io/image-clipper/src/)

#### Feature 特点
1.	move,scale,rotation 移动、缩放、旋转
2.	Mouse Operation & Gesture 同时支持鼠标操作和手势操作
3. good performance 性能还不错😉
4. extendable & customizable  支持扩展和定制

##	USE 使用

###		INITAILIZE 初始化 
>	let myCliper = new Clipper(container [, options])

```HTML
<!-- SET A CONTAINER   设置一个容器 -->
<div id="clipper-container"></div>

<!-- include 引入 -->
<script src="Clipper.js"></script>

<!-- initialize 初始化 -->
<script>

let container = document.getElementById('clipper-container')
// init without options
let clipper = new Clipper(container)
</script>
```
#### options 选项
```javaScript
let clipper = new Clipper(container, {
                coverShape: 'circle',
                coverColor: '#000000',
                coverSize: 0.8,
                coverOpacity: 0.8
            })
```
**coverShape** 

*	defuat-默认值 ：circle
* 	availabel - 可选： circle , rect

![example](https://raw.githubusercontent.com/vincentmrlau/image-clipper/master/images/shape.png)

**coverColor** 

*	defuat-默认值 ：#000000
* 	availabel - 可选： HEX COLOR 十六进制颜色值

![example](https://raw.githubusercontent.com/vincentmrlau/image-clipper/master/images/color.png)

**coverSize** 

*	defuat-默认值 ：0.8
* 	availabel - 可选： 0 ~ 1

![example](https://raw.githubusercontent.com/vincentmrlau/image-clipper/master/images/size.png)

**coverOpacity** 

*	defuat-默认值 ：0.8
* 	availabel - 可选： 0 ~ 1

![example](https://raw.githubusercontent.com/vincentmrlau/image-clipper/master/images/opacity.png)

###	Place image 放置图片 clipper.drawImg(url)
```
let clipper = new Clipper(container)
clipper.drawImg(url)
```

###	Clip 裁剪 clipper.clip([cb] [,options])
**note:** it is never output a circle image,we can display with CSS border-radius
**注意：** 不会输出圆形的图片，我们可以在显示的时候使用CSS的圆角属性

```
let clipper = new Clipper(container)
clipper.drawImg(url)
//clipper.clip([cb] [,options])
clipper.clip()
```
####  callback 回调函数 cb(data)
*	data: base64 or blob,accord to options.format 根据options.format变化

* options: * for default
         *   outputSize: the output image size, * 200
         *   format: * 'base64' , 'blob'
         *   quality: * 1, 0 ~ 1
         *   type: * 'image/png' , ...
#### options
*	outputSize: the output image (square) size, in px 输出的正方形图片的边长,像素单位
	* default 默认: 200
	* available 可选: any Num 任何数字
*	format: the callback data format 回调函数的data的格式
	* default 默认: ‘base64'
	* available 可选: 'base64', 'blob'
*	quality: the quality of thr output,输出的质量
	* default 默认: 1
	* available 可选: 0 ~ 1
* 	type: the output image type, 输出的图片类型
	* default 默认: 'image/png'
	* available 可选: 'image/png','image/jpg' ......


###	INTERFACE 交互

####	MOVE 移动
**mouse OR touch 鼠标或触摸:**	press and move 按住移动

**extend 扩展:** 

```
let clipper = new Clipper(container)
clipper.drawImg(url)
//read (x,y) 获取坐标 ： 
let x = cliper.imgX
let y = cliper.imgY
// set (sx,sy) 设置坐标
clipper.imgNextX = sx
clipper.imgNextY = sy
```
####	SCALE 缩放
**mouse 鼠标:** with wheel 使用滚轮

**touch 触摸:** with gesture 使用手势

![](https://raw.githubusercontent.com/vincentmrlau/image-clipper/master/images/scale.png)

**extend 扩展:** 

```
let clipper = new Clipper(container)
clipper.drawImg(url)
//read scale 获取缩放比例 ： 
let scale = clipper.imgScale
// set scale 设置股缩放比例
clipper.imgNextScale = scale
```

####	ROTATION 旋转
**mouse 鼠标** no set 没有设置

**touch 触摸:** with gesture 使用手势

![](https://raw.githubusercontent.com/vincentmrlau/image-clipper/master/images/rotate.png)

**extend 扩展:** 

```
let clipper = new Clipper(container)
clipper.drawImg(url)
//read rotate 获取缩放比例 ： 
let rotate = clipper.rotate
// set rotate 设置缩放比例
clipper.nextRotate = rotate
```

## MORE 更多
*	it is in ES6, parse with babel if needed, 如果有需要，用babel转出es5或其他版本

(function (window) {
    let requestAnimationFrame = window.requestAnimationFrame||
        window.mozRequestAnimationFrame||
        window.webkitRequestAnimationFrame||
        window.msRequestAnimationFrame
    window.Clipper = class {
        /*
        * constructor:
        * container: the container for this editor
        * _options: * means default
        *   coverShape: *'circle' 'rect'
        *   coverColor: *'#000000' available: HEX COLOR
        *   coverOpacity: *0.8 available: 0 ~ 1
        *   coverSize: *0.8 available: 0 ~ 1
        * more is coming
        * */
        constructor(container, _options){
            let options = _options||{},
                holeSize
            let WIDTH = container.offsetWidth
            let HEIGHT = container.offsetHeight
            // set a cover canvas over the container
            this.coverCanvas = document.createElement('canvas')
            this.coverCanvas.width = WIDTH
            this.coverCanvas.height = HEIGHT
            this.coverCanvas.style.position = 'absolute'
            this.coverCanvas.style.zIndex = 1
            container.appendChild(this.coverCanvas)
            this.coverCtx = this.coverCanvas.getContext('2d')
            // set a canvas over the container
            this.canvas = document.createElement('canvas')
            this.canvas.width = WIDTH
            this.canvas.height = HEIGHT
            container.appendChild(this.canvas)
            this.ctx = this.canvas.getContext('2d')
            // record massage
            this.width = WIDTH
            this.height = HEIGHT
            // output canvas
            this.outputCanvas = document.createElement('canvas')
            // cover
            this.cover = {
                shape: options.coverShape||'circle',
                color: options.coverColor||'#000000',
                opacity: options.coverOpacity||0.8,
                size: options.coverSize||0.8
            }
            if (WIDTH <= HEIGHT) {
                holeSize = WIDTH*this.cover.size
            } else {
                holeSize = HEIGHT*this.cover.size
            }
            this.coverStartX = (WIDTH - holeSize)*0.5
            this.coverStartY = (HEIGHT - holeSize)*0.5
            this.holeSize = holeSize
            // img status
            this.imgX = 0
            this.imgY = 0
            this.imgScale = 1
            this.rotation = 0
            // nextState
            this.imgNextX = 0
            this.imgNextY = 0
            this.imgNextScale = 1
            this.nextRotation = 0
            // the originPoint of rotation and scale
            this.originPoint = {
            
            }
            // the img put in editor
            this.img = new Image()
            this.img.crossOrigin = '*'
            // start
            this.drawCover(this.ctx)
            // mouse wheel scroll to scale
            this.coverCanvas.addEventListener('mousewheel', (event) => {
                let e = event || window.event,
                    increment = 0
                e.preventDefault()
                if (e.wheelDelta > 0) {
                    // bow up
                    increment = 0.005
                } else {
                    // min scale : 0.01
                    (this.imgScale >= 0.02) && (increment = -0.005)
                }
                // compute
                this.imgNextScale += increment
                this.imgNextX -= increment*this.img.width*0.5
                this.imgNextY -= increment*this.img.height*0.5
            })
            // move with mouse
            let clickX = 0,
                clickY = 0,
                clickPress = false
            this.coverCanvas.addEventListener('mousedown', (event) => {
                let e = event || window.event
                clickX = e.clientX
                clickY = e.clientY
                clickPress = true
            })
            this.coverCanvas.addEventListener('mousemove', (event) => {
                if (!clickPress) {
                    return false
                }
                let e = event || window.event,
                    tempX = e.clientX,
                    tempY = e.clientY,
                    incrementX = tempX - clickX,
                    incrementY = tempY - clickY
                this.imgNextX += incrementX
                this.imgNextY += incrementY
                clickX = tempX
                clickY = tempY
            })
            this.coverCanvas.addEventListener('mouseup', (event) => {
                clickPress = false
            })
            // move && scale with touch
            let touch1X = 0,
                touch2X = 0,
                touch1Y = 0,
                touch2Y = 0,
                touching = false,
                multiTouch = false
            this.coverCanvas.addEventListener('touchstart', (event) => {
                let e = event || window.event,
                    touches = e.touches
                e.preventDefault()
                touch1X = touches[0].clientX
                touch1Y = touches[0].clientY
                touch2X = touches[1]?touches[1].clientX:undefined
                touch2Y = touches[1]?touches[1].clientY:undefined
                // status
                touching = true
                clickPress = false
                if (touch2X !== undefined){
                    multiTouch = true
                }
            })
            this.coverCanvas.addEventListener('touchmove', (event) => {
                if (!touching){
                    return false
                }
                let e = event || window.event,
                    touches = e.touches,
                    temp1X = touches[0].clientX,
                    temp1Y = touches[0].clientY,
                    temp2X = touches[1]?touches[1].clientX:undefined,
                    temp2Y = touches[1]?touches[1].clientY:undefined,
                    increment1X = temp1X - touch1X,
                    increment1Y = temp1Y - touch1Y
                if (temp2X === undefined) {
                    // move
                    this.imgNextX += increment1X
                    this.imgNextY += increment1Y
                } else {
                    // scale
                    let disBef = Math.round(Math.sqrt(Math.pow(touch1X - touch2X, 2)+ Math.pow(touch1Y - touch2Y, 2))),
                        disNow = Math.round(Math.sqrt(Math.pow(temp1X - temp2X, 2) + Math.pow(temp1Y - temp2Y, 2)))
                    let incrementScale = (disNow - disBef)/(this.width)
                    this.imgNextScale += incrementScale
                    if(this.imgNextScale <= 0.01){
                        this.imgNextScale = 0.01
                        incrementScale = 0
                    }
                    this.imgNextX -= incrementScale*this.img.width*0.5
                    this.imgNextY -= incrementScale*this.img.height*0.5
                    // rotate
                    let angleBF = Math.atan2(touch2Y - touch1Y, touch2X - touch1X),
                        angleNow = Math.atan2(temp2Y - temp1Y, temp2X - temp1X),
                        incrementAngle = angleNow - angleBF
                    this.nextRotation += incrementAngle
                }
                //save
                touch1X = temp1X
                touch2X = temp2X
                touch1Y = temp1Y
                touch2Y = temp2Y
            })
            this.coverCanvas.addEventListener('touchend', function () {
                // status
                touching = false
                clickPress = false
                multiTouch = false
            })

            // start listening
            let af = () => {
                if (typeof options.beforeAF === 'function') {
                    options.beforeAF.call()
                }
                this.redraw(this.ctx)
                if (typeof options.afterAF === 'function') {
                    options.afterAF.call()
                }
                requestAnimationFrame(af)
            }
          af()
        }
        drawCover(){
            this.coverCtx.save()
            this.coverCtx.globalAlpha = this.cover.opacity
            this.coverCtx.fillStyle = this.cover.color
            this.coverCtx.fillRect(0, 0, this.width, this.height)
            // clip
            this.coverCtx.beginPath()
            switch (this.cover.shape) {
                case 'rect':
                    this.coverCtx.rect(this.coverStartX, this.coverStartY, this.holeSize , this.holeSize)
                    break
                case 'circle':
                    this.coverCtx.arc(this.coverStartX + this.holeSize *0.5, this.coverStartY + this.holeSize *0.5, this.holeSize*0.5, 0, Math.PI*2, false)
                    break
                default:
            }
            this.coverCtx.globalAlpha = 1
            this.coverCtx.globalCompositeOperation = 'destination-out'
            this.coverCtx.fill()
            this.coverCtx.restore()
        }
        /*
        * standard draw image method
        * */
        standardDraw (_ctx, options = {}) {
            let ctx = _ctx || this.ctx
            let
                canvasHeight = options.height||this.height,
                canvasWidth = options.width||this.width,
                imgNextX = options.imgNextX||this.imgNextX,
                imgNextY = options.imgNextY||this.imgNextY,
                imgNextScale = options.imgNextScale||this.imgNextScale,
                nextRotation = options.rotation||this.nextRotation
            // draw
            let
              height = imgNextScale * this.img.height,
              width = imgNextScale * this.img.width
            ctx.save()
            // clear
            ctx.clearRect(0, 0, canvasWidth, canvasHeight)
            ctx.globalCompositeOperation = 'destination-over'
            let tempY = imgNextY - 0.5*(width*Math.sin(nextRotation) - height + height*Math.cos(nextRotation))
            let tempX = imgNextX + 0.5*(width - width*Math.cos(nextRotation) + height*Math.sin(nextRotation))
            ctx.translate(tempX,tempY)
            ctx.rotate(nextRotation)
            ctx.scale(imgNextScale,imgNextScale)
            ctx.drawImage(this.img, 0, 0, this.img.width, this.img.height)
            // smooth
            ctx.imageSmoothingEnabled = true;
            ctx.mozImageSmoothingEnabled = true;
            ctx.webkitImageSmoothingEnabled = true;
            ctx.msImageSmoothingEnabled = true;
            ctx.restore()
            // save data
            if (options.doNotSave) {} else {
              this.imgX = imgNextX
              this.imgY = imgNextY
              this.imgScale = imgNextScale
              this.rotation = nextRotation
            }
            console.log(imgNextScale)
        }
        /*
        * url: the img src
        * */
        drawImg(url, _ctx, options = {}){
            let ctx = _ctx||this.ctx
            // 处理选项
            let canvasHeight = options.height|| this.height
            let canvasWidth = options.width|| this.width
            this.img.onload = () => {
                let rateImg = this.img.width/this.img.height,
                    rateCanvas = canvasWidth/canvasHeight,
                    x,
                    y,
                    width,
                    height,
                    scale
                if (rateImg >= rateCanvas) {
                    scale = canvasWidth/this.img.width
                } else {
                    scale = canvasHeight/this.img.height
                }
                width = this.img.width * scale
                height = this.img.height*scale
                x = (canvasWidth - width) * 0.5
                y = (canvasHeight - height) * 0.5
                this.imgNextX = x
                this.imgNextY = y
                this.imgNextScale = scale
                this.nextRotation = 0
                this.standardDraw(this.ctx)
            }
            this.img.src = url
        }
        // scale OR move
        redraw(){
            let ctx = this.ctx
            // do nothing when no changed
            if (this.imgX === this.imgNextX
                && this.imgY === this.imgNextY
                && this.imgScale === this.imgNextScale
                && this.rotation === this.nextRotation) {
                return false
            }
            // redraw when change happen
            this.standardDraw()
        }
        /*
         * clip
         * cb: callback, arg: base64 or blob
         * options: * for default
         *   outputSize: the output image size, * 200
         *   format: * 'base64' , 'blob'
         *   quality: * 1, 0 ~ 1
         *   type: * 'image/png' , ...
         * */
        clip(cb, options ){
            let _options = options || {}
            // compute
            let
                dWidth = _options.outputSize || 200,
                dHeight = _options.outputSize || 200,
                format = _options.format || 'base64',
                quality = _options.quality || 1,
                type = _options.type || 'image/png',
                _ctx,
                cScale = dWidth/this.holeSize,
                scale = cScale * this.imgScale,
                width = this.img.width*scale,
                height = this.img.height*scale,
                x = (this.imgX - this.coverStartX)*cScale + 0.5*(width - width*Math.cos(this.rotation) + height*Math.sin(this.rotation)),
                y = (this.imgY - this.coverStartY)*cScale - 0.5*(width*Math.sin(this.rotation) - height + height*Math.cos(this.rotation))
            _ctx = this.outputCanvas.getContext('2d')
            // set canvas size
            this.outputCanvas.width = dWidth
            this.outputCanvas.height = dHeight
            // draw
            _ctx.save()
            _ctx.translate(x,y)
            _ctx.rotate(this.rotation)
            _ctx.scale(scale,scale)

            _ctx.drawImage(this.img, 0, 0, this.img.width, this.img.height)
            _ctx.restore()
            // this.standardDraw(_ctx, {
            //     height: dHeight,
            //     width: dWidth,
            //     imgNextScale: scale,
            //     doNotSave: true,
            //     imgNextX: this.imgX,
            //     imgNextY: this.imgNextY
            // })
            // to data url
            let data = this.outputCanvas.toDataURL(type, quality)
            if (format === 'base64') {
                if (cb) {
                    cb(data)
                }
            } else if (format === 'blob') {
                let arr = data.split(','),
                    mine = arr[0].match(/:(.*?);/)[1],
                    bstr = atob(arr[1]),
                    n = bstr.length,
                    u8arr = new Uint8Array(n)
                while (n--) {
                    u8arr[n] = bstr.charCodeAt(n)
                }
                let blob = new Blob([u8arr], {type:mine})
                if (cb) {
                    cb(blob)
                }
            }
        }
    }
})(window)
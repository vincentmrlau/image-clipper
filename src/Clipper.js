
(function (window) {
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
            // set a canvas over the container
            this.canvas = document.createElement('canvas')
            this.canvas.width = WIDTH
            this.canvas.height = HEIGHT
            container.appendChild(this.canvas)
            this.ctx = this.canvas.getContext('2d')
            // smooth
            // this.ctx.imageSmoothingEnabled = true
            // // if (window.devicePixelRatio) {
            // //     this.canvas.style.width = WIDTH + 'px'
            // //     this.canvas.style.height = HEIGHT+ 'px'
            // //     WIDTH = WIDTH*window.devicePixelRatio
            // //     HEIGHT = HEIGHT*window.devicePixelRatio
            // //     this.ctx.scale(window.devicePixelRatio,window.devicePixelRatio)
            // // }
            // this.canvas.style.width = WIDTH + 'px'
            // this.canvas.style.height = HEIGHT+ 'px'
            // WIDTH = WIDTH*8
            // HEIGHT = HEIGHT*8
            // this.ctx.scale(8,8)
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
            this.nextRoatetion = 0
            // the img put in editor
            this.img = new Image()
            this.img.crossOrigin = '*'
            // start
            this.drawCover(this.ctx)
            // mouse wheel scroll to scale
            this.canvas.addEventListener('mousewheel', (event) => {
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
            this.canvas.addEventListener('mousedown', (event) => {
                let e = event || window.event
                clickX = e.clientX
                clickY = e.clientY
                clickPress = true
            })
            this.canvas.addEventListener('mousemove', (event) => {
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
            this.canvas.addEventListener('mouseup', (event) => {
                clickPress = false
            })
            // move && scale with touch
            let touch1X = 0,
                touch2X = 0,
                touch1Y = 0,
                touch2Y = 0,
                touching = false,
                multiTouch = false
            this.canvas.addEventListener('touchstart', (event) => {
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
            this.canvas.addEventListener('touchmove', (event) => {
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
                    this.nextRoatetion += incrementAngle
                }
                //save

                touch1X = temp1X
                touch2X = temp2X
                touch1Y = temp1Y
                touch2Y = temp2Y
            })
            this.canvas.addEventListener('touchend', function () {
                // status
                touching = false
                clickPress = false
                multiTouch = false
            })

            // start listening
            let aq = () => {
                this.redraw(this.ctx)
                requestAnimationFrame(aq)
            }
            aq()
        }
        drawCover(ctx){
            ctx.save()
            ctx.globalAlpha = this.cover.opacity
            ctx.fillStyle = this.cover.color
            ctx.fillRect(0, 0, this.width, this.height)
            // clip
            ctx.beginPath()
            switch (this.cover.shape) {
                case 'rect':
                    ctx.rect(this.coverStartX, this.coverStartY, this.holeSize , this.holeSize)
                    break
                case 'circle':
                    ctx.arc(this.coverStartX + this.holeSize *0.5, this.coverStartY + this.holeSize *0.5, this.holeSize*0.5, 0, Math.PI*2, false)
                    break
                default:
            }
            ctx.globalAlpha = 1
            ctx.globalCompositeOperation = 'destination-out'
            ctx.fill()
            ctx.restore()
        }
        /*
        * url: the img src
        * */
        drawImg(url){
            let ctx = this.ctx
            this.img.onload = () => {
                let rateImg = this.img.width/this.img.height,
                    rateCanvas = this.width/this.height,
                    x,
                    y,
                    width,
                    height,
                    scale
                if (rateImg >= rateCanvas) {
                    scale = this.width/this.img.width
                } else {
                    scale = this.height/this.img.height
                }
                width = this.img.width * scale
                height = this.img.height*scale
                x = (this.width - width) * 0.5
                y = (this.height - height) * 0.5
                // draw
                ctx.save()
                // clear
                ctx.clearRect(0, 0, this.width, this.height)
                this.drawCover(ctx)
                ctx.globalCompositeOperation = 'destination-over'
                this.rotation = 0
                this.nextRoatetion =0
                let tempY = y - 0.5*(width*Math.sin(this.rotation) - height + height*Math.cos(this.rotation))
                let tempX = x + 0.5*(width - width*Math.cos(this.rotation) + height*Math.sin(this.rotation))
                ctx.translate(tempX,tempY)
                ctx.rotate(this.rotation)
                ctx.scale(scale,scale)
                ctx.drawImage(this.img, 0, 0, this.img.width, this.img.height)
                ctx.restore()
                // save data
                this.imgX = x
                this.imgY = y
                this.imgScale = scale
                this.imgNextX = x
                this.imgNextY = y
                this.imgNextScale = scale
                this.rotation = 0
                this.nextRoatetion =0
            }
            this.img.src = url
        }
        // scale OR move
        redraw(ctx){
            // do nothing when no changed
            if (this.imgX === this.imgNextX
                && this.imgY === this.imgNextY
                && this.imgScale === this.imgNextScale
                && this.rotation === this.nextRoatetion) {
                return false
            }
            // redraw when change happen
            // clear
            ctx.clearRect(0, 0, this.width, this.height)
            this.drawCover(ctx)
            let width = this.imgNextScale * this.img.width,
                height = this.imgNextScale * this.img.height
            // draw
            ctx.save()
            ctx.globalCompositeOperation = 'destination-over'
            let y =this.imgNextY - 0.5*(width*Math.sin(this.nextRoatetion) - height + height*Math.cos(this.nextRoatetion)),
                x = this.imgNextX + 0.5*(width - width*Math.cos(this.nextRoatetion) + height*Math.sin(this.nextRoatetion))
            ctx.translate(x,y)
            ctx.rotate(this.nextRoatetion)
            ctx.scale(this.imgNextScale,this.imgNextScale)
            ctx.drawImage(this.img, 0, 0, this.img.width, this.img.height)
            ctx.restore()
            this.imgX = this.imgNextX
            this.imgY = this.imgNextY
            this.imgScale = this.imgNextScale
            this.rotation = this.nextRoatetion
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
            // smooth
            _ctx.imageSmoothingEnabled = true;
            _ctx.mozImageSmoothingEnabled = true;
            _ctx.webkitImageSmoothingEnabled = true;
            _ctx.msImageSmoothingEnabled = true;
            _ctx.drawImage(this.img, 0, 0, this.img.width, this.img.height)
            _ctx.restore()
            // _ctx.scale(1/8,1/8)
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
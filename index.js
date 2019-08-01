//入口文件
var window = GameGlobal
Object.assign(window, wx.getSystemInfoSync())
Object.assign(window, {
    canvas: sharedCanvas,
    context: sharedCanvas.getContext("2d"),
    cache: {},
    cc: {
        c3b(r, g, b) {
            var v = (r << 16) + (g << 8) + b
            return `#${v.toString(16)}`
        },
        p: (x, y) => ({
            x,
            y
        }),
        size: (w, h) => ({
            width: w,
            height: h
        }),
        rect: (x, y, width, height) => ({
            x,
            y,
            width,
            height,
            contains(pt) {
                var t = this
                return t.x < pt.x && t.x + t.width > pt.x && t.y < pt.y && t.y + t.height > pt.y
            }
        })
    }
})
//使用源覆盖模式
context.globalCompositeOperation = "source-over";
//抗锯齿
context.imageSmoothingEnabled = true
//矩阵乘法
function matMul(a, b) {
    var rs = []
    for (var i = 0; i < a.length; i += 3) {
        for (var m = 0; m < 3; m++) {
            var sum = 0
            for (var j = i; j < i + 3; j++) {
                sum += a[j] * b[j % 3 * 3 + m]
            }
            rs.push(sum)
        }
    }
    return rs
}
//节点对象
function Node() {
    this.x = 0
    this.y = 0
    this.anchorX = 0.5
    this.anchorY = 0.5
    this.width = 0
    this.height = 0
    this.scaleX = 1
    this.scaleY = 1
    this.rotate = 0
    this.parent = null
    this.sizeMode = "auto"
    this._isDirty = true //需要绘制
    this.children = []
}
//扩展方法
Node.prototype = {
    set isDirty(v) {
        this._isDirty = v
        render()
    },
    get isDirty() {
        return this._isDirty
    },
    get localMatrix() {
        var c = Math.cos(this.rotate)
        var s = Math.sin(this.rotate)
        var ox = (0.5 - this.anchorX) * this.width
        var oy = (0.5 - this.anchorY) * this.height
        return [this.scaleX * c, -this.scaleY * s, 0, this.scaleX * s, this.scaleY * c, 0, this.x + ox, this.y + oy, 1]
    },
    setAnchorPoint(x, y) {
        this.anchorX = x
        this.anchorY = y
        this.isDirty = true
    },
    setPosition(x, y) {
        this.x = x
        this.y = y
        this.isDirty = true
    },
    setScale(x, y) {
        y = y ? y : x
        this.scaleX = x
        this.scaleY = y
        this.isDirty = true
    },
    setRotation(deg) {
        //计算弧度
        deg = deg / 180 * Math.PI
        this.rotate = deg
        this.isDirty = true
    },
    getBoundingBox() {
        var pt = matMul([-this.width / 2, -this.height / 2, 1], this.worldMatrix)
        var rect = cc.rect(pt[0], pt[1], this.width, this.height);
        return rect
    },
    addEvent(obj) {
        this.listener = obj
    },
    _updateWorldMatrix() {
        //更新转换矩阵，假定父节点 世界矩阵是正确的
        this.worldMatrix = this.parent ? matMul(this.localMatrix, this.parent.worldMatrix) : this.localMatrix
    },
    removeAllChildren() {
        this.children = []
        this.isDirty = true
    },
    add(node) {
        node.parent = this
        this.children.push(node)
        node.isDirty = true
        return node
    },
    setContentSize(w, h) {
        this.sizeMode = "custom"
        this.width = h != null ? w : w.width
        this.height = h != null ? h : w.height
        this.isDirty = true
    },
    destory() {
        if (node.parent) {
            node.parent.children = node.parent.children.filter(v => v != this)
            node.parent = null
        }
        render()
    }
}

//渲染根节点，模拟场景
window.scene = new Node()

//渲染场景
window.render = function() {
    if (render.isDirty) {
        return
    }
    //标脏
    render.isDirty = true
    //下一次重绘之前 渲染
    requestAnimationFrame(() => {
        //重置转换矩阵
        context.setTransform(1, 0, 0, 1, 0, 0);
        //清空画布
        context.clearRect(0, 0, canvas.width, canvas.height);

        var draw = function(node, bUpdate) {
            var redraw = node.isDirty || bUpdate
            if (redraw) {
                //更新变动部分的矩阵
                node._updateWorldMatrix()
            }
            //Y轴 翻转,向下平移一个画布高度，使得坐标原点在 左下角
            context.setTransform(1, 0, 0, -1, 0, canvas.height);

            if (node.type) {
                var t = node.worldMatrix
                context.transform(t[0], t[1], t[3], t[4], t[6], t[7])
                context.scale(1, -1);
            }
            if (node.bClip) {
                context.save()
                //剪裁
                context.beginPath()
                context.rect(-node.width / 2, -node.height / 2, node.width, node.height)
                context.clip();
            }
            if (node.type == "sprite") {
                //绘制精灵
                if (node.texture) {
                    if (node.isScale9) {
                        //计算9个格子的位置大小
                        var x = -node.width / 2
                        var y = -node.height / 2
                        var cw = node.texture.width / 3
                        var ch = node.texture.height / 3
                        for (var i = 0; i < 3; i++) {
                            for (var j = 0; j < 3; j++) {
                                var sx = i * node.texture.width / 3
                                var sy = j * node.texture.height / 3
                                var tx = x + (i == 2 ? node.width - cw : i * cw)
                                var ty = y + (j == 2 ? node.height - ch : j * ch)
                                var tw = i == 1 ? node.width - 2 * cw : cw
                                var th = j == 1 ? node.height - 2 * ch : ch
                                context.drawImage(node.texture, sx, sy, cw, ch, tx, ty, tw, th)
                            }
                        }
                    } else {
                        context.drawImage(node.texture, -node.width / 2, -node.height / 2, node.width, node.height);
                    }
                }
            }
            if (node.type == "text") {
                //绘制文字
                context.fillStyle = node.color;
                context.font = node.fontSize + "px Arial";
                context.textAlign = "center";
                context.textBaseline = "middle";
                context.fillText(node.string, 0, 0, node.width);
            }
            node.children.forEach(v => draw(v, redraw))
            if (node.bClip) {
                //剪裁区域绘制完，恢复画布
                context.restore();
            }
            node.isDirty = false
        }
        draw(scene)
        render.isDirty = false
    });
}

//加载精灵
//@param {String} path 图片路径
//@param {Boolean} isScale9  九宫格缩放模式
window.loadSprite = function(path, isScale9) {
    var node = new Node
    node.type = "sprite"
    node.isScale9 = isScale9
    node.loadTexture = function(path) {
        if (!path) {
            this.texture = null
            return
        }
        var cb = img => {
            this.texture = img
            if (this.sizeMode == "auto") {
                this.width = img.width
                this.height = img.height
            }
            render()
        }
        var img = cache[path]
        if (!img) {
            img = wx.createImage()
            img.src = path
            img.onload = () => {
                cache[path] = img
                cb(img)
            }
        } else {
            cb(img)
        }
    }
    node.loadTexture(path)
    return node
}
//创建Text
//@param {String} txt 文字
//@param {Number} size 字体大小
//@param {cc.Color} color 颜色
//@usage
//  loadText("test",28,cc.Color(0,0,0))
window.loadText = function(txt, size, color) {
    var node = new Node
    node.type = "text"
    node.fontSize = size || 24
    node.color = color || cc.c3b(255, 255, 255)
    node.setString = function(str) {
        node.string = str
        context.font = node.fontSize + "px Arial";
        this.setContentSize(context.measureText(str).width, this.fontSize / 0.88)
        render()
    }
    node.setString("" + txt)
    return node
}

//创建滚动视图
//@param {cc.Size} size 视图大小
//@param {Object} def 
//@usage
//  loadListView(cc.size(500,400), {
//      itemMargin = 0          //项边距
//  })
window.loadListView = function(size, def) {
    var node = new Node
    node.setContentSize(size)
    node.type = "listview"
    node.curOffset = 0
    node.bClip = true
    node.itemMargin = def && def.itemMargin || 0
    node.content = node.add(new Node)
    node.add = function(item) {
        node.content.add(item)
        //计算列表项位置
        var curh = 0
        node.content.children.forEach(child => {
            child.setPosition(0, node.height / 2 - curh - child.height / 2)
            curh += child.height + node.itemMargin
        })
        //计算滚动边界
        var cntHeight = curh - node.itemMargin
        node.exceed = Math.max(0, cntHeight - node.height)
    }
    node.scroll = function(offset) {
        node.curOffset = Math.max(0, Math.min(this.exceed, node.curOffset + offset))
        node.content.setPosition(0, node.curOffset)
    }
    node.addEvent({
        onTouchMove: pt => node.scroll(pt.delta.y),
    })
    return node
}

//分发触摸事件
function doEvent(name, event) {
    if (!event.changedTouches) return;
    var pt = event.changedTouches[0]
    pt = [pt.clientX, pt.clientY, 1]
    //转换到视口坐标的矩阵
    var r = Math.min(2, devicePixelRatio)
    var sx = canvas.width / viewRect.width
    var sy = canvas.height / viewRect.height
    var mat = [r * sx, 0, 0, 0, -r * sy, 0, -viewRect.x * sx, (screenHeight * r - viewRect.y) * sy, 1]
    pt = matMul(pt, mat)
    pt = cc.p(pt[0], pt[1])
    var arr = []
    var valid = node => {
        node.listener && arr.push(node)
        node.children.forEach(v => valid(v))
    }
    valid(scene)
    for (var i = arr.length - 1; i >= 0; i--) {
        var v = arr[i]
        if (v.getBoundingBox().contains(pt)) {
            var p = doEvent.prePoint || pt
            //增加偏移量
            pt.delta = cc.p(pt.x - p.x, pt.y - p.y)
            if (v.listener[name]) {
                v.listener[name].call(v, pt)
            }
            doEvent.prePoint = pt
        }
    }
}
wx.onTouchStart(e => doEvent("onTouchBegan", e))
wx.onTouchMove(e => doEvent("onTouchMove", e))
wx.onTouchEnd(e => doEvent("onTouchEnded", e))
wx.onTouchCancel(e => doEvent("onTouchCancel", e))
window.viewRect = cc.rect(0, 0, canvas.width, canvas.height)
wx.onMessage(msg => {
    if (msg.event == "viewport") {
        //cocos引擎传入的子域视口区域
        viewRect = cc.rect(msg.x, msg.y, msg.width, msg.height)
        scene.setPosition(canvas.width / 2, canvas.height / 2)
        scene.removeAllChildren()

        var imgPath = "SubGame/res/images/"
        var data = [{
            nickname: "test",
            avatarUrl: `${imgPath}avatar.jpg`,
            score: 100
        }]
        data = data.concat(data)
        data = data.concat(data)
        data = data.concat(data)
        var list = scene.add(loadListView(cc.size(canvas.width, canvas.height - 20), {
            itemMargin: 4
        }))
        for (var i = 0; i < data.length; i++) {
            var v = data[i]
            var order = i + 1
            var bg = loadSprite(`${imgPath}item_bg.png`, true)
            bg.setContentSize(335, 82)
            //序号
            var rk = order <= 3 ? loadSprite(`${imgPath}no${order}.png`) : loadText(order, 24, cc.c3b(145, 102, 70))
            rk.setPosition(-136, 0)
            if (order <= 3) {
                rk.setContentSize(48, 46)
            }
            bg.add(rk)
            //昵称
            var nick = bg.add(loadText(v.nickname, 24, cc.c3b(145, 102, 70)))
            nick.setPosition(-44, 17)
            nick.setAnchorPoint(0, 0.5)
            //头像
            var head = bg.add(loadSprite(v.avatarUrl))
            head.setPosition(-79, 0)
            head.setContentSize(52, 52)
            //分数
            var score = bg.add(loadText(v.score, 24, cc.c3b(145, 102, 70)))
            score.setPosition(-44, -15)
            score.setAnchorPoint(0, 0.5)
            list.add(bg)
        }
    }
})
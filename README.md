# 微信开放数据域接口
#### 与cocos creator一起使用，体积小，使用简单易扩展
---
### 用法  
1. 将文件复制到微信子域目录  
2. Creator需要显示子域的节点添加WXSubContextView组件,子域的内容会适配到节点的大小。      
3. 微信开发者工具打开工程目录查看效果

### 方法
 setPosition、  setContentSize、 setAnchorPoint、 setScale、 setRotation、 getBoundingBox、 removeAllChildren、 add、 destory  
 1. loadSprite(path, isScale9) 创建精灵   
 2. loadText(txt, size, color) 创建文本  
 3. loadListView(size, def) 创建滚动视图  
### 扩展
node.addEvent({  
  onTouchBegan:()=>{},  
  onTouchMove:()=>{},  
  onTouchEnded:()=>{},  
  onTouchCancel:()=>{}  
})

### 实例-排行榜
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

# 微信排行榜
#### 与cocos creator一起使用，体积小，使用简单易扩展
---
### 用法  
1. 将文件复制到微信子域目录  
2. Creator需要显示子域的节点添加WXSubContextView组件,子域的内容会适配到节点的大小。      
3. 微信开发者工具打开工程目录查看效果

### 方法
 setPosition、  setContentSize、 setAnchorPoint、 setScale、 setRotation、 getBoundingBox、 removeAllChildren、 add、 destory  
 1. cc.Sprite(path, isScale9) 创建精灵   
 2. cc.Label(txt, size, color) 创建文本  
 3. cc.ListView(size, def) 创建滚动视图  
### 扩展
node.addEvent({  
  onTouchBegan:()=>{},  
  onTouchMove:()=>{},  
  onTouchEnded:()=>{},  
  onTouchCancel:()=>{}  
})

### 实例-排行榜
![rank](https://raw.githubusercontent.com/zx6733090/wxSubContext/master/demo/creator.png)   

        创建listview
        var list = cc.ListView(cc.size(canvas.width, canvas.height - 20), {
            itemMargin: 4 //指定边距
        }
        创建列表项背景，设置九宫格为true
        var item = cc.Sprite(`${imgPath}item_bg.png`, true)
        ////////////////添加子节点
        //创建昵称
        var nick = cc.Label(nickname, 24, cc.c3b(145, 102, 70))
        //设置位置，锚点等
        nick.setPosition(..)
        nick.setAnchorPoint(...)
        //创建头像
        var avatar = cc.Sprite(avatarUrl)
        //添加到父节点
        item.add(nick)
        item.add(avatar)
        //将list添加到场景
        scene.add(list)  
 ![rank](https://raw.githubusercontent.com/zx6733090/wxSubContext/master/demo/rank.gif "排行榜")
        

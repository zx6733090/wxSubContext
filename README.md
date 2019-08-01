# 微信开放数据域接口
#### 与cocos creator一起使用，体积小，使用简单易扩展
---
### 用法  
1. 将文件复制到微信子域目录  
2. Creator需要显示子域的节点添加组件    
    >node.setContentSize(400,400)  
     node.addComponent(cc.WXSubContextView)  
   
      子域的内容会适配到节点的大小。
3. 微信开发者工具打开工程目录查看效果

### API
1. loadSprite(path, isScale9) 创建精灵  
@param {String} path 图片路径  
@param {Boolean} isScale9  九宫格缩放模式  
@usage  
   >var sprite = loadSprite(path, isScale9)  
   >scene.add(sprite)`

2. loadText(txt, size, color) 创建文本  
@param {String} txt 文字  
@param {Number} size 字体大小  
@param {cc.Color} color 颜色  
@usage  
   >var txt = loadText("test",28,cc.Color(0,0,0))  
   >scene.add(txt)`
   
3. loadListView(size, def) 创建滚动视图
@param {cc.Size} size 视图大小  
@param {Object} def  
@usage  
   >var list = loadListView(cc.size(500,400), {  
   >   itemMargin = 0          //项边距  
   >})  
   >scene.add(list)
   
### 支持的通用方法,使用和cocos一样，坐标系也是一致的
+ setPosition
+ setContentSize
+ setAnchorPoint
+ setScale
+ setRotation
+ getBoundingBox
+ removeAllChildren
+ add
+ destory
### 扩展
node.addEvent({  
  onTouchBegan:()=>{},  
  onTouchMove:()=>{},  
  onTouchEnded:()=>{},  
  onTouchCancel:()=>{}  
})

// 当前的canvas 对象设计的
import { fabric } from "fabric"

class FabricBoard {
    private _canvas: fabric.Canvas;
    toolName: string;
    constructor(el: HTMLCanvasElement, options: {
        width: number, 
        height: number
    }) {
        // 开始创建
       this. _canvas = new fabric.Canvas(el, {
            width: options.width,
            height: options.height,
            isDrawingMode: true,
            skipTargetFind: true,
            selection: false,
            
            backgroundColor: "#ffffff"
         })
         // 设置默认图标
         this._canvas.defaultCursor = 'auto';
         // 默认设置为画笔即可
         this.toolName = 'pen';
        // 设置默认的画笔和颜色
        this.setBrushColorAndWidth("#E34f51", 1);
        this.initMouseEvents()
    }
    // 设置画笔颜色和大小
    setBrushColorAndWidth(
        color: string,
        width: number
    ) {
        this._canvas.freeDrawingBrush.color = color;
        this._canvas.freeDrawingBrush.width = width;  
    }
    setBrushColor(color: string) {
        this._canvas.freeDrawingBrush.color = color;
    }
    setBrushWidth(width: number) {
        this._canvas.freeDrawingBrush.width = width;  
    }
    initMouseEvents() {
        this.onMouseDownEvent()
        this.onMouseMoveEvent();
        this.onMouseUpEvent();
    }
    setToolName(name: string) {
        this.toolName = name;
        
    }
    // 增加事件
    onMouseDownEvent() {
        this._canvas.on('mouse:down', (event) => {
            const pointer = this._canvas.getPointer(event.e);
            const x = pointer.x;
            const y = pointer.y;
            if(this.toolName === 'pen') {
                this.setPen(x,y);
            }
            if(this.toolName === 'circle' ) {
                this.setCircle(x, y)
            }
            if(this.toolName === 'rectangle') {
                this.setRectangle(x, y);
            }
        })
    }
    setRectangle(x: number, y: number) {
        const rect = new fabric.Rect({
            left: x,
            top: y,
            width: 100,
            height: 100,
          });
          this._canvas.add(rect);
          // this._canvas.setActiveObject(rect);
    }
    setCircle(x: number, y: number) {
        const circle = new fabric.Circle({
            left: x,
            top: y,
            radius: 50,
            // fill: currentColor,
            // stroke: currentColor,
            // strokeWidth: currentThickness
          });
          this._canvas.add(circle);
          // this._canvas.setActiveObject(circle);
    }
    setPen(x: Number, y: Number) {
        const path = new fabric.Path(`M ${x} ${y}`);
        
        this._canvas.add(path);
        // this._canvas.setActiveObject(path);
    }
    onMouseMoveEvent() {
        this._canvas.on('mouse:move', (event) => {

            if(this.toolName ==='pen' && this._canvas.getActiveObject()) {
                console.log('---onMouseMoveEvent')
                const pointer = this._canvas.getPointer(event.e);
                const x = pointer.x;
                const y = pointer.y;

                const path = this._canvas.getActiveObject() as fabric.Path;
                 
                const pathData = path?.path[0] + `L ${x} ${y}`
                path.set({
                    path: pathData
                }) 
            }
            this.render();
        })
    }
    onMouseUpEvent() {

    }
    // clear
    clear() {
        this._canvas.clear();
    }
    // 开始render
    render() {
        this._canvas.requestRenderAll();
    }
}

export default FabricBoard;
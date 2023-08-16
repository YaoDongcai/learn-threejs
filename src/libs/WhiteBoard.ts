//  声明为class 的类
interface Point {
    x: number;
    y: number;
}
// 画笔类
interface StrokeStyle {
    color: string; // 画笔颜色
    lineWidth: number;// 画笔粗细
}
class WhiteBoard {
    canvas: HTMLCanvasElement; // 挂载的位置
    context: CanvasRenderingContext2D; // canvas的上下文
    isDrawing: boolean; // 是否为在画的过程
    lastPosoition: Point; // 最后的位置
    strokeStyle: StrokeStyle;
    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        
        const res = canvas.getContext("2d");
        if(!res) {
            throw new Error("当前的画布示例为空")
        }
        this.context = res;
        // 设置默认画笔
        this.context.strokeStyle = "red";
        this.context.lineWidth = 2;
        this.isDrawing = false;
        this.lastPosoition = {
            x: 0,
            y: 0
        }
        // 开始绑定事件
        this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
        this.canvas.addEventListener('mousemove', this.draw.bind(this));
        this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));
    }
    // 开始绘图
    startDrawing() {
     this.isDrawing = true;
     // 开始绘图
     // 获取位置信息
     this.lastPosoition = this.getPosition(event)
    }
    stopDrawing() {
        this.isDrawing = false;
    }
    // 正在绘图
    draw(event: MouseEvent) {
        if(!this.isDrawing) return;
        const currentPosition = this.getPosition(event);

        this.context.beginPath();
        this.context.moveTo(this.lastPosoition.x, this.lastPosoition.y);
        this.context.lineTo(currentPosition.x, currentPosition.y);
        this.context.stroke();
        // 开始重新设置位置信息
        this.lastPosoition = currentPosition;
    }
    getPosition(event: MouseEvent): Point {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y : event.clientY - rect.top
        }
    }
}


export default WhiteBoard;
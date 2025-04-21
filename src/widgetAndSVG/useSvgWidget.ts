import vtkInteractorObserver from "@kitware/vtk.js/Rendering/Core/InteractorObserver";
import { bindSVGRepresentation, makeListenableSVGNode } from './SnabbdomHelpers.js'

const { computeWorldToDisplay } = vtkInteractorObserver

const spanTextStyle = {
  position: 'absolute',
  fontSize: '14px',
  cursor: 'move',
  backgroundColor: 'white',
  padding: '2px 5px',
  border: '1px solid black',
  borderRadius: '4px',
  pointerEvents: 'auto',
}

export const useWidgetAndSVG = ({ widgetManager }: any) => {
  // 初始化 Snabbdom
  let isDragging = false;
  const setWidgetSVG = (opts: any) => {
    const { widget, renderer, handle } = opts
    const data =  {
      widgetType: '',// widget类型
      widgetId: '', // widget唯一标识
      textOffsetX: 0, // 偏移量X
      textOffsetY: 0, // 偏移量Y
      text: '龋病', // 文本内容
      handleList: [], // 处理器列表
      coords: [], // 坐标列表
    }
    return bindSVGRepresentation(renderer, widget.getWidgetState(), {
      mapState(widgetState: any, { size }: any) {
        data.coords = []
        data.handleList = []
        data.textOffsetX = data.textOffsetX || 0;
        data.textOffsetY = data.textOffsetY || 0;
        if (!handle.getVisibility()) return data
        // console.log('---widgetState', widgetState)
        const handleList = [widgetState.getHandle1(), widgetState.getHandle2()]
        handleList.forEach((item: any) => {
          const origin = item.getOrigin()
          if (origin) {
            const coords = computeWorldToDisplay(renderer, ...origin)
            data.coords.push([coords[0], size[1] - coords[1]])
          }
        })

        const moveOrigin = widgetState.getMoveHandle().getOrigin()
        if (moveOrigin) {
          const moveCoords = computeWorldToDisplay(renderer, ...moveOrigin)
          data.coords.push([moveCoords[0], size[1] - moveCoords[1]])
        }
        return data
      },
      render(data: any, h: any) {
        const nodes: any[] = []
        const labels: any[] = []
        if (!data || data.coords.length < 2) return { nodes, labels }

        data.coords.forEach((item: number[], idx: number) => {
          if (idx === data.coords.length - 1) return
          const [x1, y1] = data.coords[idx]
          const [x2, y2] = data.coords[idx + 1]
          const line = {
            key: 'polyline',
            attrs: { stroke: 'green', fill: 'none', x1, y1, x2, y2 },
          }
          const lineH = h('line', line)
          nodes.push(lineH)
        })

        const [x1, y1] = data.coords[0]
        const [x2, y2] = data.coords[1]
        const polyLineStart = [(x1 + x2) / 2, (y1 + y2) / 2]
        const dashedLine = {
          key: 'dashedLine',
          attrs: {
            stroke: 'red',
            fill: 'none',
            'stroke-dasharray': '2 2',
            x1: polyLineStart[0],
            y1: polyLineStart[1],
            x2: x1,
            y2: y1 + 40,
          },
        }
        const dashedlineH = h('line', dashedLine)
        nodes.push(dashedlineH)
        const spanText = h(
          'span',
          {
            style: {
              ...spanTextStyle,
              left: `${x2 + (data.textOffsetX || 0)}px`, // 添加偏移量
              top: `${y2 + (data.textOffsetY || 0)}px`,  // 添加偏移量
              cursor: 'move',  // 修改为移动光标
            },
            on: {
              mousedown: (event:MouseEvent) => {
                event.stopPropagation(); // 阻止事件冒泡
                // 暂时禁用VTK交互器
                const interactor = renderer.getRenderWindow().getInteractor();
                const wasActive = interactor.getEnabled();
                interactor.setEnabled(false);
                isDragging = true;
                // 初始化拖拽状态
                const startX = event.clientX;
                const startY = event.clientY;
                const initialOffsetX = data.textOffsetX || 0;
                const initialOffsetY = data.textOffsetY || 0;
                
                // 拖拽过程处理
                const handleMouseMove = (event: MouseEvent) => {  
                  event.stopPropagation(); // 阻止事件冒泡
                  if (isDragging) {
                    const dx = event.clientX - startX;
                    const dy = event.clientY - startY;
                    data.textOffsetX = initialOffsetX + dx; // 更新偏移量
                    data.textOffsetY = initialOffsetY + dy; // 更新偏移量
                    const widgetState = widget.getWidgetState()
                    widgetState.modified()
                  }
                }
                // 结束拖拽
                const handleMouseUp = () => {
                  if (wasActive) interactor.setEnabled(true);
                  isDragging = false;
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };
        
                // 绑定事件监听
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }
            },
          },
          '龋病',
        )
        labels.push(spanText)
        return { nodes, labels }
      },
    })
  }

  // 删除widget
  const removeWidgetAndSVG = (obj: any) => {
    const { widgetId } = obj
    widgetManager = widgetManager || obj.widgetManager;
    const widgetList = widgetManager.getWidgets()
    widgetList.forEach((widget: any) => {
      const id = widget.get()?.widgetId
      if (id && +id === widgetId) {
        // 清除svg
        widget.get()?.cleanSVG()
        // 移除widget
        widgetManager.removeWidget(widget)
      }
    })
  }

// 显示隐藏widget
  const showOrHideWidgetAndSVG = (obj: any) => {
    const { widgetId, isShow } = obj;
    widgetManager = widgetManager || obj.widgetManager;
    const widgetList = widgetManager.getWidgets()
    widgetList.forEach((widget: any) => {
      const id = widget.get()?.widgetId
      if (id && +id === widgetId) {
        let visibility = isShow === undefined ? widget.getVisibility() : isShow
        widget.setVisibility(!visibility)
        // 触发widgetstate 的更新，保证svg 更新
        widget.getWidgetState().modified()
        widget.getInteractor().render();
      }
    })
  }
  return {
    setWidgetSVG,
    removeWidgetAndSVG,
    showOrHideWidgetAndSVG
  }
}

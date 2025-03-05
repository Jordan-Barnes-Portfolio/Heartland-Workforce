import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { MetricsWidget } from '@/components/widgets/MetricsWidget';
import { ProjectsWidget } from '@/components/widgets/ProjectsWidget';
import { PartnersWidget } from '@/components/widgets/PartnersWidget';
import { WikiWidget } from '@/components/widgets/WikiWidget';
import { AIAssistantWidget } from '@/components/widgets/AIAssistantWidget';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Plus, RotateCcw } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import type { Widget } from '@/types/widget';
import { useDashboardState } from '@/hooks/use-dashboard-state';
import _ from 'lodash';

const ResponsiveGridLayout = WidthProvider(Responsive);

const SIDEBAR_EXPANDED_WIDTH = 280;
const SIDEBAR_COLLAPSED_WIDTH = 62;

const initialWidgets: Widget[] = [
  {
    id: 'projects',
    type: 'projects',
    title: 'Projects',
    layout: { i: 'projects', x: 6, y: 0, w: 5, h: 4, minW: 3, minH: 3, maxH: 8 },
  },
  {
    id: 'partners',
    type: 'partners',
    title: 'Partners',
    layout: { i: 'partners', x: 0, y: 0, w: 5, h: 4, minW: 3, minH: 3, maxH: 8 },
  },
  {
    id: 'wiki',
    type: 'wiki',
    title: 'Wiki',
    layout: { i: 'wiki', x: 0, y: 4, w: 5, h: 4, minW: 3, minH: 3, maxH: 8 },
  },
  {
    id: 'ai-assistant',
    type: 'ai-assistant',
    title: 'AI Assistant',
    layout: { i: 'ai-assistant', x: 6, y: 4, w: 5, h: 4, minW: 3, minH: 3, maxH: 8 },
  }
];

export function Dashboard() {
  const [containerWidth, setContainerWidth] = useState(0);
  const { toast } = useToast();
  const {
    widgets,
    setWidgets,
    error,
    resetLayout,
  } = useDashboardState(initialWidgets);

  // Handle sidebar state changes
  useEffect(() => {
    const handleSidebarChange = (event: CustomEvent<{ collapsed: boolean }>) => {
      const sidebarWidth = event.detail.collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH;
      const mainContentWidth = window.innerWidth - sidebarWidth;
      setContainerWidth(mainContentWidth);
    };

    const handleResize = _.debounce(() => {
      const sidebarElement = document.querySelector('[class*="w-80"], [class*="w-13"]');
      const sidebarWidth = sidebarElement?.classList.contains('w-80') ? 
        SIDEBAR_EXPANDED_WIDTH : SIDEBAR_COLLAPSED_WIDTH;
      const mainContentWidth = window.innerWidth - sidebarWidth;
      setContainerWidth(mainContentWidth);
    }, 100);

    window.addEventListener('sidebarStateChange', handleSidebarChange as EventListener);
    window.addEventListener('resize', handleResize);

    // Initial width calculation
    handleResize();

    return () => {
      window.removeEventListener('sidebarStateChange', handleSidebarChange as EventListener);
      window.removeEventListener('resize', handleResize);
      handleResize.cancel();
    };
  }, []);

  const handleAddWidget = (type: Widget['type']) => {
    const id = `${type}-${Date.now()}`;
    const newWidget: Widget = {
      id,
      type,
      title: _.startCase(type),
      layout: {
        i: id,
        x: (widgets.length * 6) % 12,
        y: Infinity,
        w: 6,
        h: 4,
        minW: 3,
        minH: 3,
        maxH: 8,
      },
    };

    setWidgets([...widgets, newWidget]);
    toast({
      title: 'Widget Added',
      description: `Added ${newWidget.title} widget to the dashboard.`,
    });
  };

  const handleRemoveWidget = (id: string) => {
    setWidgets(widgets.filter((widget) => widget.id !== id));
    toast({
      title: 'Widget Removed',
      description: 'Widget has been removed from the dashboard.',
    });
  };

  const handleLayoutChange = useCallback((layout: any) => {
    setWidgets(
      widgets.map((widget) => {
        const newLayout = layout.find((l: any) => l.i === widget.layout.i);
        if (newLayout) {
          return {
            ...widget,
            layout: {
              ...widget.layout,
              ...newLayout,
            },
          };
        }
        return widget;
      })
    );
  }, [widgets, setWidgets]);

  const renderWidget = (widget: Widget) => {
    switch (widget.type) {
      case 'metrics':
        return (
          <MetricsWidget
            key={widget.id}
            widget={widget}
            onRemove={handleRemoveWidget}
          />
        );
      case 'projects':
        return (
          <ProjectsWidget
            key={widget.id}
            widget={widget}
            onRemove={handleRemoveWidget}
          />
        );
      case 'partners':
        return (
          <PartnersWidget
            key={widget.id}
            widget={widget}
            onRemove={handleRemoveWidget}
          />
        );
      case 'wiki':
        return (
          <WikiWidget
            key={widget.id}
            widget={widget}
            onRemove={handleRemoveWidget}
          />
        );
      case 'ai-assistant':
        return (
          <AIAssistantWidget
            key={widget.id}
            widget={widget}
            onRemove={handleRemoveWidget}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-auto bg-gray-50 p-5">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}
          <div className="mb-4 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={resetLayout}
              className="text-gray-600 hover:text-gray-900"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset Layout
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Widget
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleAddWidget('metrics')}>
                  Add Metrics Widget
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddWidget('projects')}>
                  Add Projects Widget
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddWidget('partners')}>
                  Add Partners Widget
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddWidget('wiki')}>
                  Add Wiki Widget
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddWidget('ai-assistant')}>
                  Add AI Assistant Widget
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <ResponsiveGridLayout
            className="layout"
            layouts={{
              lg: widgets.map((widget) => widget.layout),
            }}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={100}
            width={containerWidth}
            margin={[14, 14]}
            onLayoutChange={handleLayoutChange}
            draggableHandle=".drag-handle"
            resizeHandles={['s', 'e', 'se', 'sw', 'w', 'nw', 'n', 'ne']}
            isResizable={true}
            useCSSTransforms={true}
            allowOverlap={false}
            preventCollision={false}
            isBounded={true}
            compactType="vertical"
            containerPadding={[0, 0]}
          >
            {widgets.map((widget) => (
              <div key={widget.layout.i}>{renderWidget(widget)}</div>
            ))}
          </ResponsiveGridLayout>
        </main>
      </div>
    </div>
  );
}
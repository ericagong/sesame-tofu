import * as React from 'react';
import {
  Tabs as UITabs,
  TabsList as UITabsList,
  TabsTrigger as UITabsTrigger,
  TabsContent as UITabsContent,
} from '@/shared/core/tabs';
import { cn } from '@/shared/lib/utils';

// ============ Types ============

type TabsRootProps = React.ComponentProps<typeof UITabs>;

type TabsListProps = React.ComponentProps<typeof UITabsList>;

type TabsTriggerProps = React.ComponentProps<typeof UITabsTrigger>;

type TabsContentProps = React.ComponentProps<typeof UITabsContent>;

// ============ Components ============

const TabsRoot = ({ className, ...props }: TabsRootProps) => (
  <UITabs className={cn('w-full', className)} {...props} />
);
TabsRoot.displayName = 'Tabs';

const TabsList = ({ className, ...props }: TabsListProps) => (
  <UITabsList className={cn('w-full justify-start', className)} {...props} />
);
TabsList.displayName = 'Tabs.List';

const TabsTrigger = ({ className, ...props }: TabsTriggerProps) => (
  <UITabsTrigger className={cn(className)} {...props} />
);
TabsTrigger.displayName = 'Tabs.Trigger';

const TabsContent = ({ className, ...props }: TabsContentProps) => (
  <UITabsContent className={cn(className)} {...props} />
);
TabsContent.displayName = 'Tabs.Content';

// ============ Export ============

const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
});

export default Tabs;

import type { LayoutProps } from '@rspress/core/theme-original';
import { Layout as BasicLayout } from '@rspress/core/theme-original';
import './index.css';

export * from '@rspress/core/theme-original';

export function Layout(props: LayoutProps) {
  return (
    <>
      <BasicLayout {...props} />
      <footer className="astra-icp-filing">
        <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">苏ICP备2026069409号-1</a>
      </footer>
    </>
  );
}

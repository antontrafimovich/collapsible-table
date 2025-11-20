import { ConfigProvider, Layout, Typography } from 'antd';
import React from 'react';
import { CollapsibleGridDemo } from './CollapsibleGrid';

const { Header, Content } = Layout;

const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 8,
        },
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        <Header
          style={{
            background: '#001529',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            paddingInline: 24,
          }}
        >
          <Typography.Title level={4} style={{ color: '#fff', margin: 0 }}>
            Collapsible Grid Demo
          </Typography.Title>
        </Header>
        <Content style={{ padding: 24, background: '#f5f5f5' }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <Typography.Paragraph style={{ marginBottom: 16 }}>
              Click any header cell to expand/collapse its column. At least two columns stay expanded,
              and collapsed columns stay visible with a compact width. Rows mirror the same expanded set.
            </Typography.Paragraph>
            <CollapsibleGridDemo />
          </div>
        </Content>
      </Layout>
    </ConfigProvider>
  );
};

export default App;

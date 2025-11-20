import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { Card, Collapse, Divider, Flex, Space, Tag, Typography } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';

export type HeaderCell = {
  id: string;
  title: string;
};

export type Row = {
  id: string;
  blocks: Record<string, ReactNode>;
};

type Props = {
  headers: HeaderCell[];
  rows: Row[];
};

const MIN_EXPANDED = 2;
const getCollapsedWidthCh = (title: string) => Math.max(title.length + 4, 8); // title + icon allowance

export const CollapsibleGrid: React.FC<Props> = ({ headers, rows }) => {
  const initialExpanded = useMemo(() => {
    if (headers.length <= MIN_EXPANDED) {
      return headers.map((h) => h.id);
    }
    return headers.slice(0, -1).map((h) => h.id); // collapse last by default
  }, [headers]);

  const [expanded, setExpanded] = useState<Set<string>>(new Set(initialExpanded));
  const [openRows, setOpenRows] = useState<Set<string>>(() => new Set(rows.map((r) => r.id)));

  useEffect(() => {
    // Keep row toggle state in sync with incoming rows while preserving user toggles
    setOpenRows((prev) => {
      const next = new Set<string>();
      rows.forEach((row) => {
        if (prev.has(row.id)) {
          next.add(row.id);
        }
      });
      // add any new rows as expanded by default
      rows.forEach((row) => next.add(row.id));
      return next;
    });
  }, [rows]);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      const isExpanded = prev.has(id);
      if (isExpanded && prev.size <= MIN_EXPANDED) {
        return prev; // keep at least two expanded
      }
      if (isExpanded) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const { headerTemplate, valueTemplate } = useMemo(() => {
    const headerTemplateStr = headers
      .map((header) => (expanded.has(header.id) ? '1fr' : `${getCollapsedWidthCh(header.title)}ch`))
      .join(' ');
    // collapsed columns get 0 width so visible columns divide space equally
    const valueTemplateStr = headers
      .map((header) => (expanded.has(header.id) ? '1fr' : '0px'))
      .join(' ');
    return { headerTemplate: headerTemplateStr, valueTemplate: valueTemplateStr };
  }, [headers, expanded]);

  const headerCells = headers.map((header) => {
    const isExpanded = expanded.has(header.id);
    const collapsedWidthCh = getCollapsedWidthCh(header.title);
    return (
      <button
        key={header.id}
        onClick={() => toggle(header.id)}
        style={{
          width: '100%',
          minWidth: isExpanded ? 140 : `${collapsedWidthCh}ch`,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          border: '1px solid var(--ant-color-border, #d9d9d9)',
          background: 'var(--ant-color-bg-container, #fff)',
          borderRadius: 6,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        <CaretRightOutlined rotate={isExpanded ? 90 : 0} />
        <Typography.Text ellipsis style={{ fontWeight: 500, width: '100%' }}>
          {header.title}
        </Typography.Text>
      </button>
    );
  });

  return (
    <Card size="small" bodyStyle={{ padding: 16 }}>
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: headerTemplate,
            gap: 8,
            alignItems: 'stretch',
          }}
        >
          {headerCells}
        </div>
        <Divider style={{ margin: '8px 0' }} />
        <Collapse
          rootClassName="collapsible-grid-collapse"
          bordered={false}
          activeKey={[...openRows]}
          onChange={(keys) => {
            const list = Array.isArray(keys) ? keys : [keys];
            setOpenRows(new Set(list as string[]));
          }}
          expandIconPosition="end"
          items={rows.map((row) => ({
            key: row.id,
            label: (
              <Flex align="center" gap={8}>
                <Typography.Text strong>{row.id}</Typography.Text>
                <Typography.Text type="secondary">Row</Typography.Text>
              </Flex>
            ),
            children: (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: valueTemplate,
                  gap: 8,
                  alignItems: 'start',
                  width: '100%',
                }}
              >
                {headers.map((header, idx) => {
                  const isExpanded = expanded.has(header.id);
                  if (!isExpanded) {
                    return <div key={header.id} style={{ gridColumn: idx + 1, display: 'none' }} />;
                  }
                  return (
                    <Flex
                      key={header.id}
                      vertical
                      style={{
                        gridColumn: idx + 1,
                        minWidth: 0,
                      }}
                      gap={4}
                    >
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        {header.title}
                      </Typography.Text>
                      <div>{row.blocks[header.id]}</div>
                    </Flex>
                  );
                })}
              </div>
            ),
          }))}
        />
      </Space>
    </Card>
  );
};

// Demonstration with placeholder data. Remove or swap with your own.
export const CollapsibleGridDemo: React.FC = () => {
  const headers: HeaderCell[] = [
    { id: 'status', title: 'Status' },
    { id: 'owner', title: 'Owner' },
    { id: 'progress', title: 'Progress' },
    { id: 'notes', title: 'Notes' },
  ];

  const rows: Row[] = [
    {
      id: 'row-1',
      blocks: {
        status: <Tag color="green">Ready</Tag>,
        owner: 'Alice',
        progress: '64%',
        notes: 'Waiting on final QA pass.',
      },
    },
    {
      id: 'row-2',
      blocks: {
        status: <Tag color="blue">In progress</Tag>,
        owner: 'Bob',
        progress: '35%',
        notes: 'Backend contract confirmed.',
      },
    },
  ];

  return <CollapsibleGrid headers={headers} rows={rows} />;
};

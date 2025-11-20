import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { Card, Collapse, Divider, Flex, Space, Tag, Typography } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';

export type HeaderCell = {
  id: string;
  title: string;
  addonRight?: ReactNode;
  addonBelow?: ReactNode;
  renderHeader?: (args: { header: HeaderCell; isExpanded: boolean }) => ReactNode;
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
      const expandedIds = headers.filter((h) => prev.has(h.id)).map((h) => h.id);
      const collapsedIds = headers.filter((h) => !prev.has(h.id)).map((h) => h.id);

      // With max 3 columns and rule of 2 visible, we only ever allow one collapsed at a time.
      if (isExpanded) {
        if (prev.size === MIN_EXPANDED) {
          if (collapsedIds.length === 1) {
            // Swap: previously collapsed becomes expanded, clicked becomes collapsed
            const collapsedId = collapsedIds[0];
            next.add(collapsedId);
            next.delete(id);
            return next;
          }
          return prev; // already at minimum and nothing to swap
        }
        next.delete(id); // collapse one when all are expanded
      } else {
        // Clicking a collapsed column expands it; if already one collapsed, we end up with all expanded
        if (collapsedIds.length === 1) {
          next.add(id);
        } else {
          next.add(id);
        }
      }
      return next;
    });
  };

  const { headerTemplate, valueTemplate } = useMemo(() => {
    const collapsedList = headers.filter((h) => !expanded.has(h.id));
    const collapsedId = collapsedList[0]?.id;
    if (!collapsedId) {
      const tmpl = headers.map(() => '1fr').join(' ');
      return { headerTemplate: tmpl, valueTemplate: tmpl };
    }

    const collapsedHeader = headers.find((h) => h.id === collapsedId)!;
    const collapsedWidth = `${getCollapsedWidthCh(collapsedHeader.title)}ch`;

    let firstExpandedAssigned = false;
    const headerTemplateArr = headers.map((header) => {
      if (header.id === collapsedId) {
        return collapsedWidth;
      }
      if (!firstExpandedAssigned) {
        firstExpandedAssigned = true;
        return '50%';
      }
      return `calc(50% - ${collapsedWidth})`;
    });

    firstExpandedAssigned = false;
    const valueTemplateArr = headers.map((header) => {
      if (header.id === collapsedId) {
        return '0px';
      }
      if (!firstExpandedAssigned) {
        firstExpandedAssigned = true;
        return '50%';
      }
      return '50%';
    });

    return {
      headerTemplate: headerTemplateArr.join(' '),
      valueTemplate: valueTemplateArr.join(' '),
    };
  }, [headers, expanded]);

  const headerCells = headers.map((header) => {
    const isExpanded = expanded.has(header.id);
    const collapsedWidthCh = getCollapsedWidthCh(header.title);

    const defaultHeader = (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Typography.Text ellipsis style={{ fontWeight: 500, flex: 1 }}>
            {header.title}
          </Typography.Text>
          {header.addonRight}
        </div>
        {header.addonBelow && <div>{header.addonBelow}</div>}
      </div>
    );

    const content = header.renderHeader
      ? header.renderHeader({ header, isExpanded })
      : defaultHeader;

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
        {content}
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
            children: (() => {
              let visibleOrder = 0;
              return (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: valueTemplate,
                    gap: 0,
                    alignItems: 'start',
                    width: '100%',
                  }}
                >
                  {headers.map((header, idx) => {
                    const isExpanded = expanded.has(header.id);
                    if (!isExpanded) {
                      return <div key={header.id} style={{ gridColumn: idx + 1, display: 'none' }} />;
                    }
                    const order = visibleOrder++;
                    return (
                      <Flex
                        key={header.id}
                        vertical
                        style={{
                          gridColumn: idx + 1,
                          minWidth: 0,
                          borderLeft: order > 0 ? '1px solid #e5e5e5' : 'none',
                          paddingLeft: order > 0 ? 12 : 0,
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
              );
            })(),
          }))}
        />
      </Space>
    </Card>
  );
};

// Demonstration with placeholder data. Remove or swap with your own.
export const CollapsibleGridDemo: React.FC = () => {
  const headers: HeaderCell[] = [
    {
      id: 'status',
      title: 'Status',
      renderHeader: () => (
        <Flex align="center" gap={8} justify="space-between">
          <Typography.Text style={{ fontWeight: 500 }}>Status</Typography.Text>
          <Tag color="green">Live</Tag>
        </Flex>
      ),
    },
    {
      id: 'owner',
      title: 'Owner',
      renderHeader: ({ isExpanded }) => (
        <Flex vertical gap={4}>
          <Typography.Text style={{ fontWeight: 500 }}>Owner</Typography.Text>
          {isExpanded && <Typography.Text type="secondary">Team A</Typography.Text>}
        </Flex>
      ),
    },
    { id: 'notes', title: 'Notes' },
  ];

  const rows: Row[] = [
    {
      id: 'row-1',
      blocks: {
        status: <Tag color="green">Ready</Tag>,
        owner: 'Alice',
        notes: 'Waiting on final QA pass.',
      },
    },
    {
      id: 'row-2',
      blocks: {
        status: <Tag color="blue">In progress</Tag>,
        owner: 'Bob',
        notes: 'Backend contract confirmed.',
      },
    },
  ];

  return <CollapsibleGrid headers={headers} rows={rows} />;
};

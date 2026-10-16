import React from 'react';
import {
  Card,
  ResourceList,
  ResourceItem,
  TextStyle,
  Badge,
  Pagination
} from '@shopify/polaris';

interface Log {
  id: string;
  action: string;
  status: 'success' | 'error' | 'warning';
  details: any;
  createdAt: string;
}

interface LogsViewProps {
  moduleId: string;
}

const LogsView: React.FC<LogsViewProps> = ({ moduleId }) => {
  const [logs, setLogs] = React.useState<Log[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);

  const fetchLogs = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/logs/module/${moduleId}?limit=10&offset=${(page - 1) * 10}`
      );
      const data = await response.json();
      setLogs(data.logs);
      setTotalPages(Math.ceil(data.pagination.total / data.pagination.limit));
      setLoading(false);
    } catch (err) {
      setError('Failed to load logs');
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchLogs();
  }, [moduleId, page]);

  const renderLog = (log: Log) => {
    const { id, action, status, details, createdAt } = log;

    return (
      <ResourceItem
        id={id}
        accessibilityLabel={`View details for ${action}`}
        name={action}
      >
        <Layout>
          <Layout.Section oneThird>
            <TextStyle variation="strong">{action}</TextStyle>
          </Layout.Section>
          <Layout.Section oneThird>
            <Badge status={status}>
              {status}
            </Badge>
          </Layout.Section>
          <Layout.Section oneThird>
            <TextStyle variation="subdued">
              {new Date(createdAt).toLocaleString()}
            </TextStyle>
          </Layout.Section>
        </Layout>
      </ResourceItem>
    );
  };

  return (
    <Card>
      <ResourceList
        resourceName={{ singular: 'log', plural: 'logs' }}
        items={logs}
        renderItem={renderLog}
        loading={loading}
      />
      
      {totalPages > 1 && (
        <div style={{ padding: '1rem', textAlign: 'center' }}>
          <Pagination
            hasPrevious={page > 1}
            onPrevious={() => setPage(page - 1)}
            hasNext={page < totalPages}
            onNext={() => setPage(page + 1)}
          />
        </div>
      )}
    </Card>
  );
};

export default LogsView; 
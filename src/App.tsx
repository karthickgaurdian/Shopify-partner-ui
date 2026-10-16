import React from 'react';
import {
  AppProvider,
  Page,
  Layout,
  Card,
  ResourceList,
  ResourceItem,
  TextStyle,
  Badge,
  Button,
  Banner,
  Tabs
} from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css';
import ModuleConfig from './components/ModuleConfig';
import LogsView from './components/LogsView';
import TemplateWizard from './components/TemplateWizard';

interface Module {
  id: string;
  name: string;
  enabled: boolean;
  status: string;
  lastRun: string | null;
  config: any;
}

const App: React.FC = () => {
  const [modules, setModules] = React.useState<Module[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedModule, setSelectedModule] = React.useState<Module | null>(null);
  const [selectedTab, setSelectedTab] = React.useState(0);
  const [wizardOpen, setWizardOpen] = React.useState(false);

  React.useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/modules/shop-id');
      const data = await response.json();
      setModules(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load modules');
      setLoading(false);
    }
  };

  const handleToggleModule = async (moduleId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/modules/${moduleId}/toggle`, {
        method: 'POST'
      });
      const updatedModule = await response.json();
      
      setModules(modules.map(module => 
        module.id === moduleId ? updatedModule : module
      ));
    } catch (err) {
      setError('Failed to toggle module');
    }
  };

  const handleConfigSave = (moduleId: string, newConfig: any) => {
    setModules(modules.map(module => 
      module.id === moduleId ? { ...module, config: newConfig } : module
    ));
  };

  const handleWizardSave = (newModule: Module) => {
    setModules([...modules, newModule]);
  };

  const renderModule = (module: Module) => {
    const { id, name, enabled, status, lastRun } = module;

    return (
      <ResourceItem
        id={id}
        accessibilityLabel={`View details for ${name}`}
        name={name}
        onClick={() => setSelectedModule(module)}
      >
        <Layout>
          <Layout.Section oneThird>
            <TextStyle variation="strong">{name}</TextStyle>
          </Layout.Section>
          <Layout.Section oneThird>
            <Badge status={status === 'active' ? 'success' : 'warning'}>
              {status}
            </Badge>
          </Layout.Section>
          <Layout.Section oneThird>
            <Button
              primary={!enabled}
              onClick={(e) => {
                e.stopPropagation();
                handleToggleModule(id);
              }}
            >
              {enabled ? 'Disable' : 'Enable'}
            </Button>
          </Layout.Section>
        </Layout>
      </ResourceItem>
    );
  };

  const tabs = [
    {
      id: 'modules',
      content: 'Modules',
      accessibilityLabel: 'Modules',
      panelID: 'modules-panel'
    },
    {
      id: 'configuration',
      content: 'Configuration',
      accessibilityLabel: 'Configuration',
      panelID: 'configuration-panel'
    },
    {
      id: 'logs',
      content: 'Logs',
      accessibilityLabel: 'Logs',
      panelID: 'logs-panel'
    }
  ];

  return (
    <AppProvider i18n={{}}>
      <Page
        title="Shopify Automation Dashboard"
        primaryAction={{
          content: 'Add Module',
          onAction: () => setWizardOpen(true)
        }}
      >
        {error && (
          <Banner status="critical">
            <p>{error}</p>
          </Banner>
        )}
        
        <Layout>
          <Layout.Section>
            <Card>
              <Tabs
                tabs={tabs}
                selected={selectedTab}
                onSelect={setSelectedTab}
              />
              
              <Card.Section>
                {selectedTab === 0 && (
                  <ResourceList
                    resourceName={{ singular: 'module', plural: 'modules' }}
                    items={modules}
                    renderItem={renderModule}
                    loading={loading}
                  />
                )}

                {selectedTab === 1 && selectedModule && (
                  <ModuleConfig
                    moduleId={selectedModule.id}
                    config={selectedModule.config}
                    onSave={(config) => handleConfigSave(selectedModule.id, config)}
                  />
                )}

                {selectedTab === 2 && selectedModule && (
                  <LogsView moduleId={selectedModule.id} />
                )}
              </Card.Section>
            </Card>
          </Layout.Section>
        </Layout>

        <TemplateWizard
          open={wizardOpen}
          onClose={() => setWizardOpen(false)}
          onSave={handleWizardSave}
        />
      </Page>
    </AppProvider>
  );
};

export default App;

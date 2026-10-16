import React from 'react';
import {
  Modal,
  FormLayout,
  TextField,
  Select,
  Button,
  Banner,
  Stack
} from '@shopify/polaris';

interface Template {
  id: string;
  name: string;
  description: string;
  config: any;
}

interface TemplateWizardProps {
  open: boolean;
  onClose: () => void;
  onSave: (module: any) => void;
}

const TemplateWizard: React.FC<TemplateWizardProps> = ({ open, onClose, onSave }) => {
  const [templates, setTemplates] = React.useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = React.useState<Template | null>(null);
  const [config, setConfig] = React.useState<any>({});
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/templates');
        const data = await response.json();
        setTemplates(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load templates');
        setLoading(false);
      }
    };

    if (open) {
      fetchTemplates();
    }
  }, [open]);

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      setConfig(template.config);
    }
  };

  const handleConfigChange = (field: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;

    try {
      const response = await fetch('http://localhost:5000/api/modules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: selectedTemplate.name,
          config
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create module');
      }

      const newModule = await response.json();
      onSave(newModule);
      onClose();
    } catch (err) {
      setError('Failed to create module');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create New Module"
      primaryAction={{
        content: 'Create',
        onAction: handleSave,
        disabled: !selectedTemplate
      }}
      secondaryActions={[
        {
          content: 'Cancel',
          onAction: onClose
        }
      ]}
    >
      <Modal.Section>
        {error && (
          <Banner status="critical">
            <p>{error}</p>
          </Banner>
        )}

        <Stack vertical spacing="loose">
          <Select
            label="Template"
            options={templates.map(t => ({
              label: t.name,
              value: t.id
            }))}
            onChange={handleTemplateSelect}
            value={selectedTemplate?.id || ''}
            disabled={loading}
          />

          {selectedTemplate && (
            <FormLayout>
              {Object.entries(config).map(([key, value]) => {
                if (typeof value === 'string' || typeof value === 'number') {
                  return (
                    <TextField
                      key={key}
                      label={key.replace(/_/g, ' ').toUpperCase()}
                      value={String(value)}
                      onChange={value => handleConfigChange(key, value)}
                      autoComplete="off"
                    />
                  );
                }
                return null;
              })}
            </FormLayout>
          )}
        </Stack>
      </Modal.Section>
    </Modal>
  );
};

export default TemplateWizard; 
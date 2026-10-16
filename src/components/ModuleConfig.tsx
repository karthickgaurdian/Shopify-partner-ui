import React from 'react';
import {
  Card,
  FormLayout,
  TextField,
  Select,
  Button,
  Banner
} from '@shopify/polaris';

interface ModuleConfigProps {
  moduleId: string;
  config: any;
  onSave: (config: any) => void;
}

const ModuleConfig: React.FC<ModuleConfigProps> = ({ moduleId, config, onSave }) => {
  const [formConfig, setFormConfig] = React.useState(config);
  const [error, setError] = React.useState<string | null>(null);

  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/modules/${moduleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ config: formConfig })
      });

      if (!response.ok) {
        throw new Error('Failed to save configuration');
      }

      const updatedModule = await response.json();
      onSave(updatedModule.config);
    } catch (err) {
      setError('Failed to save configuration');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card sectioned>
      {error && (
        <Banner status="critical">
          <p>{error}</p>
        </Banner>
      )}

      <FormLayout>
        {Object.entries(formConfig).map(([key, value]) => {
          if (typeof value === 'string' || typeof value === 'number') {
            return (
              <TextField
                key={key}
                label={key.replace(/_/g, ' ').toUpperCase()}
                value={String(value)}
                onChange={value => handleChange(key, value)}
                autoComplete="off"
              />
            );
          }
          return null;
        })}

        <Button primary onClick={handleSave}>
          Save Configuration
        </Button>
      </FormLayout>
    </Card>
  );
};

export default ModuleConfig; 
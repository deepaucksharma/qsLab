import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Upload, Download, Trash2, Settings, Check, X, Package, TestTube } from 'lucide-react';
import ttsConfigManager from '../utils/ttsConfigManager';
import logger from '../utils/logger';

const TTSConfigurationPanel = ({ providers, onApplyConfig }) => {
  const [configurations, setConfigurations] = useState({});
  const [selectedConfig, setSelectedConfig] = useState('techflix-default');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [configName, setConfigName] = useState('');
  const [configDescription, setConfigDescription] = useState('');
  const [testResults, setTestResults] = useState(null);
  const [isTestingConfig, setIsTestingConfig] = useState(false);

  // Load configurations on mount
  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = () => {
    const configs = ttsConfigManager.getAllConfigs();
    setConfigurations(configs);
    logger.info('TTS configurations loaded', { count: Object.keys(configs).length });
  };

  const handleSaveConfig = () => {
    if (!configName.trim()) return;

    // Get current voice selections from parent component
    const currentConfig = [];
    // This would need to be passed from parent or stored in state
    // For now, using the selected config as base
    
    const result = ttsConfigManager.saveConfig(
      configName,
      configDescription,
      currentConfig
    );

    if (result.success) {
      loadConfigurations();
      setShowSaveDialog(false);
      setConfigName('');
      setConfigDescription('');
      logger.info('Configuration saved', { name: configName });
    } else {
      logger.error('Failed to save configuration', { error: result.error });
    }
  };

  const handleDeleteConfig = (configKey) => {
    const config = configurations[configKey];
    if (!config || !config.isCustom) return;

    if (window.confirm(`Delete configuration "${config.name}"?`)) {
      const result = ttsConfigManager.deleteConfig(configKey);
      if (result.success) {
        loadConfigurations();
        if (selectedConfig === configKey) {
          setSelectedConfig('techflix-default');
        }
        logger.info('Configuration deleted', { name: configKey });
      }
    }
  };

  const handleExportConfig = (configKey) => {
    const exportData = ttsConfigManager.exportConfig(configKey);
    if (!exportData) return;

    // Create download link
    const blob = new Blob([JSON.stringify(exportData.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exportData.filename;
    a.click();
    URL.revokeObjectURL(url);

    logger.info('Configuration exported', { name: configKey });
  };

  const handleImportConfig = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = ttsConfigManager.importConfig(e.target.result);
        if (result.success) {
          loadConfigurations();
          logger.info('Configuration imported successfully');
        } else {
          alert(`Import failed: ${result.error}`);
        }
      } catch (error) {
        alert('Invalid configuration file');
        logger.error('Import error', { error });
      }
    };
    reader.readAsText(file);
  };

  const handleTestConfig = async (configKey) => {
    setIsTestingConfig(true);
    setTestResults(null);

    try {
      const results = await ttsConfigManager.testConfig(configKey);
      setTestResults(results);
      logger.info('Configuration test completed', { 
        configKey, 
        success: results.success,
        summary: results.summary 
      });
    } catch (error) {
      logger.error('Configuration test failed', { error });
      setTestResults({ 
        success: false, 
        error: error.message,
        results: [] 
      });
    } finally {
      setIsTestingConfig(false);
    }
  };

  const handleApplyConfig = (configKey) => {
    const config = configurations[configKey];
    if (!config) return;

    setSelectedConfig(configKey);
    
    // Convert config to format expected by parent
    const formattedConfig = {};
    config.configs.forEach(item => {
      if (!formattedConfig[item.provider]) {
        formattedConfig[item.provider] = [];
      }
      formattedConfig[item.provider].push({
        voice: item.voice,
        role: item.role
      });
    });

    if (onApplyConfig) {
      onApplyConfig(formattedConfig);
    }

    logger.info('Configuration applied', { name: configKey });
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Voice Configurations
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSaveDialog(true)}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors flex items-center gap-1"
          >
            <Save className="w-4 h-4" />
            Save Current
          </button>
          <label className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors cursor-pointer flex items-center gap-1">
            <Upload className="w-4 h-4" />
            Import
            <input
              type="file"
              accept=".json"
              onChange={handleImportConfig}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Configuration List */}
      <div className="space-y-3">
        {Object.entries(configurations).map(([key, config]) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedConfig === key
                ? 'bg-blue-900/20 border-blue-500'
                : 'bg-gray-900 border-gray-700 hover:border-gray-600'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{config.name}</h3>
                  {!config.isCustom && (
                    <span className="px-2 py-0.5 bg-purple-600/20 text-purple-400 text-xs rounded-full">
                      Preset
                    </span>
                  )}
                  {selectedConfig === key && (
                    <span className="px-2 py-0.5 bg-green-600/20 text-green-400 text-xs rounded-full">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400 mt-1">{config.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>{config.configs.length} voices</span>
                  {config.created && (
                    <span>Created: {new Date(config.created).toLocaleDateString()}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTestConfig(key)}
                  className="p-2 hover:bg-gray-700 rounded transition-colors"
                  title="Test configuration"
                >
                  <TestTube className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleExportConfig(key)}
                  className="p-2 hover:bg-gray-700 rounded transition-colors"
                  title="Export"
                >
                  <Download className="w-4 h-4" />
                </button>
                {config.isCustom && (
                  <button
                    onClick={() => handleDeleteConfig(key)}
                    className="p-2 hover:bg-red-600/20 rounded transition-colors text-red-400"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleApplyConfig(key)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Voice Details */}
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: selectedConfig === key ? 'auto' : 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-gray-700">
                <h4 className="text-sm font-medium mb-2">Voice Mapping</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {config.configs.map((voice, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-800 rounded px-3 py-2">
                      <span className="text-gray-400 capitalize">{voice.role}:</span>
                      <span className="text-gray-200">
                        {providers[voice.provider]?.name || voice.provider} - {voice.voice}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Save Dialog */}
      <AnimatePresence>
        {showSaveDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowSaveDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Save Configuration</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Configuration Name</label>
                  <input
                    type="text"
                    value={configName}
                    onChange={(e) => setConfigName(e.target.value)}
                    placeholder="My Custom Voices"
                    className="w-full bg-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={configDescription}
                    onChange={(e) => setConfigDescription(e.target.value)}
                    placeholder="Describe this configuration..."
                    rows={3}
                    className="w-full bg-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveConfig}
                  disabled={!configName.trim()}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    configName.trim()
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-700 cursor-not-allowed opacity-50'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Test Results */}
      <AnimatePresence>
        {testResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-4 p-4 bg-gray-900 rounded-lg"
          >
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Configuration Test Results
            </h4>
            
            {testResults.error ? (
              <p className="text-red-400">{testResults.error}</p>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-3 text-sm">
                  <span className={testResults.success ? 'text-green-400' : 'text-yellow-400'}>
                    {testResults.success ? 'All providers available' : 'Some providers unavailable'}
                  </span>
                  <span className="text-gray-400">
                    {testResults.summary.available}/{testResults.summary.total} available
                  </span>
                </div>
                
                <div className="space-y-2">
                  {testResults.results.map((result, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 capitalize">{result.role}</span>
                      <div className="flex items-center gap-2">
                        <span>{result.provider}</span>
                        {result.available ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <div className="flex items-center gap-1">
                            <X className="w-4 h-4 text-red-400" />
                            <span className="text-xs text-red-400">{result.error}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      {isTestingConfig && (
        <div className="mt-4 p-4 bg-gray-900 rounded-lg text-center">
          <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
          <p className="text-sm text-gray-400">Testing configuration...</p>
        </div>
      )}
    </div>
  );
};

export default TTSConfigurationPanel;
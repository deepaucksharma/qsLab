import React, { useState } from 'react';

const nodes = {
  'kafka.server': {
    children: {
      'type=share-group-metrics': {
        children: {
          'group=my-group': {}
        }
      }
    }
  }
};

const renderNode = (path, data, expanded, toggle) => {
  const isExpanded = expanded.includes(path);
  const hasChildren = data.children && Object.keys(data.children).length > 0;
  return (
    <div key={path} className="ml-4">
      <div onClick={() => toggle(path)} className="cursor-pointer">
        {hasChildren && (isExpanded ? '▼' : '▶')} {path.split('.').slice(-1)}
      </div>
      {isExpanded && hasChildren && (
        <div className="ml-4">
          {Object.entries(data.children).map(([child, childData]) =>
            renderNode(`${path}.${child}`, childData, expanded, toggle)
          )}
        </div>
      )}
    </div>
  );
};

const MBeanNavigatorScene = () => {
  const [expanded, setExpanded] = useState(['kafka.server']);

  const toggle = (path) => {
    setExpanded((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  };

  return (
    <div className="p-8 text-gray-200">
      <h2 className="text-3xl font-bold mb-4">MBean Navigator</h2>
      {renderNode('kafka.server', nodes['kafka.server'], expanded, toggle)}
    </div>
  );
};

export default MBeanNavigatorScene;

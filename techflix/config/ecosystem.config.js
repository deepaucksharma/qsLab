// PM2 configuration for parallel testing instances
module.exports = {
  apps: [
    {
      name: 'techflix-test-1',
      script: 'npm',
      args: 'run dev',
      cwd: './',
      env: {
        PORT: 3001,
        NODE_ENV: 'test',
        TEST_INSTANCE: '1'
      }
    },
    {
      name: 'techflix-test-2',
      script: 'npm',
      args: 'run dev',
      cwd: './',
      env: {
        PORT: 3002,
        NODE_ENV: 'test',
        TEST_INSTANCE: '2'
      }
    },
    {
      name: 'techflix-test-3',
      script: 'npm',
      args: 'run dev',
      cwd: './',
      env: {
        PORT: 3003,
        NODE_ENV: 'test',
        TEST_INSTANCE: '3'
      }
    },
    {
      name: 'techflix-test-4',
      script: 'npm',
      args: 'run dev',
      cwd: './',
      env: {
        PORT: 3004,
        NODE_ENV: 'test',
        TEST_INSTANCE: '4'
      }
    }
  ]
};
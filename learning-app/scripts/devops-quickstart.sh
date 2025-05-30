#!/bin/bash
# DevOps Quick Start Script for Track 4 Implementation
# This script sets up the initial development environment

set -euo pipefail

echo "🚀 Kafka Learning Lab - DevOps Setup"
echo "===================================="

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ $1 is not installed${NC}"
        return 1
    else
        echo -e "${GREEN}✅ $1 is installed${NC}"
        return 0
    fi
}

echo -e "\n${YELLOW}Checking prerequisites...${NC}"
MISSING_DEPS=0

check_command docker || MISSING_DEPS=1
check_command docker-compose || MISSING_DEPS=1
check_command kubectl || MISSING_DEPS=1
check_command helm || MISSING_DEPS=1
check_command git || MISSING_DEPS=1

if [ $MISSING_DEPS -eq 1 ]; then
    echo -e "\n${RED}Please install missing dependencies before continuing${NC}"
    exit 1
fi

# Create directory structure
echo -e "\n${YELLOW}Creating directory structure...${NC}"
mkdir -p {k8s/{dev,staging,production},monitoring/{dashboards,alerts},scripts,charts}

# Install kind for local K8s development
if ! command -v kind &> /dev/null; then
    echo -e "\n${YELLOW}Installing kind (Kubernetes in Docker)...${NC}"
    curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64
    chmod +x ./kind
    sudo mv ./kind /usr/local/bin/kind
fi

# Create kind cluster configuration
cat > k8s/dev/kind-config.yaml << 'EOF'
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
name: kafka-learning
nodes:
- role: control-plane
  kubeadmConfigPatches:
  - |
    kind: InitConfiguration
    nodeRegistration:
      kubeletExtraArgs:
        node-labels: "ingress-ready=true"
  extraPortMappings:
  - containerPort: 80
    hostPort: 80
    protocol: TCP
  - containerPort: 443
    hostPort: 443
    protocol: TCP
- role: worker
- role: worker
EOF

# Create multi-user Docker Compose template
cat > docker-compose.multi-user.template.yml << 'EOF'
version: '3.8'

networks:
  user-${USER_ID}-network:
    driver: bridge
    ipam:
      config:
        - subnet: 10.${SUBNET_ID}.0.0/16

services:
  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.0
    container_name: zookeeper-${USER_ID}-${WEEK}
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
    networks:
      - user-${USER_ID}-network
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

  kafka-broker:
    image: confluentinc/cp-kafka:7.5.0
    container_name: kafka-${USER_ID}-${WEEK}-broker
    depends_on:
      - zookeeper
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka-broker:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
    networks:
      - user-${USER_ID}-network
    volumes:
      - kafka-${USER_ID}-data:/var/lib/kafka/data
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G

volumes:
  kafka-${USER_ID}-data:
    name: kafka-${USER_ID}-${WEEK}-data
EOF

# Create user lab management script
cat > scripts/manage-user-lab.sh << 'EOF'
#!/bin/bash
# User Lab Management Script

ACTION=$1
USER_ID=$2
WEEK=$3

case $ACTION in
    create)
        echo "Creating lab for user $USER_ID, week $WEEK..."
        
        # Generate subnet ID from user ID (simple hash)
        SUBNET_ID=$(echo -n "$USER_ID" | sum | cut -d' ' -f1 | tail -c 3)
        
        # Create user-specific compose file
        export USER_ID WEEK SUBNET_ID
        envsubst < docker-compose.multi-user.template.yml > /tmp/docker-compose-${USER_ID}-${WEEK}.yml
        
        # Start the lab
        docker-compose -f /tmp/docker-compose-${USER_ID}-${WEEK}.yml \
            -p lab-${USER_ID}-${WEEK} up -d
        
        echo "Lab created successfully!"
        ;;
        
    destroy)
        echo "Destroying lab for user $USER_ID, week $WEEK..."
        docker-compose -p lab-${USER_ID}-${WEEK} down -v
        rm -f /tmp/docker-compose-${USER_ID}-${WEEK}.yml
        echo "Lab destroyed successfully!"
        ;;
        
    status)
        docker-compose -p lab-${USER_ID}-${WEEK} ps
        ;;
        
    *)
        echo "Usage: $0 {create|destroy|status} USER_ID WEEK"
        exit 1
        ;;
esac
EOF

chmod +x scripts/manage-user-lab.sh

# Create Prometheus configuration
cat > monitoring/prometheus-values.yaml << 'EOF'
prometheus:
  prometheusSpec:
    serviceMonitorSelectorNilUsesHelmValues: false
    retention: 30d
    storageSpec:
      volumeClaimTemplate:
        spec:
          accessModes: ["ReadWriteOnce"]
          resources:
            requests:
              storage: 50Gi
    resources:
      requests:
        memory: 2Gi
        cpu: 1
      limits:
        memory: 4Gi
        cpu: 2

grafana:
  adminPassword: changeme
  persistence:
    enabled: true
    size: 10Gi
  dashboardProviders:
    dashboardproviders.yaml:
      apiVersion: 1
      providers:
      - name: 'default'
        orgId: 1
        folder: ''
        type: file
        disableDeletion: false
        editable: true
        options:
          path: /var/lib/grafana/dashboards/default

alertmanager:
  alertmanagerSpec:
    storage:
      volumeClaimTemplate:
        spec:
          accessModes: ["ReadWriteOnce"]
          resources:
            requests:
              storage: 10Gi
EOF

# Create basic CI workflow
mkdir -p .github/workflows
cat > .github/workflows/ci.yml << 'EOF'
name: CI Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        
    - name: Test Terminal Server
      run: |
        cd learning-app/server
        npm ci
        npm test
        
    - name: Validate Docker Compose Files
      run: |
        for file in learning-app/labs/*/docker-compose.yml; do
          docker-compose -f $file config
        done
        
    - name: Security Scan
      uses: aquasecurity/trivy-action@master
      with:
        scan-type: 'fs'
        scan-ref: '.'
EOF

# Create development cluster setup script
cat > scripts/setup-dev-cluster.sh << 'EOF'
#!/bin/bash
# Setup local development Kubernetes cluster

echo "Creating kind cluster..."
kind create cluster --config k8s/dev/kind-config.yaml

echo "Installing NGINX Ingress..."
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

echo "Waiting for ingress to be ready..."
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=90s

echo "Creating namespaces..."
kubectl create namespace kafka-learning
kubectl create namespace monitoring

echo "Development cluster ready!"
kubectl cluster-info
EOF

chmod +x scripts/setup-dev-cluster.sh

# Create initial documentation
cat > DEVOPS_README.md << 'EOF'
# DevOps Quick Reference

## Quick Start
```bash
# Run the setup script
./scripts/devops-quickstart.sh

# Create development cluster
./scripts/setup-dev-cluster.sh

# Create a user lab (Docker Compose)
./scripts/manage-user-lab.sh create user123 week1

# Check lab status
./scripts/manage-user-lab.sh status user123 week1

# Destroy lab
./scripts/manage-user-lab.sh destroy user123 week1
```

## Directory Structure
```
.
├── k8s/
│   ├── dev/         # Development configs
│   ├── staging/     # Staging configs
│   └── production/  # Production configs
├── monitoring/
│   ├── dashboards/  # Grafana dashboards
│   └── alerts/      # Prometheus alerts
├── charts/          # Helm charts
└── scripts/         # Automation scripts
```

## Key Commands

### Docker Compose Multi-User
```bash
# Create lab for specific user
USER_ID=user123 WEEK=week1 SUBNET_ID=101 \
  docker-compose -f docker-compose.multi-user.template.yml \
  -p lab-user123-week1 up -d
```

### Kubernetes Operations
```bash
# Apply configurations
kubectl apply -f k8s/dev/

# Check user namespaces
kubectl get namespaces -l user

# Get resource usage
kubectl top nodes
kubectl top pods -A
```

### Monitoring
```bash
# Port forward to Grafana
kubectl port-forward -n monitoring svc/grafana 3000:80

# Port forward to Prometheus
kubectl port-forward -n monitoring svc/prometheus 9090:9090
```

## Next Steps
1. Review the execution plan in TRACK4_EXECUTION_PLAN.md
2. Set up your local development environment
3. Start with Week 1 tasks
4. Join the #devops Slack channel for updates
EOF

echo -e "\n${GREEN}✅ Setup complete!${NC}"
echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Review DEVOPS_README.md for quick reference"
echo "2. Run ./scripts/setup-dev-cluster.sh to create local K8s cluster"
echo "3. Test multi-user labs with ./scripts/manage-user-lab.sh"
echo -e "\n${GREEN}Happy DevOps-ing! 🚀${NC}"
# Exercise 4: Production Deployment and Automation

**Objective:** Package, deploy, and manage your custom integration in a production Kubernetes environment with full CI/CD automation.

**Time:** 45 minutes

**Prerequisites:** 
- Completed Exercise 3
- Basic understanding of Kubernetes
- Docker knowledge

## Background

Production deployments require:
- Containerization for consistency
- Kubernetes for orchestration
- CI/CD for automated deployments
- Monitoring of the monitoring system
- Proper secret management

## Steps

### 1. Create a Production Docker Image

```bash
cd ~/qsLab/learning-app/labs/week2-builder

# Create Dockerfile for the integration
cat > custom-integrations/tombstone-monitor/Dockerfile << 'EOF'
# Build stage
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o tombstone-monitor .

# Test stage
FROM builder AS tester
RUN go test -v ./...

# Final stage
FROM newrelic/infrastructure:latest
COPY --from=builder /app/tombstone-monitor /var/db/newrelic-infra/custom-integrations/
COPY --from=builder /app/definition.yml /var/db/newrelic-infra/custom-integrations/
COPY integration-config.yml /etc/newrelic-infra/integrations.d/

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD ["/usr/bin/newrelic-infra", "--version"]

LABEL maintainer="kafka-team@company.com" \
      version="1.0.0" \
      description="Kafka tombstone monitoring integration"
EOF

# Create integration config for container
cat > custom-integrations/tombstone-monitor/integration-config.yml << 'EOF'
integrations:
  - name: com.custom.kafka.tombstone-monitor
    exec: /var/db/newrelic-infra/custom-integrations/tombstone-monitor
    env:
      TOMBSTONE_BOOTSTRAP_SERVERS: "${KAFKA_BOOTSTRAP_SERVERS}"
      TOMBSTONE_SAMPLE_SIZE: "${SAMPLE_SIZE:-1000}"
      TOMBSTONE_TIMEOUT: "${TIMEOUT:-30s}"
      TOMBSTONE_WORKERS: "${WORKERS:-3}"
    interval: ${INTERVAL:-300s}
    custom_attributes:
      environment: "${ENVIRONMENT}"
      cluster: "${KAFKA_CLUSTER_NAME}"
      datacenter: "${DATACENTER}"
EOF
```

### 2. Build Multi-Architecture Image

```bash
# Create build script for multi-arch support
cat > custom-integrations/tombstone-monitor/docker-build.sh << 'EOF'
#!/bin/bash
set -e

IMAGE_NAME=${1:-tombstone-monitor}
VERSION=${2:-1.0.0}
REGISTRY=${3:-docker.io/yourusername}

echo "Building $IMAGE_NAME:$VERSION for multiple architectures..."

# Build for multiple platforms
docker buildx create --use --name multiarch-builder || true
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --tag $REGISTRY/$IMAGE_NAME:$VERSION \
  --tag $REGISTRY/$IMAGE_NAME:latest \
  --push \
  .

echo "Image pushed to $REGISTRY/$IMAGE_NAME:$VERSION"
EOF

chmod +x custom-integrations/tombstone-monitor/docker-build.sh
```

### 3. Create Kubernetes Manifests

```bash
# Create k8s directory
mkdir -p k8s/tombstone-monitor

# ConfigMap for environment-specific settings
cat > k8s/tombstone-monitor/configmap.yaml << 'EOF'
apiVersion: v1
kind: ConfigMap
metadata:
  name: tombstone-monitor-config
  namespace: monitoring
data:
  ENVIRONMENT: "production"
  KAFKA_CLUSTER_NAME: "prod-kafka-cluster"
  DATACENTER: "us-east-1"
  SAMPLE_SIZE: "2000"
  TIMEOUT: "45s"
  WORKERS: "5"
  INTERVAL: "300s"
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: tombstone-monitor-scripts
  namespace: monitoring
data:
  pre-start.sh: |
    #!/bin/bash
    echo "Checking Kafka connectivity..."
    nc -zv ${KAFKA_BOOTSTRAP_SERVERS%,*} ${KAFKA_PORT:-9092} || exit 1
    echo "Kafka is reachable"
EOF

# Secret for sensitive data
cat > k8s/tombstone-monitor/secret.yaml << 'EOF'
apiVersion: v1
kind: Secret
metadata:
  name: tombstone-monitor-secret
  namespace: monitoring
type: Opaque
stringData:
  NEW_RELIC_LICENSE_KEY: "YOUR_LICENSE_KEY_HERE"
  KAFKA_SASL_PASSWORD: "YOUR_KAFKA_PASSWORD_HERE"
EOF

# DaemonSet deployment
cat > k8s/tombstone-monitor/daemonset.yaml << 'EOF'
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: tombstone-monitor
  namespace: monitoring
  labels:
    app: tombstone-monitor
    component: kafka-monitoring
spec:
  selector:
    matchLabels:
      app: tombstone-monitor
  template:
    metadata:
      labels:
        app: tombstone-monitor
        component: kafka-monitoring
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8080"
    spec:
      serviceAccountName: tombstone-monitor
      nodeSelector:
        kafka-monitor: "true"
      tolerations:
      - key: monitoring
        operator: Equal
        value: "true"
        effect: NoSchedule
      initContainers:
      - name: check-kafka
        image: busybox:latest
        command: ['sh', '/scripts/pre-start.sh']
        envFrom:
        - configMapRef:
            name: tombstone-monitor-config
        volumeMounts:
        - name: scripts
          mountPath: /scripts
      containers:
      - name: tombstone-monitor
        image: docker.io/yourusername/tombstone-monitor:1.0.0
        imagePullPolicy: Always
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        env:
        - name: NRIA_LICENSE_KEY
          valueFrom:
            secretKeyRef:
              name: tombstone-monitor-secret
              key: NEW_RELIC_LICENSE_KEY
        - name: KAFKA_BOOTSTRAP_SERVERS
          value: "kafka-0.kafka-headless:9092,kafka-1.kafka-headless:9092,kafka-2.kafka-headless:9092"
        - name: NODE_NAME
          valueFrom:
            fieldRef:
              fieldPath: spec.nodeName
        - name: POD_NAME
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
        envFrom:
        - configMapRef:
            name: tombstone-monitor-config
        livenessProbe:
          exec:
            command:
            - /usr/bin/newrelic-infra
            - --version
          initialDelaySeconds: 30
          periodSeconds: 30
        readinessProbe:
          exec:
            command:
            - /usr/bin/newrelic-infra
            - --version
          initialDelaySeconds: 5
          periodSeconds: 10
        volumeMounts:
        - name: host-root
          mountPath: /host
          readOnly: true
        - name: docker-socket
          mountPath: /var/run/docker.sock
          readOnly: true
      volumes:
      - name: host-root
        hostPath:
          path: /
      - name: docker-socket
        hostPath:
          path: /var/run/docker.sock
      - name: scripts
        configMap:
          name: tombstone-monitor-scripts
          defaultMode: 0755
EOF

# RBAC configuration
cat > k8s/tombstone-monitor/rbac.yaml << 'EOF'
apiVersion: v1
kind: ServiceAccount
metadata:
  name: tombstone-monitor
  namespace: monitoring
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: tombstone-monitor
rules:
- apiGroups: [""]
  resources: ["nodes", "nodes/metrics", "nodes/stats", "pods", "services"]
  verbs: ["get", "list"]
- apiGroups: ["apps"]
  resources: ["deployments", "daemonsets", "statefulsets"]
  verbs: ["get", "list"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: tombstone-monitor
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: tombstone-monitor
subjects:
- kind: ServiceAccount
  name: tombstone-monitor
  namespace: monitoring
EOF
```

### 4. Create CI/CD Pipeline

```bash
# GitHub Actions workflow
cat > .github/workflows/tombstone-monitor-ci.yml << 'EOF'
name: Tombstone Monitor CI/CD

on:
  push:
    branches: [ main, develop ]
    paths:
      - 'custom-integrations/tombstone-monitor/**'
  pull_request:
    branches: [ main ]
    paths:
      - 'custom-integrations/tombstone-monitor/**'

env:
  REGISTRY: docker.io
  IMAGE_NAME: tombstone-monitor

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Go
      uses: actions/setup-go@v4
      with:
        go-version: '1.21'
    
    - name: Run tests
      working-directory: ./custom-integrations/tombstone-monitor
      run: |
        go test -v -race -coverprofile=coverage.out ./...
        go tool cover -html=coverage.out -o coverage.html
    
    - name: Run benchmarks
      working-directory: ./custom-integrations/tombstone-monitor
      run: go test -bench=. -benchmem
    
    - name: Upload coverage
      uses: actions/upload-artifact@v3
      with:
        name: coverage-report
        path: ./custom-integrations/tombstone-monitor/coverage.html

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Log in to Docker Hub
      uses: docker/login-action@v2
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}
    
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v4
      with:
        images: ${{ env.REGISTRY }}/${{ secrets.DOCKER_USERNAME }}/${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=semver,pattern={{version}}
          type=semver,pattern={{major}}.{{minor}}
          type=sha,prefix={{branch}}-
    
    - name: Build and push Docker image
      uses: docker/build-push-action@v4
      with:
        context: ./custom-integrations/tombstone-monitor
        platforms: linux/amd64,linux/arm64
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to Kubernetes
      uses: azure/k8s-deploy@v4
      with:
        manifests: |
          k8s/tombstone-monitor/configmap.yaml
          k8s/tombstone-monitor/daemonset.yaml
        images: |
          ${{ env.REGISTRY }}/${{ secrets.DOCKER_USERNAME }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
EOF
```

### 5. Create Monitoring for the Monitor

```bash
# Prometheus metrics for the integration
cat > custom-integrations/tombstone-monitor/metrics.go << 'EOF'
package main

import (
    "net/http"
    "github.com/prometheus/client_golang/prometheus"
    "github.com/prometheus/client_golang/prometheus/promhttp"
)

var (
    topicsAnalyzed = prometheus.NewCounterVec(
        prometheus.CounterOpts{
            Name: "tombstone_monitor_topics_analyzed_total",
            Help: "Total number of topics analyzed",
        },
        []string{"status"},
    )
    
    analysisLatency = prometheus.NewHistogramVec(
        prometheus.HistogramOpts{
            Name: "tombstone_monitor_analysis_duration_seconds",
            Help: "Latency of topic analysis in seconds",
            Buckets: prometheus.DefBuckets,
        },
        []string{"topic"},
    )
    
    integrationErrors = prometheus.NewCounterVec(
        prometheus.CounterOpts{
            Name: "tombstone_monitor_errors_total",
            Help: "Total number of errors",
        },
        []string{"type"},
    )
)

func init() {
    prometheus.MustRegister(topicsAnalyzed)
    prometheus.MustRegister(analysisLatency)
    prometheus.MustRegister(integrationErrors)
}

func startMetricsServer() {
    http.Handle("/metrics", promhttp.Handler())
    go http.ListenAndServe(":8080", nil)
}
EOF
```

### 6. Deploy to Production

```bash
# Apply Kubernetes manifests
kubectl create namespace monitoring

# Apply secrets (edit with real values first)
kubectl apply -f k8s/tombstone-monitor/secret.yaml

# Apply remaining resources
kubectl apply -f k8s/tombstone-monitor/

# Verify deployment
kubectl -n monitoring get daemonset tombstone-monitor
kubectl -n monitoring logs -l app=tombstone-monitor --tail=50

# Check metrics
kubectl -n monitoring port-forward daemonset/tombstone-monitor 8080:8080
curl http://localhost:8080/metrics
```

### 7. Create Operational Runbook

```bash
cat > k8s/tombstone-monitor/RUNBOOK.md << 'EOF'
# Tombstone Monitor Operational Runbook

## Overview
This integration monitors Kafka tombstone ratios across all topics.

## Deployment

### Prerequisites
- Kubernetes cluster 1.20+
- Kafka cluster accessible from K8s nodes
- New Relic license key

### Deploy
```bash
kubectl apply -f k8s/tombstone-monitor/
```

### Update
```bash
kubectl -n monitoring set image daemonset/tombstone-monitor \
  tombstone-monitor=docker.io/yourusername/tombstone-monitor:new-version
```

## Monitoring

### Health Checks
```bash
# Check pod status
kubectl -n monitoring get pods -l app=tombstone-monitor

# View logs
kubectl -n monitoring logs -l app=tombstone-monitor --tail=100

# Check metrics
kubectl -n monitoring exec -it <pod-name> -- curl localhost:8080/metrics
```

### Key Metrics
- `tombstone_monitor_topics_analyzed_total`: Number of topics analyzed
- `tombstone_monitor_analysis_duration_seconds`: Analysis latency
- `tombstone_monitor_errors_total`: Error count by type

## Troubleshooting

### High Memory Usage
1. Check `SAMPLE_SIZE` in ConfigMap
2. Reduce `WORKERS` count
3. Increase memory limits if needed

### Connection Errors
1. Verify Kafka bootstrap servers
2. Check network policies
3. Validate SASL credentials

### No Data in New Relic
1. Verify license key
2. Check agent logs: `kubectl logs <pod> | grep error`
3. Ensure integration is running: `ps aux | grep tombstone`

## Scaling

### Horizontal Scaling
The DaemonSet automatically scales with nodes labeled:
```bash
kubectl label node <node-name> kafka-monitor=true
```

### Performance Tuning
Adjust in ConfigMap:
- `WORKERS`: Concurrent topic processors (default: 5)
- `SAMPLE_SIZE`: Messages per partition (default: 2000)
- `TIMEOUT`: Analysis timeout (default: 45s)

## Alerts

### Critical
- Tombstone ratio > 75% for any topic
- Integration error rate > 10%
- No data received for > 10 minutes

### Warning  
- Tombstone ratio > 50% for any topic
- Analysis latency > 30s
- Memory usage > 80% of limit
EOF
```

### 8. Set Up GitOps with ArgoCD

```bash
# ArgoCD Application manifest
cat > k8s/tombstone-monitor/argocd-app.yaml << 'EOF'
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: tombstone-monitor
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/yourorg/kafka-monitoring
    targetRevision: main
    path: k8s/tombstone-monitor
  destination:
    server: https://kubernetes.default.svc
    namespace: monitoring
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
    - CreateNamespace=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
EOF
```

## Validation

Verify your production deployment:

- [ ] Docker image builds successfully
- [ ] Multi-architecture support works
- [ ] Kubernetes manifests apply without errors
- [ ] DaemonSet pods are running on expected nodes
- [ ] Metrics endpoint is accessible
- [ ] Data appears in New Relic
- [ ] CI/CD pipeline runs successfully
- [ ] Monitoring alerts are configured

## Production Best Practices

1. **Version Control**: Tag all releases semantically
2. **Rollback Plan**: Keep last 3 versions available
3. **Monitoring**: Monitor the monitoring system
4. **Documentation**: Keep runbook updated
5. **Security**: Scan images for vulnerabilities
6. **Resource Limits**: Set appropriate CPU/memory limits
7. **High Availability**: Deploy across availability zones

## Troubleshooting

### Issue: Pods stuck in CrashLoopBackOff
**Solution:** Check logs: `kubectl -n monitoring logs <pod-name> --previous`

### Issue: Image pull errors
**Solution:** Verify registry credentials and image availability

### Issue: High latency in metrics
**Solution:** Reduce SAMPLE_SIZE or increase WORKERS

## Key Takeaways

1. **Containerization ensures consistency** across environments
2. **DaemonSets provide node-level monitoring** coverage
3. **CI/CD automation reduces deployment errors**
4. **GitOps enables declarative deployments**
5. **Monitoring the monitor prevents blind spots**

## Next Steps

In Exercise 5, you'll create a comprehensive week project that combines all the skills learned to build a complete Kafka observability solution.
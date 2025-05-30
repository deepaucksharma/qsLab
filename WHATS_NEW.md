# What's New in qsLab - 2025 Update

## 🎉 Major Updates

### 1. Kafka 4.0 & KRaft Mode Support
- Added KRaft-mode Docker Compose configuration
- Updated for Kafka 4.0 compatibility
- Removed ZooKeeper dependencies in modern setup
- See: `labs/week1-xray/kraft/docker-compose.yml`

### 2. Cross-Platform Compatibility
- Fixed Docker networking issues for Mac/Windows
- Removed `--network host` dependencies
- Updated JMX connectivity for all platforms
- Added platform-specific instructions

### 3. New Relic Flex Integration
- Added comprehensive Flex configuration examples
- Created guide comparing Flex vs custom integrations
- See: `docs/02-advanced/new-relic-flex-guide.md`

### 4. Enhanced Setup Documentation
- Added New Relic Infrastructure agent setup guide
- Created step-by-step deployment instructions
- Fixed missing output directory issue
- See: `docs/setup/new-relic-agent-setup.md`

### 5. Custom Integration Improvements
- Fixed hardcoded configuration in tombstone monitor
- Added environment variable support
- Improved error logging and handling
- Updated Sarama client to v3.0.0

### 6. Week 2-5 Structure Added
- Created skeletal content for all weeks
- Added learning objectives and planned exercises
- Provided clear expectations for upcoming content

## 🔧 Technical Improvements

### Docker Compose Updates
- Dual listener configuration (localhost + internal)
- Fixed Kafka UI connectivity issues
- JMX accessible from containers
- Better resource management

### Configuration Updates
- NRI-Kafka version string updated to "3.x"
- Removed deprecated configuration options
- Added KRaft-specific settings
- Improved cross-platform paths

### Documentation Enhancements
- Added troubleshooting sections
- Created platform-specific notes
- Improved exercise clarity
- Added "Coming Soon" notices

## 🚀 Quick Migration Guide

If you're already using qsLab:

1. **Update Docker Compose**:
   ```bash
   cd labs/week1-xray
   docker-compose down
   git pull
   docker-compose up -d
   ```

2. **Try KRaft Mode**:
   ```bash
   cd kraft
   docker-compose up -d
   ```

3. **Fix JMX Connections**:
   - Change `localhost:9999` to `kafka:9999` in scripts
   - Remove `--network host` from commands

## 🎯 Next Steps

1. Complete Week 1 with updated configurations
2. Explore New Relic Flex as alternative to custom integrations
3. Set up New Relic Infrastructure agent
4. Watch for Week 2-5 content updates

## 📝 Notes

- All changes maintain backward compatibility
- Original ZooKeeper setup still available
- Week 1 is fully updated and tested
- Weeks 2-5 have structural placeholders

## 🤝 Contributing

Found an issue or have suggestions? Please:
1. Check the updated troubleshooting guides
2. Review platform-specific notes
3. Create an issue with details
4. Consider contributing exercises for Weeks 2-5!

---

**Last Updated**: May 2025  
**Compatibility**: Kafka 3.x/4.0, New Relic Infrastructure Agent 1.40+

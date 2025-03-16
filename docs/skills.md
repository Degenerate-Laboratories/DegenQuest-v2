# DegenQuest Skills Documentation

This document outlines the various operational skills encoded as scripts in the `skills` directory. These skills help automate common tasks for development, deployment, and maintenance of the DegenQuest game.

## Version Management Skills

### `bump-version.sh`

**Purpose**: Automates semantic versioning for the game

**Usage**: 
```bash
cd skills
./bump-version.sh [patch|minor|major]
```

**Parameters**:
- `patch` (default): Increments the third number (e.g., 0.4.0 → 0.4.1) for bug fixes and minor improvements
- `minor`: Increments the second number (e.g., 0.4.0 → 0.5.0) for new features
- `major`: Increments the first number (e.g., 0.4.0 → 1.0.0) for breaking changes

**Actions**:
1. Reads the current version from package.json
2. Increments version number based on specified parameter
3. Updates package.json with the new version
4. Commits the change to git
5. Creates a git tag for the new version

**When to use**: 
- Before releasing a new version
- After completing a set of changes that warrant a version bump
- As part of the automated deployment process

## Deployment Skills

### `deploy-game-server.md`

**Purpose**: Provides a step-by-step playbook for deploying the game server

**Key Sections**:
1. **Preparation**: Setting up the environment
2. **Version Bumping**: Incrementing version numbers
3. **Docker Image Building**: Creating containerized versions
4. **Testing**: Verifying functionality locally
5. **Registry Deployment**: Pushing to container registry
6. **Kubernetes Deployment**: Updating production environments
7. **Verification**: Ensuring successful deployment
8. **Monitoring**: Watching for issues post-deployment
9. **Rollback**: Recovering from problematic deployments

**When to use**:
- When deploying to production
- For training new team members on deployment procedures
- As a reference during deployment incidents

## Health Monitoring Skills

### `check-health.sh`

**Purpose**: Quickly checks the health status of multiple game server instances

**Usage**:
```bash
cd skills
./check-health.sh [--verbose]
```

**Parameters**:
- `--verbose`: Shows detailed health information for each endpoint

**Endpoints Checked**:
1. Localhost (non-Docker): `http://localhost:8888/health`
2. Docker Container: `http://localhost:3002/health`
3. Development Server: `http://134.199.184.18:8888/health`
4. Production Server: `http://134.199.184.18/health`

**Output**:
- Basic HTTP status for each endpoint
- Detailed version, environment, uptime, and database info when using `--verbose`
- Color-coded results for easy reading

**When to use**:
- During deployments to verify all instances are healthy
- As a quick check during incidents
- For regular monitoring

### `get-status.sh`

**Purpose**: Gets comprehensive status information from a specific game server endpoint

**Usage**:
```bash
cd skills
./get-status.sh [local|docker|dev|prod] [--raw]
```

**Parameters**:
- Endpoint selection: `local`, `docker`, `dev`, or `prod`
- `--raw`: Shows the full raw JSON response

**Information Displayed**:
- Basic server info (version, name, environment)
- System statistics (uptime, memory usage, platform)
- Database information (size, path, last modified)
- Git information (commit, branch)
- E2E test status

**When to use**:
- For detailed diagnostics of a specific environment
- When troubleshooting performance issues
- For comprehensive server status reporting

### Server Health Endpoint

**Purpose**: Provides real-time health and status information about the running game server

**Endpoint**: `/health`

**Information Provided**:
- Version number (from package.json)
- Database health (existence, size, last modified)
- Database schema version
- End-to-end test status
- System metrics (memory, CPU, uptime)
- Git information (current commit, branch)
- Environment information

**Usage in Monitoring**:
- Regular polling from monitoring systems
- Part of deployment verification
- Health checks for Kubernetes
- Debugging server issues

## Recovery Skills

### `fix-ai-broken-master.md`

**Purpose**: Provides guidance for recovering from AI-generated code that broke the master branch

**Key Recovery Steps**:
1. Assess damage from AI-generated code
2. Create recovery branches
3. Implement fix strategies (revert or fix forward)
4. Verify builds and tests
5. Deploy emergency fixes

**Preventative Measures**:
- AI code review guidelines
- Automated guardrails
- Team education

**When to use**:
- After discovering AI-generated problematic code
- For reference when working with AI-generated contributions
- During team training on AI collaboration

## General Maintenance Skills

### `fix-master.md`

**Purpose**: General playbook for addressing issues in the master branch

**Key Sections**:
1. Issue identification
2. Branch creation for fixes
3. Implementation guidelines
4. Testing procedures
5. PR and review process
6. Deployment verification

**When to use**:
- For routine maintenance
- When addressing general issues in the codebase
- As a reference for new developers

## Best Practices for Skills

1. **Versioning**: Always use semantic versioning for releases
2. **Testing**: Verify all changes locally before pushing to production
3. **Documentation**: Update skills documentation when adding or modifying skills
4. **Monitoring**: Use the health endpoints to verify system status
5. **Automation**: Leverage these skills in CI/CD pipelines when possible

## Adding New Skills

When adding new skills:
1. Place scripts in the `skills` directory
2. Make scripts executable (`chmod +x skills/new-skill.sh`)
3. Add documentation to this file
4. Include usage examples
5. Explain when and why to use the skill 
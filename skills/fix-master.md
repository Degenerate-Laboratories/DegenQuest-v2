# Master Branch Recovery Playbook

This playbook provides guidance for fixing issues in the master branch. It covers everything from identifying issues to verifying that the fixes are working correctly.

## 1. Issue Identification

### Critical Issues
- **Build Failures**: Check CI/CD pipeline for failed builds
- **Runtime Errors**: Monitor error logs and user reports
- **Security Vulnerabilities**: Identified through scans or reports
- **Data Integrity Issues**: Database inconsistencies or data corruption
- **Performance Degradation**: Significant slowdowns reported after deployment

### Collecting Information
- Review server logs for errors
- Run `./skills/check-health.sh --verbose` to check service health
- Gather information from `./skills/get-status.sh prod` for production issues
- Check recent commits with `git log -n 10`
- Review related tickets or issues

## 2. Emergency Triage

### Immediate Actions
1. **Notify Team**: Inform team members about the issue
2. **Document Issue**: Create an incident ticket with all relevant information
3. **Assess Impact**: Determine severity and number of affected users
4. **Consider Rollback**: For severe issues, consider immediate rollback to last stable version

### Rollback Process (if needed)
```bash
# Find last stable tag
git tag -l --sort=-v:refname

# Reset to last stable version
git checkout [last-stable-tag]

# Deploy the stable version
# Follow regular deployment process with this version
```

## 3. Creating a Fix Branch

```bash
# Create a branch from master
git checkout master
git pull
git checkout -b fix/[issue-description]

# For hotfixes from a specific tag
git checkout [tag-name]
git checkout -b hotfix/[issue-description]
```

## 4. Fix Implementation

### Guidelines
- Make minimal, focused changes to address the specific issue
- Add appropriate tests to verify the fix and prevent regression
- Document the changes clearly in commit messages
- Consider both the fix and potential side effects

### Testing the Fix
- Run local tests before committing
- Verify that the fix resolves the issue
- Check for any new issues introduced by the fix
- Test on staging environment if possible

## 5. Creating a Pull Request

### PR Content
- Clear title describing the fix
- Detailed description of the issue and how the fix addresses it
- Steps to reproduce the issue
- Steps to verify the fix
- Any relevant screenshots or logs

### Review Process
- Request reviews from team members familiar with the affected code
- Address all review comments
- Ensure all CI checks pass
- Get approval from at least one other team member

## 6. Merging to Master

### Pre-Merge Checklist
- All CI checks passing
- All review comments addressed
- Fix verified in staging environment
- Documentation updated if needed

### Merge Process
```bash
# Update your branch with latest master
git checkout master
git pull
git checkout fix/[issue-description]
git merge master
# Resolve any conflicts

# Push updated branch
git push

# Once PR is approved, merge to master
# Use GitHub/GitLab UI or:
git checkout master
git merge fix/[issue-description]
git push
```

## 7. Deployment and Verification

### Deployment
- Follow the standard deployment process in `skills/deploy-game-server.md`
- Monitor deployment process closely
- Be prepared to revert if issues arise

### Verification
- Run `./skills/check-health.sh --verbose` after deployment
- Verify fix in production environment
- Monitor logs for any new errors
- Check that metrics remain stable

## 8. Post-Mortem

### Documentation
- Update the incident ticket with resolution details
- Document root cause and fix implemented
- Note any areas that need further improvement
- Update runbooks or documentation if needed

### Team Communication
- Inform team that issue is resolved
- Share lessons learned
- Discuss preventative measures for similar issues

## Prevention Strategies

- Regular code reviews
- Comprehensive test coverage
- Feature flags for risky changes
- Canary deployments
- Automated monitoring and alerting
- Regular dependency updates
- Scheduled security scans 
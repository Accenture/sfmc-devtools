# Release details

## Checklist

### Before merge

- [ ] Wiki updated with info in ticket listed under **Documentation**
- [ ] ran `npm audit fix`
- [ ] ran `npm run lint:fix`
- [ ] ran `npm run version:major/minor/patch`
- [ ] updated [bug template](/.github/ISSUE_TEMPLATE/bug.yml) to include the new version
- [ ] updated [.mcdevrc](/test/mockRoot/.mcdevrc.json) for tests to the new version

### After merge

- [ ] merged all dependabot PRs to main branch
- [ ] moved version tag to merge commit & pushed to remote
- [ ] closed GitHub milestone
- [ ] created [new GitHub Release](https://github.com/Accenture/sfmc-devtools/releases/new)

## Documentation

... insert updated documentation here ...

## Issues

- closes #1234567

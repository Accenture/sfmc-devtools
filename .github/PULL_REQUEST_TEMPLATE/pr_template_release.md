# Release details

## Checklist

### Before merge

- [ ] Wiki updated with info in ticket listed under **Documentation**
- [ ] ran `npm run prepare-release` (which runs `npm audit fix`, `npm run lint-ts` and `npm run lint:fix`)
- [ ] pushed potential changes made by prepare-release

### After merge

- [ ] merged all dependabot PRs that target main branch
- [ ] updated [bug template](/.github/ISSUE_TEMPLATE/bug.yml) to include the new version
- [ ] updated [.mcdevrc](/test/mockRoot/.mcdevrc.json) for tests to the new version
- [ ] ran `npm run version:major/minor/patch`
- [ ] merged main branch into develop branch
- [ ] closed GitHub milestone
- [ ] created [new GitHub Release](https://github.com/Accenture/sfmc-devtools/releases/new)

## Documentation

... insert updated documentation here ...

## Issues

- closes #1234567

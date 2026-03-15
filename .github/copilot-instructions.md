# GitHub Copilot Instructions for sfmc-devtools

## Commit Messages

Prefix every commit message with the issue number it was created for:

```
#1234: <commit message>
```

Example: `#1234: fix journey deployment error`

## Branch Naming

Branch names must follow this pattern, where the type is derived from the issue type:

```
copilot/task/1234-issue-title
copilot/bug/1234-issue-title
copilot/feature/1234-issue-title
```

- Use `task` for task/chore issues
- Use `bug` for bug report issues
- Use `feature` for feature request/enhancement issues
- Replace spaces in the issue title with hyphens and use lowercase

## Pull Request Title

The PR title should be derived from the branch name:

```
Branch: copilot/task/1234-issue-title
PR title: task/1234 issue title
```

Format: `<type>/<issue-number> <issue title with spaces>`

## Pull Request Description

Follow the structure defined in [PULL_REQUEST_TEMPLATE.md](./PULL_REQUEST_TEMPLATE.md):

```markdown
# PR details

## What changes did you make? (Give an overview)

- closes #1234

## Further details (optional)

...

## Checklist

- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] test scripts updated
- [ ] Wiki updated (if applicable)
```

Replace `#1234` with the actual issue number the PR is created for.

## Issue Relationship

Always link the PR to the issue it was created for by including `closes #<issue-number>` in the PR description.

## Labels

The repository has component labels prefixed with `c/` based on the class names in `lib/metadataTypes/`. When files in that directory are changed, assign the matching pre-existing `c/` label(s) to the PR.

Examples:
- Changes to `lib/metadataTypes/Journey.js` → assign label `c/journey`
- Changes to `lib/metadataTypes/Automation.js` → assign label `c/automation`
- Changes to `lib/metadataTypes/DataExtension.js` → assign label `c/dataextension`

The label name is `c/` followed by the lower camel-cased class name (filename without extension).

Only assign labels that already exist in the repository.

## Milestone

Assign the same milestone to the PR that the issue has assigned.

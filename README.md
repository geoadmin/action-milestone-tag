<p align="center">
  <a href="https://github.com/geoadmin/action-milestone-tag/actions">
    <img alt="action-milestone-tag status" src="https://github.com/geoadmin/action-milestone-tag/workflows/build-test/badge.svg">
  </a>
</p>

# Create a git tag based on the attached milestone

- [Description](#description)
- [Inputs](#inputs)
  - [Custom Tag Placeholders](#custom-tag-placeholders)
- [Outputs](#outputs)
- [Example usage](#example-usage)
- [Contributing](#contributing)
  - [Setup your environment](#setup-your-environment)
  - [Create new Release](#create-new-release)
  - [Validate](#validate)

## Description

This github action can be used on pull request merge to tag the repository. The tag name is based on
the attached milestone if any or on the previous tag.

You can also use the input `custom_tag` to
modify the tag name by for example adding a prefix or suffix (e.g.
`custom_tag = '${MILESTONE}_my-suffix'`).

When your workflow requires more than one tag per milestone, you can use the `${TAG_NUMBER}`
placeholder in the `custom_tag`. This placeholder will then be automatically incremented based on
the previous tag found matching the `custom_tag`. The previous tag is search based on the milestone
title attached to the PR or based on the `milestone_pattern` input (default to `.*?`).

> **_IMPORTANT NOTE:_** _This action only works with Pull Request and can only be used with the `pull_request` event._

## Inputs

<!-- prettier-ignore -->
| Variable             | Type   | Default        | Description              |
| -------------------- | ------ | -------------- | ------------------------ |
| `github_token`       | String | -              | REQUIRED. Github token to access the repository. |
| `custom_tag`         | String | `${MILESTONE}` | Custom tag to set. Several placeholders can be used, see [Custom Tag Placeholders](#custom-tag-placeholders). |
| `initial_tag_number` | Number | `1`            | Initial `TAG_NUMBER` placeholder. |
| `milestone_pattern`  | String | `.+?`          | Milestone pattern used to search for previous tag when not milestone is attached. |
| `milestone`          | String | `''`           | Milestone value to use for tagging (overwrite the milestone attached to the PR) |
| `dry_run`            | Bool   | `false`        | Dry run for testing, do not create the tag. |

### Custom Tag Placeholders

| Placeholder  | Description                                                          |
| ------------ | -------------------------------------------------------------------- |
| `MILESTONE`  | Milestone title attached to the Pull Request.                        |
| `TAG_NUMBER` | Tag number, this number gets incremented if a previous tag is found. |

## Outputs

| Variable       | Type    | Description                                         |
| -------------- | ------- | --------------------------------------------------- |
| `new_tag`      | String  | New tag created.                                    |
| `previous_tag` | String  | Previous tag if any.                                |
| `tag_created`  | Boolean | `true` if a tag has been created, `false` otherwise |

## Example usage

```yaml
on:
  pull_request:
    types:
      - closed
    branches:
      - master

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v2
      - name: Bump Milestone Tag
        uses: geoadmin/action-milestone-tag@v1.0.0
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          custom_tag: '${MILESTONE}_rc${TAG_NUMBER}'
```

## Contributing

Every contribution to this action is welcome ! So if you find a bug or want to add a new feature
everyone is welcome to open an [issue](https://github.com/geoadmin/action-milestone-tag/issues) or
created a [Pull Request](https://github.com/geoadmin/action-milestone-tag/pulls).

Any contribution must follow the
[git-flow](https://nvie.com/posts/a-successful-git-branching-model/#the-main-branches).

### Setup your environment

> First, you'll need to have a reasonably modern version of `node` handy. This won't work with versions older than 9, for instance.

Install the dependencies

```bash
npm install
```

Make sure your changes follows the formatting and linting

```bash
npm run format-check && npm run lint
```

Build the typescript and package it for distribution

```bash
npm run build && npm run package
```

Run the tests :heavy_check_mark:

```bash
$ npm test

 PASS  ./index.test.js
  ✓ throws invalid number (3ms)
  ✓ wait 500 ms (504ms)
  ✓ test runs (95ms)

...
```

### Create new Release

Actions are run from GitHub repos so we will checkin the packed dist folder.

1. First make sure the version in `package.json` match the next release version, if not update it.
2. Then build the project, package it and push the changes as follow:

   ```bash
   npm run all
   git add dist
   git commit -a -m "prod dependencies"
   git push origin feature-your-feature
   ```

3. Create a PR to merge this in `develop` branch
4. Once the PR above has been merged, create a new Release PR to merge `develop` into `master`

### Validate

You can now validate the action by referencing `./` in a workflow in your repo (see [test.yml](.github/workflows/test.yml))

```yaml
uses: ./
with:
  github_token: ${{ secrets.GITHUB_TOKEN }}
  dry_run: true
```

See the [actions tab](https://github.com/geoadmin/action-milestone-tag/actions) for runs of this action! :rocket:

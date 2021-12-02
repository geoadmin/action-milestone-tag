import * as core from '@actions/core'
import * as github from '@actions/github'

import {checkMilestone, getLastTag, getNewTag, getTagPattern} from './utils'
import {createTag, listTags} from './git'
import {PullRequestWebhookPayload} from './interfaces'

async function computeTags(
  pullRequest: PullRequestWebhookPayload
): Promise<string> {
  const custom_tag = core.getInput('custom_tag')
  const initial_tag_number = Number(core.getInput('initial_tag_number'))
  const milestone_pattern = core.getInput('milestone_pattern')
  let milestone = core.getInput('milestone')
  if (!milestone) {
    milestone = pullRequest.milestone ? pullRequest.milestone.title : null
  }
  checkMilestone(milestone, milestone_pattern)
  core.info(`PR milestone: ${milestone}`)
  const tagPattern = getTagPattern(custom_tag, milestone_pattern, milestone)
  const tags = await listTags(true)
  core.info(`Tags: ${tags.map(t => t.name)}`)
  const lastTag = getLastTag(tags, tagPattern)

  const newTag = getNewTag(
    custom_tag,
    milestone_pattern,
    initial_tag_number,
    lastTag,
    milestone
  )
  core.setOutput('previous_tag', lastTag)

  return newTag
}

/** Main action function */
export default async function action(): Promise<void> {
  const pullRequest = (github.context.payload as PullRequestWebhookPayload)
    .pull_request

  if (!pullRequest) {
    throw Error('Could not get pull_request from context, exiting')
  }
  core.debug(`pull_request: ${pullRequest}`)
  core.info(`PR merged: ${pullRequest.merged}`)
  core.info(`PR state: ${pullRequest.state}`)

  const newTag = await computeTags(pullRequest)
  core.setOutput('new_tag', newTag)
  core.setOutput('tag_created', false)

  if (!pullRequest.merged) {
    core.warning('Ignore non merged pull request')
    return
  }

  if (core.getBooleanInput('dry_run')) {
    core.warning('Dry run set, tag is not created')
  } else {
    const {GITHUB_SHA} = process.env
    if (!GITHUB_SHA) {
      throw Error('GITHUB_SHA environment variable not defined')
    }
    await createTag(newTag, GITHUB_SHA)
    core.setOutput('tag_created', true)
  }
}

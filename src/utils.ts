import * as core from '@actions/core'

import {Tag} from './interfaces'

export function getLastTag(tags: Tag[], tag_pattern: RegExp): string | null {
  let filteredTags: Tag[]
  let lastTag: string | null = null

  filteredTags = tags.filter((t: Tag) => tag_pattern.test(t.name))
  filteredTags = filteredTags.sort((a: Tag, b: Tag) => {
    if (a.name < b.name) {
      return 1
    } else if (a.name > b.name) {
      return -1
    }
    return 0
  })
  if (filteredTags.length) {
    lastTag = filteredTags[0].name
  }

  core.info(`Last Tag: ${lastTag}`)
  return lastTag
}

export function getTagPattern(
  custom_tag: string,
  milestone_pattern: string,
  milestone: string | undefined | null
): RegExp {
  let regexStr = custom_tag

  if (!custom_tag.includes('${MILESTONE}')) {
    throw Error(
      `custom_tag '${custom_tag}' don't contain \${MILESTONE} placeholder`
    )
  }

  if (milestone) {
    regexStr = regexStr.replace('${MILESTONE}', milestone)
  } else {
    regexStr = regexStr.replace(
      '${MILESTONE}',
      `(?<MILESTONE>${milestone_pattern})`
    )
  }
  regexStr = regexStr.replace('${TAG_NUMBER}', '(?<TAG_NUMBER>\\d+)')
  const tagPattern = new RegExp(`^${regexStr}$`)
  core.info(`Tag Pattern: ${tagPattern}`)
  return tagPattern
}

export function getNewTag(
  custom_tag: string,
  milestone_pattern: string,
  initial_tag_number: number,
  lastTag: string | null,
  milestone: string | undefined | null
): string {
  let newTag: string
  const tag_pattern = getTagPattern(custom_tag, milestone_pattern, null)

  if (lastTag) {
    const m = lastTag.match(tag_pattern)
    if (!m || !m.groups || !m.groups.MILESTONE) {
      throw Error(
        `Invalid lastTag ${lastTag}, don't match ${tag_pattern.toString()}, cannot get new Tag`
      )
    }
    if (!m.groups.TAG_NUMBER) {
      // if there is no TAG_NUMBER in the custom_tag then we cannot bump the tag
      newTag = lastTag
    } else {
      newTag = custom_tag
        .replace('${MILESTONE}', m.groups.MILESTONE)
        .replace('${TAG_NUMBER}', `${Number(m.groups.TAG_NUMBER) + 1}`)
    }
  } else {
    if (!milestone) {
      throw Error(
        'No last tag found and PR not attached to a milestone, cannot get new Tag'
      )
    }
    newTag = custom_tag
      .replace('${MILESTONE}', milestone)
      .replace('${TAG_NUMBER}', `${initial_tag_number}`)
  }

  newTag = newTag.trim()
  core.info(`New Tag: ${newTag}`)
  return newTag
}

export function checkMilestone(
  milestone: string | null | undefined,
  milestone_pattern: string
): void {
  if (milestone && !RegExp(milestone_pattern).test(milestone)) {
    throw Error(
      `Attached milestone ${milestone} don't match the milestone_pattern ${milestone_pattern}`
    )
  }
}

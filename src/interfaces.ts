/* eslint-disable @typescript-eslint/no-explicit-any */
import {WebhookPayload} from '@actions/github/lib/interfaces'

export interface RepoWebhookPayload {
  ref: string
  repo: {
    git_tags_url: string
    tags_url: string
  }
}

export interface PullRequestWebhookPayload extends WebhookPayload {
  pull_request?: {
    [key: string]: any
    number: number
    html_url?: string
    body?: string
    merged: boolean
    milestone?: {
      title: string
      state: string
      id: number
      [key: string]: any
    }
    base: RepoWebhookPayload
    head: RepoWebhookPayload
  }
}

export interface Tag {
  name: string
  commit?: {
    sha: string
    url: string
  }
  zipball_url?: string
  tarball_url?: string
  node_id?: string
}

/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * To mock dependencies in ESM, you can create fixtures that export mock
 * functions and objects. For example, the core module is mocked in this test,
 * so that the actual '@actions/core' module is not imported.
 */
import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'

// Mocks should be declared before the module being tested is imported.
jest.unstable_mockModule('@actions/core', () => core)

// The module being tested should be imported dynamically. This ensures that the
// mocks are used in place of any actual dependencies.
import { getTagPattern, getNewTag, getLastTag } from '../src/utils'

describe('main.ts', () => {
  beforeEach(() => {
    // Set the action's inputs as return values from core.getInput().
    core.getInput.mockImplementation(() => '500')
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  test('Tag pattern', () => {
    const pattern = getTagPattern(
      'Test_${MILESTONE}_alpha-${TAG_NUMBER}',
      '\\d+',
      '20211010'
    )
    expect(pattern).toEqual(/^Test_20211010_alpha-(?<TAG_NUMBER>\d+)$/)
    expect(pattern.test('Test_20211010_alpha-1')).toBeTruthy()
    expect(pattern.test('Test_20211010_alpha-123')).toBeTruthy()
    expect(pattern.test('Test_20211010_alpha-123a')).toBeFalsy()
    expect(pattern.test('20211010')).toBeFalsy()
    expect(pattern.test('Test_20211010_alpha-')).toBeFalsy()
  })

  test('Tag pattern without milestone', () => {
    const pattern = getTagPattern(
      'Test_${MILESTONE}_alpha-${TAG_NUMBER}',
      '\\d+',
      undefined
    )
    expect(pattern).toEqual(/^Test_(?<MILESTONE>\d+)_alpha-(?<TAG_NUMBER>\d+)$/)
    expect(pattern.test('Test_20211010_alpha-1')).toBeTruthy()
    expect(pattern.test('Test_my-milestone_alpha-123')).toBeFalsy()
    expect(pattern.test('Test_20211010_alpha-123a')).toBeFalsy()
    expect(pattern.test('20211010')).toBeFalsy()
    expect(pattern.test('Test_20211010_alpha-')).toBeFalsy()
  })

  test('Get last Tag', () => {
    expect(
      getLastTag(
        [
          { name: 'Test_20211010_alpha-3a' },
          { name: '20211010' },
          { name: 'Test_20211010_alpha-' },
          { name: 'Test_20211010_alpha-1' },
          { name: 'Test_20211010_alpha-3' },
          { name: 'Test_20211010_alpha-11' },
          { name: 'Test_20211010_alpha-2' },
          { name: 'Test_20211010_alpha-10' },
          { name: 'Test_20211010_alpha-9' },
          { name: 'Test_20201010_alpha-12' }
        ],
        getTagPattern(
          'Test_${MILESTONE}_alpha-${TAG_NUMBER}',
          '\\d+',
          '20211010'
        )
      )
    ).toBe('Test_20211010_alpha-11')
  })

  test('Get last Tag without milestone', () => {
    expect(
      getLastTag(
        [
          { name: 'Test_20211210_alpha-3a' },
          { name: '20211010' },
          { name: 'Test_20211010_alpha-' },
          { name: 'Test_20211010_alpha-1' },
          { name: 'Test_20211210_alpha-1' },
          { name: 'Test_20211010_alpha-3' },
          { name: 'Test_20211010_alpha-2' },
          { name: 'Test_20211210_alpha-9' },
          { name: 'Test_20211210_alpha-10' }
        ],
        getTagPattern(
          'Test_${MILESTONE}_alpha-${TAG_NUMBER}',
          '\\d+',
          undefined
        )
      )
    ).toBe('Test_20211210_alpha-10')
  })

  test('Get last Tag without milestone without tag number', () => {
    expect(
      getLastTag(
        [
          { name: 'Test_20208110' },
          { name: '20211210' },
          { name: 'Test_20211010_alpha-' },
          { name: 'Test_20211010_alpha-1' },
          { name: 'Test_20211220_alpha-1' },
          { name: 'Test_20210910' },
          { name: 'Test_20211010_alpha-3' },
          { name: 'Test_20211010_alpha-2' }
        ],
        getTagPattern('Test_${MILESTONE}', '\\d+', undefined)
      )
    ).toBe('Test_20210910')
  })

  test('Get last Tag with non existing milestone', () => {
    expect(
      getLastTag(
        [
          { name: 'Test_20208110' },
          { name: '20211210' },
          { name: 'Test_20211010_alpha-' },
          { name: 'Test_20211010_alpha-1' },
          { name: 'Test_20211220_alpha-1' },
          { name: 'Test_20210910' },
          { name: 'Test_20211010_alpha-3' },
          { name: 'Test_20211010_alpha-2' }
        ],
        getTagPattern('Test_${MILESTONE}', '\\d+', '20220101')
      )
    ).toBe(null)
  })

  test('Get new initial Tag', () => {
    expect(
      getNewTag(
        'Test_${MILESTONE}_rc${TAG_NUMBER}',
        '\\d+',
        1,
        null,
        '20210101'
      )
    ).toBe('Test_20210101_rc1')
  })

  test('Get new Tag without milestone', () => {
    expect(
      getNewTag(
        'Test_${MILESTONE}_rc${TAG_NUMBER}',
        '\\d+',
        1,
        'Test_20210101_rc2',
        null
      )
    ).toBe('Test_20210101_rc3')
    expect(
      getNewTag(
        'Test_${MILESTONE}_${TAG_NUMBER}-alpha',
        '\\d+',
        1,
        'Test_20210101_1-alpha',
        null
      )
    ).toBe('Test_20210101_2-alpha')
  })

  test('Get new Tag', () => {
    expect(
      getNewTag(
        'Test_${MILESTONE}_rc${TAG_NUMBER}',
        '\\d+',
        1,
        'Test_20210101_rc2',
        '20210101'
      )
    ).toBe('Test_20210101_rc3')
    expect(
      getNewTag(
        'Test_${MILESTONE}_${TAG_NUMBER}-alpha',
        '\\d+',
        1,
        'Test_20210101_1-alpha',
        '20210101'
      )
    ).toBe('Test_20210101_2-alpha')
  })
})

const path = require('path')
const fs = require('fs')
const convert = require('csvtojson/v2')
const copy = require('copy-paste').copy
const datetime = require('luxon').DateTime
const indentString = require('indent-string')

////////////////////////////////////////////////////////////////////////////////
// general helpers /////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

const cleanupStrings = (value, fallback = '') => {
  return String(value).trim() || fallback
}

const reformatDates = (ttDateTime, ttTimezone) => {
  if (!ttDateTime || !datetime.fromISO(ttDateTime).isValid) return null
  // NOTE: TickTick is providing timestamps in UTC so we want to be explicit
  const parsedToUTC = datetime.fromISO(ttDateTime).toUTC()
  // NOTE: We can set the zone on that newly-parsed time based on the zone
  // coming from TickTick. If zone is invalid result falls back to .local() zone
  const utcToLocal = parsedToUTC.setZone(ttTimezone)

  return utcToLocal.toFormat('MM/dd/yyyy h:mm:ss a')
}

const keyToCamelCase = (key) => {
  return key
    .toLowerCase()
    .split(' ')
    .map((w, i) => (i ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join('')
}

////////////////////////////////////////////////////////////////////////////////
// conversion helpers //////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

// REFERENCE FOR OMNIFOCUS SUPPORT FOR TASKPAPER TAGS:
// https://support.omnigroup.com/omnifocus-taskpaper-reference/

const tpDone = (item) => {
  const completed = item.status != 0
  const completionDate = reformatDates(item.completedTime, item.timezone)
  return completed && !!completionDate ? ` @done(${completionDate})` : ''
}

const tpDefer = (item) => {
  const deferDate = reformatDates(item.createdTime, item.timezone)
  return deferDate ? ` @defer(${deferDate})` : ''
}

const tpDue = (item) => {
  const dueDate = reformatDates(item.dueDate, item.timezone)
  return dueDate ? ` @due(${dueDate})` : ''
}

const tpFlagged = (item) => {
  return item.priority > 0 ? ' @flagged' : ''
}

const tpNote = (item) => {
  return item.content
    ? cleanupStrings(item.content)
        .split('\n')
        .map((line) => `${line.replace(/^-/, '').replace(/^▪/, '')}`)
        .join('\n')
    : ''
}

const tpProject = (item) => {
  const folder = item.folderName ? cleanupStrings(item.folderName) : ''
  const list = item.listName ? cleanupStrings(item.listName) : ''
  return folder || list ? cleanupStrings(`${folder} ${list}`) : ''
}

const tpRepeat = (item) => {
  const repeatRule = cleanupStrings(item.repeat, null)
  return repeatRule ? ` @repeat-method(fixed) @repeat-rule(${repeatRule})` : ''
}

const tpTags = (item) => {
  const tags = cleanupStrings(item.tags)
  const priority = item.priority ? `priority-${item.priority}` : ''

  return tags || priority
    ? ` @tags(${tags}${tags && priority ? ', ' : ''}${priority})`
    : ''
}

const tpTitle = (item) => `${cleanupStrings(item.title)}`

////////////////////////////////////////////////////////////////////////////////
// organization helpers ////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

const sortByProjectAndCreation = (a, b) => {
  const aProjectName = cleanupStrings(`${a.folderName} ${a.listName}`)
  const bProjectName = cleanupStrings(`${b.folderName} ${b.listName}`)

  if (aProjectName < bProjectName) return -1
  if (aProjectName > bProjectName) return 1
  if (a.createdTime < b.createdTime) return -1
  if (a.createdTime > b.createdTime) return 1
  return 0
}

const listTasksByProject = (acc, task) => {
  const projectName = tpProject(task).trim()
  if (!acc[projectName]) acc[projectName] = [`\n${projectName}:`]

  const dates = ` ${tpDefer(task)}${tpDue(task)}${tpDone(task)}`
  const meta = ` ${tpFlagged(task)}${tpRepeat(task)}${tpTags(task)}`
  const note = indentString(`${tpNote(task)}`, 1, '\t')
  const each = `\n- ${tpTitle(task)}${dates}${meta}\n${note}`.trim()
  const output = indentString(each, 1, '\t')
  acc[projectName].push(output)

  return acc
}

////////////////////////////////////////////////////////////////////////////////
// csv to json conversion //////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

const file = process.argv[2]

// prettier-ignore
const errors = {
  path: "\nThe file does not exist, try another path.",
  extension: "\nThe file does not have a .csv extension, try another path.",
  version: "\nThis script was designed to support TickTick backup version 7.1. The backup file provided is:"
};

// prettier-ignore
// old headers
// const headers = [ "folderName", "listName", "title", "tags", "content", "isCheckList", "startDate", "dueDate", "reminder", "repeat", "priority", "status", "createdTime", "completedTime", "order", "timezone", "isAllDay", "isFloating", "columnName", "columnOrder", "viewMode" ];

// new headers
const headers=["folderName","listName","title","kind","tags","content","isChecklist","startDate","dueDate","reminder","repeat","priority","status","createdTime","completedTime","order","timezone","isAllDay","isFloating","columnName","columnOrder","viewMode","taskId","parentId"]


const reportError = (message, arg) => {
  console.error('\x1b[31m', errors[message], arg)

  return
}

const convertCsvToJson = (data) => {
  // first 6 lines of TickTick's backup file are metadata garbage
  //
  // "Date: 2023-12-27+0000"
  // "Version: 7.1"
  // "Status:
  // 0 Normal
  // 1 Completed
  // 2 Archived"
  const lines = data.split('\n')
  lines.shift()
  if (lines[0] !== '"Version: 7.1"')
    reportError('version', lines[0].replace('"', ''))
  lines.splice(0, 5)

  return convert({ noheader: false, headers }).fromString(lines.join('\n'))
}

const parseJson = (json) => {
  const projects = json
    .sort(sortByProjectAndCreation)
    .reduce(listTasksByProject, {})

  const results = Object.values(projects)
    .map((project) => project.join('\n\n'))
    .join('\n\n')

  copy(results, () => {
    console.info('\u001b[32m', '\nThe output has been saved to your clipboard.')

    return
  })
}

fs.readFile(file, 'utf8', async (err, data) => {
  if (err) reportError('path')
  if (path.extname(file) !== '.csv') reportError('extension')

  let result = await convertCsvToJson(data)
  if (result) parseJson(result)
})

const path = require("path");
const fs = require("fs");
const convert = require("csvtojson");
const copy = require("copy-paste").copy;
const datetime = require("luxon").DateTime;
const indentString = require("indent-string");

////////////////////////////////////////////////////////////////////////////////
// general helpers /////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

const cleanupStrings = (value, fallback = "") => {
  return String(value).trim() || fallback;
};

const reformatDates = (ttDateTime, ttTimezone) => {
  if (!ttDateTime || !datetime.fromISO(ttDateTime).isValid) return null;
  // NOTE: TickTick is providing timestamps in UTC so we want to be explicit
  const parsedToUTC = datetime.fromISO(ttDateTime).toUTC();
  // NOTE: We can set the zone on that newly-parsed time based on the zone
  // coming from TickTick. If zone is invalid result falls back to .local() zone
  const utcToLocal = parsedToUTC.setZone(ttTimezone);

  return utcToLocal.toFormat("MM/dd/yyyy h:mm:ss a");
};

const keyToCamelCase = (key) => {
  return key
    .toLowerCase()
    .split(" ")
    .map((w, i) => (!!i ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join("");
};

const toContext = (text) => {
    if (/#[\d\w.-]+/.test(text)) {
        return text.replace(/#([\d\w.-]+)/g, "@context($1)");
    }
    return "";
};


const convert = (item) => {
    const title = item["Title"];
    const content = String(item["Content"] || "").split("\n").map(line => {
        return line.replace(/^-/, "")
    }).join("\n");
    const status = item["Status"];
    const isCompleted = status === 2;
    const date = item["Completed Time"];
    const completedTag = date && isCompleted ? `@done(${moment(date).format("YYYY-MM-DD hh:mm")})` : "";
    return `- ${title.trim()} ${toContext(title)} ${completedTag}
${indentString(content, 1, "\t")}
`;
};

const results = data.map(item => convert(item));
console.log(results.join("\n"));

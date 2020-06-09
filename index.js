const path = require("path");
const fs = require("fs");
const convert = require("csvtojson");
const copy = require("copy-paste").copy;
const datetime = require("luxon").DateTime;
const indentString = require("indent-string");

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

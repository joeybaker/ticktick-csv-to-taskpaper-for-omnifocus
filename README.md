# TickTick Backup CSV to Taskpaper (to OmniFocus).

OmniFocus supports TaskPaper import, so this project is configured to take in a TickTick backup CSV file, convert it to TaskPaper, and save the output to the device's clipboard. The clipboard contents can then be pasted into the OmniFocus Project perspective to import all tasks, including the creation of projects (previously TickTick folders).

- [OmniFocus TaskPaper Reference Guide - Support - The Omni Group](https://support.omnigroup.com/omnifocus-taskpaper-reference/ "OmniFocus TaskPaper Reference Guide - Support - The Omni Group")

## Important

TickTick backups DO NOT include file attachments, so they cannot be referenced or included in this conversion to TaskPaper for OmniFocus. You'll need to download/copy files from within the TickTick app directly if you wish to retain them.

## Usage

1. Login to your TickTick account via the [webapp](https://ticktick.com/webapp).
2. Press the avatar/username in the top left corner of the webapp and select ["Settings" from the dropdown](https://ticktick.com/webapp/#settings).
3. Press ["Backup"](https://ticktick.com/webapp/#settings/backup) in the sidebar.
4. Press the "Generate Backup" button and wait for the resulting file to download.
5. Clone this project and in your terminal, run `cd ./path/to/project/files/were/saved`.
6. In your terminal, install the package and necessary dependencies by running `npm install` or `yarn install`.
7. In your terminal, process the .csv backup file by running `node index.js ../path/to/ti ktick/backup/file`.
8. If the conversion encounters any errors, you'll see red text output in the terminal describing the error that occured.
9. If the converstion did not encounter any obvious errors, you'll see the output `The output has been saved to your clipboard.` in your terminal, and the TaskPaper output will have been saved to your clipboard.
10. If the conversion was successful, open the OmniFocus application, then open the "Projects" perspective, click below any existing tasks in the body of the view body and paste (on a Mac `⌘-V`, on a PC `control-V`, on via the application menu `Edit > Paste`) -- After a moment or two you should see the Projects list populated with your tasks, including the creating of any Projects (formerly TickTick Folders) they were nested within.

## Changelog

See [Releases page](https://github.com/katesowles/ticktick-to-omnifocus/releases).

## Contributing

Pull requests and stars are always welcome.

For bugs and feature requests, [please create an issue](https://github.com/katesowles/ticktick-to-omnifocus/issues).

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## Author

- [github/katesowles](https://github.com/katesowles)
- [twitter/kateypical](https://twitter.com/kateypical)

## License

MIT © katesowles

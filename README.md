![Logo](https://apspace.apu.edu.my/assets/icon/apspace-logo-black-text.svg)

APSpace is an open source application that provides convenient access to important information and to most of APU services. We always welcome any Pull Request for Features, Bug Fixes and more. When contributing you are required to adhere to our code practice and requirements in order for your Pull Request to be accepted

## ðŸ”— Useful Links

[Download on Google Play Store](https://play.google.com/store/apps/details?id=my.edu.apiit.apspace)

[Download on Apple Store](https://apps.apple.com/us/app/apspace/id1413678891)

[APSpace Website](https://apspace.apu.edu.my/)

## Requirements

- NodeJS installed

- Angular CLI installed

- Ionic CLI installed

### Setup & Running Locally

- [Download the installer](https://nodejs.org/) for the LTS version of Node.js. This is the best way to also [install npm](https://blog.npmjs.org/post/85484771375/how-to-install-npm#_=_).
- Fork this repository.
- Clone your fork.
- Create a new branch from `master` for your feature.
- `npm install` to install all dependencies from `package.json`
- `ionic serve` to run the Ionic Project

## Contributing

Contributions are always welcome! Below are some useful information so your Pull Request is accepted.

- Fix `ng lint` errors before commit (included in pre-commit hooks)
- When commiting, ensure your commit message follows the [Conventional Commit Message](https://github.com/conventional-changelog/conventional-changelog/blob/a5505865ff3dd710cf757f50530e73ef0ca641da/conventions/angular.md)
- To update the APSpace version, run `bin/bump` from the terminal

## Other Useful Information

- You may encounter an issue when running `npm install` from your terminal. To fix this just delete the `node_modules` folder and run `npm install` again

- When creating a variable in the `.ts` file ensure the name is camel case (ie myVariable)

- When creating an Observable variable please include `$` at the end of your variable to differenciate with other variables (ie myObservable$)

- Ensure that you are using `async` on the `html` template to automatically subscribe to the observable. Do not manually subscribe your observable in the `.ts` file as it may cause memory leaks.

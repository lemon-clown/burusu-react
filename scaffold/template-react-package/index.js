const fs = require('fs')
const path = require('path')
const semverRegex = require('semver-regex')
const manifest = require('./package.json')


module.exports = function (plop) {
  plop.setGenerator('ts-react-package', {
    description: 'create template typescript+react project',
    prompts: [
      {
        type: 'input',
        name: 'packageName',
        message: 'name',
        transform: (text) => text.trim(),
      },
      {
        type: 'input',
        name: 'packageAuthor',
        message: 'author',
        default: (answers) => {
          // detect package.json
          const packageJsonPath = path.resolve(process.cwd(), 'package.json')
          if (fs.existsSync(packageJsonPath)) {
            const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8')
            const packageJson = JSON.parse(packageJsonContent)
            if (packageJson.author == null) return undefined
            if (typeof packageJson.author === 'string') return packageJson.author
            if (typeof packageJson.author.name === 'string') return packageJson.author.name
          }
          return undefined
        },
        transform: (text) => text.trim(),
      },
      {
        type: 'input',
        name: 'packageVersion',
        message: 'version',
        default: manifest.version,
        transform: (text) => text.trim(),
        validate: (text) => semverRegex().test(text),
      },
      {
        type: 'input',
        name: 'packageLocation',
        message: ({ packageName }) => 'location of ' + packageName,
        default: (answers) => {
          // detect lerna
          if (fs.existsSync(path.resolve(process.cwd(), 'lerna.json'))) {
            answers.isLernaProject = true
            answers.projectName = answers.packageName.startsWith('@')
              ? /^@([^\/\s]+)/.exec(answers.packageName)[1]
              : /^([^\-\s]+)/.exec(answers.packageName)[1]
            answers.componentName = answers.packageName.startsWith('@')
              ? /^@[^\/\s]+[\/]([^\/\s]+)/.exec(answers.packageName)[1]
              : /^([^\-\s]+)/.exec(answers.packageName)[1]
            return 'packages/' + answers.packageName.replace(/^[^\/]+[\/]/, '')
          }
          answers.projectName = answers.packageName.replace(/^@/, '').replace('\/', '-')
          return packageName.replace(/^@/, '')
        },
        transform: (text) => text.trim(),
      },
    ],
    actions: function (answers) {
      const resolveSourcePath = (p) => path.normalize(path.resolve(__dirname, 'boilerplate', p))
      const resolveTargetPath = (p) => path.normalize(path.resolve(answers.packageLocation, p))

      return [
        {
          type: 'add',
          path: resolveTargetPath('.eslintrc.js'),
          templateFile: resolveSourcePath('.eslintrc.js.hbs')
        },
        {
          type: 'add',
          path: resolveTargetPath('package.json'),
          templateFile: resolveSourcePath('package.json.hbs')
        },
        {
          type: 'add',
          path: resolveTargetPath('README.md'),
          templateFile: resolveSourcePath('README.md.hbs')
        },
        {
          type: 'add',
          path: resolveTargetPath('rollup.config.js'),
          templateFile: resolveSourcePath('rollup.config.js.hbs')
        },
        {
          type: 'add',
          path: resolveTargetPath('tsconfig.json'),
          templateFile: answers.isLernaProject
            ? resolveSourcePath('tsconfig.json.hbs')
            : resolveSourcePath('tsconfig.full.json.hbs')
        },
        {
          type: 'add',
          path: resolveTargetPath('src/index.tsx'),
          templateFile: resolveSourcePath('src/index.tsx.hbs')
        },
        {
          type: 'add',
          path: resolveTargetPath('src/component.tsx'),
          templateFile: resolveSourcePath('src/component.tsx.hbs')
        },
        {
          type: 'add',
          path: resolveTargetPath('src/style/index.styl'),
          templateFile: resolveSourcePath('src/style/index.styl.hbs')
        },
        {
          type: 'add',
          path: resolveTargetPath('src/style/index.styl.d.ts'),
          templateFile: resolveSourcePath('src/style/index.styl.d.ts.hbs')
        },
      ].filter(Boolean)
    }
  })
}

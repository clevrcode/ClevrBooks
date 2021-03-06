# ClevrBooks
Accounting app with Vue.js and Node.js/Express

1. Create repository on GitHub
2. clone repo on a local directory
3. edit README.md, commit and push back to GitHub


## Server

1. Create a folder in the project tree (mkdir server)

2. Within this folder, install nodemon and eslint
    ```sh
    > npm install -g nodemon
    ```

3. Initialize the node project
    ```sh
    > npm init
    ```
    
    >package name: (server)
    version: (1.0.0)
    description: Backend Server for ClevrBooks app
    entry point: (.eslintrc.js) src/app.js
    test command:
    git repository:
    keywords:
    author: Claude Vaillancourt
    license: (ISC) MIT
    About to write to C:\Users\vaill\Documents\work\WebProjects\ClevrBooks\server\package.json:
    >
    >{
        "name": "server",
        "version": "1.0.0",
        "description": "Backend Server for ClevrBooks app",
        "main": "src/app.js",
        "scripts": {
            "test": "echo \"Error: no test specified\" && exit 1"
        },
        "author": "Claude Vaillancourt",
        "license": "MIT"
    }
    >
    >    Is this OK? (yes)

4. Install eslint:
    ```sh
    > npm install --save-dev eslint
    ```

5. Add following lines to package.json

    >"scripts": {
        "start": "nodemon --verbose",
        "lint": "eslint **/*.js",
        "init": "eslint --init",
        "test": "echo \"Error: no test specified\" && exit 1"
    },

    Then, run:
    ```sh
    >npm run init
    ```

    > server@1.0.0 init C:\Users\vaill\Documents\work\WebProjects\ClevrBooks\server
    
    ```sh
    > eslint --init
    ```

    √ How would you like to use ESLint? · problems
    √ What type of modules does your project use? · esm
    √ Which framework does your project use? · none
    √ Does your project use TypeScript? · No / Yes
    √ Where does your code run? · browser
    √ What format do you want your config file to be in? · JavaScript
    Successfully created .eslintrc.js file in ClevrBooks\server

6. Add a .gitignore file

    >.DS_Store
    node_modules

    >\# Log files
    npm-debug.log*

    >\# Editor directories and files
    .vscode
    *.suo
    \*.ntvs\*
    *.njsproj
    *.sln
    *.sw?


7. Create a ./src folder and add a dummy app.js file
    ```hs
    console.log('Hello World!')
    ```

8. Commit current state and push to GitHub

9. Install express, body-parser, cors and morgan

    ```hs
    >npm install --save express body-parser cors morgan
    ```
    >npm WARN server@1.0.0 No repository field.

    >\+ body-parser@1.19.0
    \+ cors@2.8.5
    \+ express@4.17.1
    \+ morgan@1.10.0
    added 64 packages from 39 contributors and audited 156 packages in 2.625s

    >13 packages are looking for funding
    run 'npm fund' for details

    >found 0 vulnerabilities

## License

MIT


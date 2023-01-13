# CS340 Library Management System (Group 4)
Adrian Melendrez and Christopher LeMoss

## Pages
| Subdirectory      | Entity             |`INSERT`|`SELECT`| Misc.  |
|-------------------|--------------------|--------|--------|--------|
|  /                |  N/A               |        |        |        |
|  /books           |  Books             |   ✓   |    ✓   |Search / filter<br>`UPDATE`: Able to NULL author_id FK|
|  /readers         |  Readers           |   ✓   |    ✓   |`UPDATE`|
|  /borrowed        |  BorrowedBooks     |   ✓   |    ✓   |`DELETE`|
|  /authors         |  Authors           |   ✓   |    ✓   |        |
|  /classifcations  |  Classifications   |   ✓   |    ✓   |        |
|  /subjects        |  Subjects          |   ✓   |    ✓   |        |


## How to Run
1. Finish [Setup](#setup) step
2. [Upgrade Node](#handlebars) for handlebars (engineering server uses an old version) 
3. Run `node app.js` (note port number)
4. Open `localhost:{port}` in browser where `port` is from step above
5. If no signal, forward the `port` under the "PORTS" tab of VSCode (between "TERMINAL" and "DEBUG CONSOLE")
   
## Setup
1. SSH to engineering servers (`ssh flip1.engr.oregonstate.edu`)
2. Clone repository (`git clone {url}`) to desired directory
3. Install dependencies from `package.json` (`npm install`)
4. Create file `credentials.js` with username, password, and database name as follows:
   
        const credentials = {
            username: 'cs340_{osu-username}',
            password: '{last 4 digits of student ID}',
            database: 'cs340_{osu-username}'
        };
        export default credentials;
        
5. Setup [VS Code Remote SSH](#vs-code-remote-ssh) (optional)

## VS Code Remote SSH
I think we need to be on the engineering servers to connect to the school's database, but coding in Vim sucks. So...
1. Install [VS Code](https://code.visualstudio.com/download)
2. Open VS code extensions (Ctrl + Shift + X)
3. Install "Remote - SHH"
4. Follow [this guide](https://code.visualstudio.com/docs/remote/ssh#_connect-to-a-remote-host)
5. If connection hangs, open settings of the extension and set `remote.SSH.showLoginTerminal: true`

## Handlebars
Handlebars throws an error (`TypeError: (0, util_1.promisify) is not a function`) unless using a more recent version of Node.
1. From engineering servers, `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh` to install [NVM](https://github.com/nvm-sh/nvm#install-script)
2. Restart Bash to ensure `command -v nvm` echoes `nvm`
3. Upgrade Node with NVM (e.g., `nvm install 17`)

## Importing into Database
1. SSH into engineering servers
2. Navigate to directory with the `ddl.sql` (Data Description Language) file
3. Enter `mysql -u cs340_{osu-username} -h classmysql.engr.oregonstate.edu -p` to start MariaDB (password should be last 4 digits of student ID)
4. Enter `USE cs340_{osu-username};` to open personal database
5. Enter `source ./ddl.sql;` to import the file

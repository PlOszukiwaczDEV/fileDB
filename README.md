# fileDB
![GitHub commit activity](https://img.shields.io/github/commit-activity/w/PlOszukiwaczDEV/fileDB)
![GitHub last commit](https://img.shields.io/github/last-commit/PlOszukiwaczDEV/fileDB)


A very **unsecure** database that uses files.

# File structure
- `/db` - The source code for the **database**.
- `/client` - A example client for the **database**. (Not finished)

# Setup
## Windows and Linux
1. Download [bun](https://bun.sh/)
2. Run `cd db`
3. Run `bun install`

# Running the database
1. Navigate to the `/db` folder.
2. Run the command `bun index.js`.

# Expected Outputs
- A file named `.env` will be created containing:
    - AES Key
    - AES IV
    - AES Algorithm
- A folder named `/databases` will be created containing two files:
    - `info.json`: Contains public information such as rank, flag, and avatar (as numbers).
    - `passwords.json`: Contains AES encrypted SHA-256 hashes of passwords.

# ToDo
- [ ] Example Client
- [ ] Gui Database Editor
- [ ] Gui Editor

## License

[![License: CC0 1.0 Universal](https://img.shields.io/github/license/PlOszukiwaczDEV/fileDB)](https://creativecommons.org/publicdomain/zero/1.0/legalcode.en)
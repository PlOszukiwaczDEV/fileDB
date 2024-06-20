# fileDB
A very unsecure database that uses files.

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
2. Run the command `bun index`.

# Expected Outputs
- A file named `.env` will be created containing:
    - AES Key
    - AES IV
    - AES Algorithm
- A folder named `/databases` will be created containing two files:
    - `info.json`: Contains public information such as rank, flag, and avatar (as numbers).
    - `passwords.json`: Contains AES encrypted SHA-256 hashes of passwords.
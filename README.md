# shorty
A simple Django url shortner built using GraphQL.

![stats](imgs/stats.png)

## Features

1. Easy to use
2. Simple GraphQL API
3. QR Code Generation
4. Fast (LRU caching using Redis)
5. Data collections and visualization
    - OS type
    - Device type
    - Browser type
    - IP addresses
    - Clicks per day

## Technology Used

| # | Name    | Usage        |
|---|---------|--------------|
| 1 | GraphQL | API          |
| 2 | Redis   | Caching      |
| 3 | MySQL   | Database     |
| 4 | jQuery  | Web frontend |
| 5 | Django  | View logic   |

## Installation

Install [Redis](https://redis.io/) and [MySQL](https://www.mysql.com/) for your *nix box.

Install requirements.

```shell script
$ pip install -r requirements.txt
```

Create a MySQL database with the name `shorty` and run the [`install.sh`](install.sh) script from the project root 
directory and enter the relevant information.

```shell script
$ mysql -u root -p
mysql> CREATE DATABASE shorty; exit;
$ ./install.sh
Generating secret key... done.
Database username: root
Database password: ****
Making migrations... done.
Migrating... done.
```

Run the server and visit the [url](http://localhost:8000) in your browser.

```shell script
$ ./manage.py runserver
Performing system checks...

System check identified no issues (0 silenced).
June 05, 2020 - 00:12:28
Django version 3.0.7, using settings 'shorty.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CONTROL-C.
```

## Usage

![recording](imgs/recording.gif)

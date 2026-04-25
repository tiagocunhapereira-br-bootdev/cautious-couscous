# Gator CLI

Gator CLI is a command-line interface tool inspired by the Boot.dev guided project. It allows users to manage RSS feeds, user accounts, and feed subscriptions efficiently from the terminal. The tool supports user registration, login, feed management, and periodic feed aggregation.

Table of Contents

About  
Features  
Installation  
Usage  
Commands  
Configuration  
Contributing  
License  
Acknowledgements


About
Gator CLI is designed to help users subscribe to and manage RSS feeds directly from the command line. It supports multiple users, feed following/unfollowing, and periodic aggregation of feed content. This project is based on the Boot.dev guided project and uses a local database to store users and feeds.

Features

User registration and login system  
Add, list, follow, and unfollow RSS feeds  
View all feeds and currently followed feeds  
Periodic aggregation of feeds with configurable intervals  
Browse feed content (requires login)  
Reset user database for fresh start


Installation
Clone the repository and install dependencies:
git clone https://github.com/tiago-cunha-pereira-br-bootdev/gator.git
cd gator
npm install

(Adjust installation instructions if you use a different package manager or build system)

Usage
Run the CLI with a command and optional arguments:
node dist/index.js <command> [args]

Example:
node dist/index.js register alice
node dist/index.js login alice
node dist/index.js addfeed "Tech News" "https://technews.example.com/rss"
node dist/index.js feeds
node dist/index.js follow "https://technews.example.com/rss"
node dist/index.js agg 5m


Commands



Command
Arguments
Description
Requires Login



register
<username>

Register a new user with the specified username


login
<username>

Log in as an existing user



reset
None

Reset the user database (deletes all users)


users
None

List all registered users, marking the current logged-in user



addfeed
<feed name> <feed url>

Add a new RSS feed and follow it


feeds
None

List all feeds in the system



follow
<feed url>

Follow an existing feed by URL


unfollow
<feed url>

Unfollow a feed by URL



following
None

List all feeds the current user is following



agg
<time_between_reqs>

Aggregate feeds periodically, with interval specified in seconds (s), minutes (m), or hours (h)



browse
None

Browse feed content interactively (implementation detail, requires login)




Configuration

The CLI stores the current logged-in user in a local configuration file. No additional configuration is required to start, but you must be logged in to use commands that modify or access user-specific data.

Contributing

Contributions are welcome! Please follow these steps:

Fork the repository  
Create a feature branch (git checkout -b feature-name)  
Commit your changes (git commit -m 'Add some feature')  
Push to the branch (git push origin feature-name)  
Open a pull request

Please ensure your code follows the existing style and includes tests where applicable.

License

This project currently does not have a license. All rights reserved by the author. If you want to use, modify, or distribute this project, please contact the repository owner for permission.

Acknowledgements

Inspired by the Boot.dev guided project  
Thanks to the open-source community for libraries and tools

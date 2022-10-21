# `chef-node` Change Log

This file describes the changes made in each version of the node `chef` package

## 1.0.0

- Added Changelog
- Package maintainence taken over by Josh Gitlin <josh.gitlin+npm@certara.com>
- Converted to use Promises instead of the deprecated Request module (Breaking change)
- Added `chef.req` method which exposes the request, response and body objects;
  changed HTTP Verb methods (`get`, `put`, `post`, `delete` etc) to only return
  deserialized JSON response from the Chef server. (Breaking change)
- Fixed tests

## 0.x versions

- Maintained by @samgentle and others; no specific Changelogs available
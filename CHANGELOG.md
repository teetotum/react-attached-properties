# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 0.0.1 - 2021-06-13
### Added
- initial project setup
- core functionality to define, retrieve, and clear attached properties
- util functionality to recursively iterate over children, safely supporting Container-in-Container scenario

## 0.0.2 - 2021-06-22
### Changed
- cleared properties that are rendered into DOM attributes will show "UNSET_VALUE" instead of "[object Object]"

### Fixed
- resolved error 'invalid attribute name' that was caused by leading digits in the generated property names

#!/usr/bin/env zx

import pkg from './package.json'
import { $ } from 'zx'

console.log('Clearing old rpms')
await $`rm -rf ./rpms`

console.log('Building sensible')
await $`bun build:exe`

console.log(`Creating RPM package for sensible version ${pkg.version}`)
await $`fpm -s dir -t rpm -n sensible -v ${pkg.version} ./bin/sensible=/usr/bin/sensible`

console.log('Moving RPM package to rpms folder')
await $`mkdir rpms`
await $`mv *.rpm rpms/`
